import { useState, useEffect } from "react";
import { X, Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useApp } from "../../context/AppContext";
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
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);

  const [saleData, setSaleData] = useState({
    transno: "",
    salesdate: new Date().toISOString().split("T")[0],
    custno: "",
    empno: "",
  });

  const [lineItems, setLineItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productQuantity, setProductQuantity] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

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
    setShowCustomerDetails(!!customer);
  }, [saleData.custno, customers]);

  // Update selected employee when empno changes
  useEffect(() => {
    const employee = employees.find((e) => e.empno === saleData.empno);
    setSelectedEmployee(employee);
    setShowEmployeeDetails(!!employee);
  }, [saleData.empno, employees]);

  const addLineItem = () => {
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
      setError("Product already added. Remove it first to change quantity.");
      return;
    }

    setLineItems([
      ...lineItems,
      {
        id: Date.now(),
        prodcode: selectedProduct,
        description: product?.description,
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

  const handleSave = async () => {
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

    try {
      await addSale({
        transno: saleData.transno,
        salesdate: saleData.salesdate,
        custno: saleData.custno,
        empno: saleData.empno,
      });

      for (const item of lineItems) {
        await addDetailLine({
          transno: saleData.transno,
          prodcode: item.prodcode,
          quantity: item.quantity,
        });
      }

      await loadSales();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save sale");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Transaction</h3>
          <button className="btn-icon" onClick={onClose}>
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

          {/* Transaction Information */}
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

          <hr />

          {/* Customer Selection */}
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

          {showCustomerDetails && selectedCustomer && (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                background: "#f3f4f6",
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                <div>
                  <label style={{ fontSize: 11, color: "#6b7280" }}>
                    Customer Name:
                  </label>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {selectedCustomer.custname}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#6b7280" }}>
                    Pay Term:
                  </label>
                  <div style={{ fontSize: 14 }}>
                    {selectedCustomer.payterm || "—"}
                  </div>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: 11, color: "#6b7280" }}>
                    Address:
                  </label>
                  <div style={{ fontSize: 14 }}>
                    {selectedCustomer.address || "—"}
                  </div>
                </div>
              </div>
            </div>
          )}

          <hr />

          {/* Employee Selection */}
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

          {showEmployeeDetails && selectedEmployee && (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                background: "#f3f4f6",
                borderRadius: 8,
              }}
            >
              <div>
                <label style={{ fontSize: 11, color: "#6b7280" }}>
                  Employee Name:
                </label>
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  {selectedEmployee.lastname}, {selectedEmployee.firstname}
                </div>
              </div>
            </div>
          )}

          <hr />

          {/* Products Section */}
          <h4>Products</h4>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <select
              id="product"
              name="product"
              className="form-input"
              style={{ flex: 2 }}
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
            <input
              id="quantity"
              name="quantity"
              type="number"
              className="form-input"
              style={{ width: 100 }}
              value={productQuantity}
              onChange={(e) => setProductQuantity(Number(e.target.value))}
              min="1"
            />
            <button className="btn btn-primary" onClick={addLineItem}>
              <Plus size={14} /> Add
            </button>
          </div>

          {/* Line Items Table */}
          {lineItems.length > 0 && (
            <div
              className="table-wrap"
              style={{ marginTop: 16, overflowX: "auto" }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th
                      style={{
                        padding: 10,
                        textAlign: "left",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      Product Code
                    </th>
                    <th
                      style={{
                        padding: 10,
                        textAlign: "left",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      Description
                    </th>
                    <th
                      style={{
                        padding: 10,
                        textAlign: "right",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      Quantity
                    </th>
                    <th
                      style={{
                        padding: 10,
                        textAlign: "right",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      Unit Price
                    </th>
                    <th
                      style={{
                        padding: 10,
                        textAlign: "right",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      Total
                    </th>
                    <th
                      style={{
                        padding: 10,
                        textAlign: "center",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    ></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.id}>
                      <td
                        style={{
                          padding: 10,
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        {item.prodcode}
                      </td>
                      <td
                        style={{
                          padding: 10,
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        {item.description}
                      </td>
                      <td
                        style={{
                          padding: 10,
                          textAlign: "right",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        <input
                          type="number"
                          className="form-input"
                          style={{ width: 80, textAlign: "right" }}
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.id, Number(e.target.value))
                          }
                          min="1"
                        />
                      </td>
                      <td
                        style={{
                          padding: 10,
                          textAlign: "right",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        ${item.unitprice.toLocaleString()}
                      </td>
                      <td
                        style={{
                          padding: 10,
                          textAlign: "right",
                          fontWeight: 600,
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        ${item.total.toLocaleString()}
                      </td>
                      <td
                        style={{
                          padding: 10,
                          textAlign: "center",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        <button
                          className="btn-icon"
                          onClick={() => removeLineItem(item.id)}
                        >
                          <Trash2 size={14} color="red" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      colSpan="4"
                      style={{
                        padding: 12,
                        textAlign: "right",
                        fontWeight: 600,
                      }}
                    >
                      Grand Total ({lineItems.length} items):
                    </td>
                    <td
                      colSpan="2"
                      style={{
                        padding: 12,
                        fontWeight: 700,
                        fontSize: 18,
                        color: "#2563eb",
                      }}
                    >
                      ${subtotal.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {lineItems.length === 0 && (
            <div style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>
              No products added. Use the form above to add products.
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
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
}
