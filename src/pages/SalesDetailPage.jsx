import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Printer,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useApp } from "../context/AppContext";
import { usePermissions } from "../context/PermissionsContext";
import Portal from "../components/ui/Portal";
import "./SalesDetailPage.css";

export default function SalesDetailPage() {
  const { transNo } = useParams();
  const navigate = useNavigate();
  const { getCurrentPrice, products, loadSales } = useApp();
  const { canAdd, canEdit, canDelete, isSuperAdmin } = usePermissions();

  const [loading, setLoading] = useState(true);
  const [sale, setSale] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [error, setError] = useState(null);
  const [priceMap, setPriceMap] = useState(new Map());

  // Modal states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Add product form state
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productQuantity, setProductQuantity] = useState(1);
  const [addLoading, setAddLoading] = useState(false);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editLoading, setEditLoading] = useState(false);

  // Load price map once for performance
  useEffect(() => {
    const loadPrices = async () => {
      const { data: prices } = await supabase
        .from("pricehist")
        .select("prodcode, unitprice")
        .order("effdate", { ascending: false });

      const map = new Map();
      prices?.forEach((p) => {
        if (!map.has(p.prodcode)) {
          map.set(p.prodcode, Number(p.unitprice) || 0);
        }
      });
      setPriceMap(map);
    };
    loadPrices();
  }, []);

  // Optimized single query to load all data
  const loadSaleDetailsData = useCallback(async () => {
    try {
      // Single query with all joins - MUCH FASTER
      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .select(
          `
          transno,
          salesdate,
          custno,
          empno,
          record_status,
          stamp,
          customer:custno (custno, custname, address, payterm),
          employee:empno (empno, firstname, lastname),
          salesdetail!inner (
            transno,
            prodcode,
            quantity,
            record_status,
            product:prodcode (prodcode, description, unit)
          )
        `,
        )
        .eq("transno", transNo)
        .eq("salesdetail.record_status", "ACTIVE")
        .single();

      if (saleError) throw saleError;

      if (!saleData) {
        setError(`Transaction ${transNo} not found.`);
        return;
      }

      // Process sale header
      setSale({
        transno: saleData.transno,
        salesdate: saleData.salesdate,
        custno: saleData.custno,
        custname: saleData.customer?.custname || "Unknown",
        custaddress: saleData.customer?.address,
        custpayterm: saleData.customer?.payterm,
        empno: saleData.empno,
        empname: saleData.employee
          ? `${saleData.employee.lastname}, ${saleData.employee.firstname}`
          : "Unknown",
        record_status: saleData.record_status,
        stamp: saleData.stamp,
      });

      // Process line items with prices
      const details = saleData.salesdetail || [];
      const itemsWithPrices = details.map((item, index) => {
        const unitPrice = priceMap.get(item.prodcode) || 0;
        const quantity = Number(item.quantity) || 0;
        const total = quantity * unitPrice;
        const product = item.product || {};

        return {
          key: `${item.transno}-${item.prodcode}-${index}`,
          prodcode: item.prodcode,
          description: product.description || item.prodcode,
          unit: product.unit || "pc",
          quantity: quantity,
          unitPrice: unitPrice,
          total: total,
        };
      });

      setLineItems(itemsWithPrices);
    } catch (err) {
      console.error("Error loading sale details:", err);
      setError(err.message || "Failed to load transaction details");
    } finally {
      setLoading(false);
    }
  }, [transNo, priceMap]);

  useEffect(() => {
    if (transNo && priceMap.size > 0) {
      loadSaleDetailsData();
    } else if (transNo && priceMap.size === 0) {
      const timer = setTimeout(() => {
        if (priceMap.size > 0) loadSaleDetailsData();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [transNo, priceMap, loadSaleDetailsData]);

  // Add product to transaction
  const handleAddProduct = async () => {
    if (!selectedProduct) {
      setError("Please select a product");
      return;
    }

    setAddLoading(true);
    setError("");

    try {
      const existingItem = lineItems.find(
        (item) => item.prodcode === selectedProduct,
      );
      if (existingItem) {
        setError("Product already exists. Edit quantity instead.");
        setAddLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from("salesdetail").insert({
        transno: transNo,
        prodcode: selectedProduct,
        quantity: productQuantity,
        record_status: "ACTIVE",
        stamp: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      await loadSaleDetailsData();
      await loadSales();
      setShowAddProductModal(false);
      setSelectedProduct("");
      setProductQuantity(1);
    } catch (err) {
      setError(err.message || "Failed to add product");
    } finally {
      setAddLoading(false);
    }
  };

  // Edit line item quantity
  const handleEditItem = async () => {
    if (!editingItem) return;

    setEditLoading(true);
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("salesdetail")
        .update({ quantity: editQuantity })
        .eq("transno", transNo)
        .eq("prodcode", editingItem.prodcode);

      if (updateError) throw updateError;

      await loadSaleDetailsData();
      await loadSales();
      setEditingItem(null);
    } catch (err) {
      setError(err.message || "Failed to update quantity");
    } finally {
      setEditLoading(false);
    }
  };

  // Delete line item
  const handleDeleteItem = async (prodcode) => {
    if (!window.confirm(`Remove product ${prodcode} from this transaction?`))
      return;

    try {
      const { error: deleteError } = await supabase
        .from("salesdetail")
        .update({ record_status: "DELETED" })
        .eq("transno", transNo)
        .eq("prodcode", prodcode);

      if (deleteError) throw deleteError;

      await loadSaleDetailsData();
      await loadSales();
    } catch (err) {
      setError(err.message || "Failed to remove product");
    }
  };

  const grandTotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const totalItems = lineItems.length;

  const canModify = () => {
    return (
      (canAdd() || canEdit() || canDelete() || isSuperAdmin()) &&
      sale?.record_status === "ACTIVE"
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 size={24} className="spin" />
        <p>Loading transaction details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate("/sales")}>
          Back to Transactions
        </button>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="error-container">
        <h3>Transaction Not Found</h3>
        <p>Transaction {transNo} does not exist.</p>
        <button className="btn btn-primary" onClick={() => navigate("/sales")}>
          Back to Transactions
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="detail-header">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/sales")}
        >
          <ArrowLeft size={16} /> Back to Transactions
        </button>
        <button className="btn btn-secondary" onClick={() => window.print()}>
          <Printer size={16} /> Print
        </button>
      </div>

      {/* Sale Information Card */}
      <div className="detail-card">
        <h2>Sale Detail</h2>
        <div className="detail-grid">
          <div className="detail-group">
            <label>Transaction No:</label>
            <span>{sale.transno}</span>
          </div>
          <div className="detail-group">
            <label>Sales Date:</label>
            <span>{new Date(sale.salesdate).toLocaleDateString()}</span>
          </div>
          <div className="detail-group">
            <label>Status:</label>
            <span
              className={`badge ${sale.record_status === "ACTIVE" ? "badge-green" : "badge-red"}`}
            >
              {sale.record_status}
            </span>
          </div>
        </div>
      </div>

      {/* Customer & Employee Info */}
      <div className="detail-card">
        <h3>Customer Information</h3>
        <div className="detail-grid">
          <div className="detail-group">
            <label>Customer Code:</label>
            <span>{sale.custno}</span>
          </div>
          <div className="detail-group">
            <label>Customer Name:</label>
            <span>{sale.custname}</span>
          </div>
          <div className="detail-group">
            <label>Address:</label>
            <span>{sale.custaddress || "—"}</span>
          </div>
          <div className="detail-group">
            <label>Pay Term:</label>
            <span>{sale.custpayterm || "—"}</span>
          </div>
        </div>

        <h3>Employee Information</h3>
        <div className="detail-grid">
          <div className="detail-group">
            <label>Employee Code:</label>
            <span>{sale.empno}</span>
          </div>
          <div className="detail-group">
            <label>Employee Name:</label>
            <span>{sale.empname}</span>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="detail-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h3>Line Items ({totalItems} items)</h3>
          {(canAdd() || isSuperAdmin()) && sale.record_status === "ACTIVE" && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddProductModal(true)}
            >
              <Plus size={14} /> Add Product
            </button>
          )}
        </div>
        <div className="table-wrap">
          <table className="detail-table">
            <thead>
              <tr>
                <th>Product Code</th>
                <th>Description</th>
                <th>Unit</th>
                <th style={{ textAlign: "right" }}>Quantity</th>
                <th style={{ textAlign: "right" }}>Unit Price</th>
                <th style={{ textAlign: "right" }}>Total</th>
                {canModify() && (
                  <th style={{ textAlign: "center" }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.key}>
                  <td>{item.prodcode}</td>
                  <td>{item.description}</td>
                  <td>{item.unit}</td>
                  <td style={{ textAlign: "right" }}>{item.quantity}</td>
                  <td style={{ textAlign: "right" }}>
                    ${item.unitPrice.toLocaleString()}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>
                    ${item.total.toLocaleString()}
                  </td>
                  {canModify() && (
                    <td style={{ textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 5,
                          justifyContent: "center",
                        }}
                      >
                        {(canEdit() || isSuperAdmin()) && (
                          <button
                            className="btn-icon"
                            title="Edit Quantity"
                            onClick={() => {
                              setEditingItem(item);
                              setEditQuantity(item.quantity);
                            }}
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        {(canDelete() || isSuperAdmin()) && (
                          <button
                            className="btn-icon delete-btn"
                            title="Remove"
                            style={{ color: "var(--red)" }}
                            onClick={() => handleDeleteItem(item.prodcode)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {lineItems.length === 0 && (
                <tr>
                  <td
                    colSpan={canModify() ? 7 : 6}
                    style={{ textAlign: "center", padding: 32 }}
                  >
                    No line items found for this transaction.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="5" style={{ textAlign: "right", fontWeight: 600 }}>
                  Grand Total ({totalItems} items):
                </td>
                <td
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: "var(--accent)",
                    textAlign: "right",
                  }}
                >
                  ${grandTotal.toLocaleString()}
                </td>
                {canModify() && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <Portal>
          <div
            className="modal-overlay"
            onClick={() => setShowAddProductModal(false)}
          >
            <div
              className="modal modal-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Add Product to Transaction</h3>
                <button
                  className="btn-icon"
                  onClick={() => setShowAddProductModal(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                {error && (
                  <div
                    style={{
                      color: "red",
                      marginBottom: 16,
                      padding: 10,
                      background: "#fee2e2",
                      borderRadius: 8,
                    }}
                  >
                    {error}
                  </div>
                )}
                <div className="form-group">
                  <label>Select Product</label>
                  <select
                    className="form-input"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    <option value="">Choose a product...</option>
                    {products.map((p) => (
                      <option key={p.prodcode} value={p.prodcode}>
                        {p.prodcode} - {p.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    value={productQuantity}
                    onChange={(e) => setProductQuantity(Number(e.target.value))}
                    min="1"
                  />
                </div>
                {selectedProduct && (
                  <div
                    style={{
                      marginTop: 16,
                      padding: 12,
                      background: "#f3f4f6",
                      borderRadius: 8,
                    }}
                  >
                    <p>
                      <strong>Price:</strong> $
                      {(
                        getCurrentPrice(selectedProduct)?.unitprice || 0
                      ).toLocaleString()}
                    </p>
                    <p>
                      <strong>Total:</strong> $
                      {(
                        (getCurrentPrice(selectedProduct)?.unitprice || 0) *
                        productQuantity
                      ).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowAddProductModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAddProduct}
                  disabled={addLoading}
                >
                  {addLoading ? (
                    <Loader2
                      size={14}
                      style={{ animation: "spin 0.7s linear infinite" }}
                    />
                  ) : (
                    "Add Product"
                  )}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Edit Quantity Modal */}
      {editingItem && (
        <Portal>
          <div className="modal-overlay" onClick={() => setEditingItem(null)}>
            <div
              className="modal modal-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Edit Quantity: {editingItem.prodcode}</h3>
                <button
                  className="btn-icon"
                  onClick={() => setEditingItem(null)}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Product</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingItem.description}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Unit Price</label>
                  <input
                    type="text"
                    className="form-input"
                    value={`$${editingItem.unitPrice.toLocaleString()}`}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(Number(e.target.value))}
                    min="1"
                  />
                </div>
                <div
                  style={{
                    marginTop: 16,
                    padding: 12,
                    background: "#f3f4f6",
                    borderRadius: 8,
                  }}
                >
                  <p>
                    <strong>New Total:</strong> $
                    {(editingItem.unitPrice * editQuantity).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleEditItem}
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <Loader2
                      size={14}
                      style={{ animation: "spin 0.7s linear infinite" }}
                    />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
