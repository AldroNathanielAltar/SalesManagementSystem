import { useState, useEffect } from "react";
import { X, Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useApp } from "../../context/AppContext";
import Portal from "../../components/ui/Portal";
import "./Modal.css";

export default function AddSaleModal({ onClose }) {
  const {
    addSale,
    addDetailLine,
    customers,
    employees,
    products,
    getCurrentPrice,
    loadSales,
  } = useApp();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [lineItems, setLineItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productQuantity, setProductQuantity] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [savingMessage, setSavingMessage] = useState("");

  const [saleData, setSaleData] = useState({
    transno: "",
    salesdate: new Date().toISOString().split("T")[0],
    custno: "",
    empno: "",
  });

  // Lock body scroll when modal opens
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Generate transaction number
  useEffect(() => {
    const generateTransNo = async () => {
      const { data } = await supabase
        .from("sales")
        .select("transno")
        .order("transno", { ascending: false })
        .limit(1);

      const lastTransNo = data?.[0]?.transno || "TRX0000";
      const num = parseInt(lastTransNo.replace("TRX", "")) + 1;
      setSaleData((prev) => ({
        ...prev,
        transno: `TRX${String(num).padStart(4, "0")}`,
      }));
    };

    generateTransNo();
  }, []);

  // Update selected customer when custno changes
  useEffect(() => {
    const customer = customers.find((c) => c.custno === saleData.custno);
    setSelectedCustomer(customer);
  }, [saleData.custno, customers]);

  // Update selected employee when empno changes
  useEffect(() => {
    const employee = employees.find((e) => e.empno === saleData.empno);
    setSelectedEmployee(employee);
  }, [saleData.empno, employees]);

  const addLineItem = (e) => {
    if (e) e.preventDefault();

    if (!selectedProduct) {
      setError("Please select a product");
      return;
    }

    const product = products.find((p) => p.prodcode === selectedProduct);
    const price = getCurrentPrice(selectedProduct)?.unitprice || 0;

    // Check if product already exists
    const existingItem = lineItems.find(
      (item) => item.prodcode === selectedProduct,
    );
    if (existingItem) {
      setError("Product already added. Edit quantity instead.");
      return;
    }

    setLineItems([
      ...lineItems,
      {
        id: Date.now(),
        prodcode: selectedProduct,
        description: product?.description || selectedProduct,
        unit: product?.unit || "pc",
        quantity: productQuantity,
        unitprice: price,
        total: productQuantity * price,
      },
    ]);

    setSelectedProduct("");
    setProductQuantity(1);
    setError("");
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setLineItems(
      lineItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: newQuantity,
              total: newQuantity * item.unitprice,
            }
          : item,
      ),
    );
  };

  const removeLineItem = (id) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    // Validation
    if (!saleData.custno) {
      setError("Please select a customer");
      return;
    }
    if (!saleData.empno) {
      setError("Please select an employee");
      return;
    }
    if (lineItems.length === 0) {
      setError("Please add at least one product");
      return;
    }

    setSaving(true);
    setError("");
    setSavingMessage("Creating transaction...");

    try {
      // Add the sale header
      setSavingMessage("Saving transaction details...");
      await addSale({
        transno: saleData.transno,
        salesdate: saleData.salesdate,
        custno: saleData.custno,
        empno: saleData.empno,
      });

      // Add each line item
      setSavingMessage("Adding products to transaction...");
      for (let i = 0; i < lineItems.length; i++) {
        const item = lineItems[i];
        setSavingMessage(`Adding product ${i + 1} of ${lineItems.length}...`);
        await addDetailLine({
          transno: saleData.transno,
          prodcode: item.prodcode,
          quantity: item.quantity,
        });
      }

      setSavingMessage("Transaction saved successfully!");

      // Small delay to show success message
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Refresh the sales list
      await loadSales();

      // Close the modal
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save sale. Please try again.");
    } finally {
      setSaving(false);
      setSavingMessage("");
    }
  };

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Transaction</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}

          {saving && (
            <div className="saving-message">
              <Loader2
                size={16}
                style={{ animation: "spin 0.7s linear infinite" }}
              />
              <span>{savingMessage}</span>
            </div>
          )}

          {/* 4x4 Grid Form Layout */}
          <div className="form-grid-4x4">
            <div className="form-group">
              <label htmlFor="transno">Transaction No</label>
              <input
                id="transno"
                name="transno"
                type="text"
                className="form-input"
                value={saleData.transno}
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="salesdate">Sales Date</label>
              <input
                id="salesdate"
                name="salesdate"
                type="date"
                className="form-input"
                value={saleData.salesdate}
                onChange={(e) =>
                  setSaleData({ ...saleData, salesdate: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="custno">Customer</label>
              <select
                id="custno"
                name="custno"
                className="form-input"
                value={saleData.custno}
                onChange={(e) =>
                  setSaleData({ ...saleData, custno: e.target.value })
                }
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c.custno} value={c.custno}>
                    {c.custno} - {c.custname}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="empno">Employee</label>
              <select
                id="empno"
                name="empno"
                className="form-input"
                value={saleData.empno}
                onChange={(e) =>
                  setSaleData({ ...saleData, empno: e.target.value })
                }
              >
                <option value="">Select Employee</option>
                {employees.map((e) => (
                  <option key={e.empno} value={e.empno}>
                    {e.empno} - {e.fullname || `${e.lastname}, ${e.firstname}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer Details Card */}
          {selectedCustomer && (
            <div className="detail-card">
              <h4>Customer Information</h4>
              <div className="detail-grid">
                <div className="detail-group">
                  <label>Customer Code:</label>
                  <span>{selectedCustomer.custno}</span>
                </div>
                <div className="detail-group">
                  <label>Customer Name:</label>
                  <span>{selectedCustomer.custname}</span>
                </div>
                <div className="detail-group">
                  <label>Pay Term:</label>
                  <span>{selectedCustomer.payterm || "—"}</span>
                </div>
                <div className="detail-group full-width">
                  <label>Address:</label>
                  <span>{selectedCustomer.address || "—"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Employee Details Card */}
          {selectedEmployee && (
            <div className="detail-card">
              <h4>Employee Information</h4>
              <div className="detail-grid">
                <div className="detail-group">
                  <label>Employee Code:</label>
                  <span>{selectedEmployee.empno}</span>
                </div>
                <div className="detail-group">
                  <label>Employee Name:</label>
                  <span>
                    {selectedEmployee.lastname}, {selectedEmployee.firstname}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Products Section Header */}
          <div className="products-header">
            <h4>Products</h4>
          </div>

          {/* Add Product Row */}
          <div className="add-product-row">
            <select
              className="form-input product-select"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.prodcode} value={p.prodcode}>
                  {p.prodcode} - {p.description}
                </option>
              ))}
            </select>
            <div className="quantity-wrapper">
              <input
                type="number"
                className="form-input quantity-input"
                value={productQuantity}
                onChange={(e) => setProductQuantity(Number(e.target.value))}
                min="1"
              />
            </div>
            <button
              type="button"
              className="btn btn-primary add-product-btn"
              onClick={addLineItem}
            >
              <Plus size={14} /> Add Product
            </button>
          </div>

          {/* Line Items Table */}
          {lineItems.length > 0 ? (
            <div className="table-wrap">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Product Code</th>
                    <th>Description</th>
                    <th>Unit</th>
                    <th className="text-right">Quantity</th>
                    <th className="text-right">Unit Price</th>
                    <th className="text-right">Total</th>
                    <th className="text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.prodcode}</td>
                      <td>{item.description}</td>
                      <td>{item.unit}</td>
                      <td className="text-right">
                        <input
                          type="number"
                          className="quantity-edit"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.id, Number(e.target.value))
                          }
                          min="1"
                        />
                      </td>
                      <td className="text-right">
                        ${item.unitprice.toLocaleString()}
                      </td>
                      <td className="text-right">
                        ${item.total.toLocaleString()}
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn-icon delete-btn"
                          onClick={() => removeLineItem(item.id)}
                          title="Remove product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="5" className="text-right grand-total-label">
                      Grand Total ({lineItems.length} items):
                    </td>
                    <td colSpan="2" className="grand-total-value">
                      ${subtotal.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="empty-products">
              <span>📦</span>
              <p>No products added yet</p>
              <small>
                Select a product and click "Add Product" to add items to this
                transaction
              </small>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2
                  size={14}
                  style={{ animation: "spin 0.7s linear infinite" }}
                />
                Saving...
              </>
            ) : (
              "Save Transaction"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return <Portal>{modalContent}</Portal>;
}
