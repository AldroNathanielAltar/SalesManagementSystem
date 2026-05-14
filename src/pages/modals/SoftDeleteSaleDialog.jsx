import { useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import "./Modal.css";

export default function SoftDeleteSaleDialog({ sale, onClose }) {
  const { loadSales } = useApp(); // Changed: reloadSales -> loadSales
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const isSuperAdmin = currentUser?.user_type === "SUPERADMIN";

  async function handleConfirm() {
    if (!isSuperAdmin) {
      setApiError("Only Super Admin can delete transactions.");
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const transno = sale?.transNo || sale?.transno;

      const { error: saleError } = await supabase
        .from("sales")
        .update({
          record_status: "DELETED",
          stamp: new Date().toISOString(),
        })
        .eq("transno", transno);

      if (saleError) throw saleError;

      const { error: detailsError } = await supabase
        .from("salesdetail")
        .update({ record_status: "DELETED" })
        .eq("transno", transno);

      if (detailsError) throw detailsError;

      await loadSales(); // Changed: reloadSales -> loadSales
      onClose();
    } catch (err) {
      setApiError(err.message || "Failed to delete transaction.");
    } finally {
      setLoading(false);
    }
  }

  const transno = sale?.transNo || sale?.transno || "Unknown";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 400 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AlertTriangle size={18} style={{ color: "#dc2626" }} />
            <h3>Confirm Soft-Delete</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {apiError && (
            <div
              style={{
                color: "red",
                marginBottom: 16,
                padding: 10,
                background: "#fee2e2",
                borderRadius: 8,
              }}
            >
              {apiError}
            </div>
          )}

          <p>
            Are you sure you want to soft-delete transaction{" "}
            <strong>{transno}</strong>?
          </p>

          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: "#fef3c7",
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            <strong>⚠️ Important:</strong>
            <ul style={{ marginTop: 8, marginLeft: 20 }}>
              <li>This will also soft-delete all line items</li>
              <li>Can be recovered from Deleted Items page</li>
              <li>Only Super Admin can recover</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Soft-Delete Transaction"}
          </button>
        </div>
      </div>
    </div>
  );
}
