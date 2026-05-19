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
  const [generating, setGenerating] = useState(true);

  const [saleData, setSaleData] = useState({
    transno: "",
    salesdate: new Date().toISOString().split("T")[0],
    custno: "",
    empno: "",
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Generate transaction number - only look for TR format
  useEffect(() => {
    const generateTransNo = async () => {
      setGenerating(true);
      try {
        // Only get transactions that start with 'TR' (not TRX)
        const { data, error } = await supabase
          .from("sales")
          .select("transno")
          .like("transno", "TR%")
          .not("transno", "like", "TRX%")
          .order("transno", { ascending: false })
          .limit(1);

        if (error) {
          console.error("Error fetching last transno:", error);
          setSaleData((prev) => ({ ...prev, transno: "TR000001" }));
          setGenerating(false);
          return;
        }

        console.log("Query result:", data);

        let lastTransNo = "TR000000";
        if (data && data.length > 0 && data[0].transno) {
          lastTransNo = data[0].transno;
        }

        console.log("Last transaction number from DB:", lastTransNo);

        // Extract number from "TR000124" -> 124
        const match = lastTransNo.match(/TR(\d+)/);
        let lastNumber = 0;

        if (match && match[1]) {
          lastNumber = parseInt(match[1], 10);
        }

        console.log("Extracted number:", lastNumber);

        let newNumber = lastNumber + 1;
        if (newNumber < 1) {
          newNumber = 1;
        }

        // Format with 6 digits: TR000001, TR000124, TR000125
        const newTransNo = `TR${String(newNumber).padStart(6, "0")}`;

        console.log("Generated new transno:", newTransNo);
        setSaleData((prev) => ({ ...prev, transno: newTransNo }));
      } catch (err) {
        console.error("Error generating transno:", err);
        // Fallback: count only TR transactions
        try {
          const { count } = await supabase
            .from("sales")
            .select("*", { count: "exact", head: true })
            .like("transno", "TR%")
            .not("transno", "like", "TRX%");

          const newNumber = (count || 0) + 1;
          setSaleData((prev) => ({
            ...prev,
            transno: `TR${String(newNumber).padStart(6, "0")}`,
          }));
        } catch (fallbackErr) {
          const timestamp = Date.now();
          setSaleData((prev) => ({ ...prev, transno: `TR${timestamp}` }));
        }
      } finally {
        setGenerating(false);
      }
    };

    generateTransNo();
  }, []);

  useEffect(() => {
    const customer = customers.find((c) => c.custno === saleData.custno);
    setSelectedCustomer(customer);
  }, [saleData.custno, customers]);

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
      setSavingMessage("Saving transaction details...");
      await addSale({
        transno: saleData.transno,
        salesdate: saleData.salesdate,
        custno: saleData.custno,
        empno: saleData.empno,
      });

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
      await new Promise((resolve) => setTimeout(resolve, 500));
      await loadSales();
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      if (err.message?.includes("duplicate key")) {
        setError("Transaction number conflict. Please try again.");
        const { data } = await supabase
          .from("sales")
          .select("transno")
          .like("transno", "TR%")
          .not("transno", "like", "TRX%")
          .order("transno", { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          const match = data[0].transno.match(/TR(\d+)/);
          let lastNumber = 0;
          if (match && match[1]) {
            lastNumber = parseInt(match[1], 10);
          }
          const newNumber = lastNumber + 1;
          setSaleData((prev) => ({
            ...prev,
            transno: `TR${String(newNumber).padStart(6, "0")}`,
          }));
        }
      } else {
        setError(err.message || "Failed to save sale. Please try again.");
      }
    } finally {
      setSaving(false);
      setSavingMessage("");
    }
  };

  return (
    <Portal>
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

            {generating && (
              <div className="info-message">
                <Loader2
                  size={16}
                  style={{ animation: "spin 0.7s linear infinite" }}
                />
                <span>Connecting to database...</span>
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
                <small
                  style={{
                    fontSize: "10px",
                    color: "#6b7280",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  Auto-generated from database
                </small>
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
                      {e.empno} -{" "}
                      {e.fullname || `${e.lastname}, ${e.firstname}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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

            <div className="products-header">
              <h4>Products</h4>
            </div>

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
              disabled={saving || generating}
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
    </Portal>
  );
}
