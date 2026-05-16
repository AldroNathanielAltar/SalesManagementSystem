import { useState, useEffect } from "react";
import { X, Loader2, Save } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useApp } from "../../context/AppContext";
import Portal from "../../components/ui/Portal";
import "./Modal.css";

export default function EditSaleModal({ sale, onClose }) {
  const { loadSales, customers, employees } = useApp();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const transno = sale?.transNo || sale?.transno;

  const [saleData, setSaleData] = useState({
    transno: transno,
    salesdate: sale?.salesDate
      ? new Date(sale.salesDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    custno: sale?.custno || "",
    empno: sale?.empno || "",
  });

  // Lock body scroll when modal opens
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  async function handleSave() {
    if (!saleData.custno) {
      setError("Please select a customer");
      return;
    }
    if (!saleData.empno) {
      setError("Please select an employee");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("sales")
        .update({
          salesdate: saleData.salesdate,
          custno: saleData.custno,
          empno: saleData.empno,
          stamp: new Date().toISOString(),
        })
        .eq("transno", transno);

      if (updateError) throw updateError;

      await loadSales();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Transaction: {transno}</h3>
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

          <div className="form-group">
            <label>Transaction No</label>
            <input
              type="text"
              className="form-input"
              value={saleData.transno}
              disabled
            />
          </div>

          <div className="form-group">
            <label>Sales Date</label>
            <input
              type="date"
              className="form-input"
              value={saleData.salesdate}
              onChange={(e) =>
                setSaleData({ ...saleData, salesdate: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Customer</label>
            <select
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
            <label>Employee</label>
            <select
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
                />{" "}
                Saving...
              </>
            ) : (
              <>
                <Save size={14} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return <Portal>{modalContent}</Portal>;
}
