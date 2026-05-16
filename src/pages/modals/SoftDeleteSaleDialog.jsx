import { useState, useEffect } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import Portal from "../../components/ui/Portal";
import "./Modal.css";

export default function SoftDeleteSaleDialog({ sale, onClose }) {
  const { loadSales } = useApp();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const isSuperAdmin = currentUser?.user_type === "SUPERADMIN";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  async function handleConfirm() {
    if (!isSuperAdmin) {
      setApiError("Only Super Admin can delete transactions.");
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const transno = sale?.transNo || sale?.transno;

      // Update sale status to DELETED
      const { error: saleError } = await supabase
        .from("sales")
        .update({
          record_status: "DELETED",
          stamp: new Date().toISOString(),
        })
        .eq("transno", transno);

      if (saleError) throw saleError;

      // Update all line items to DELETED
      const { error: detailsError } = await supabase
        .from("salesdetail")
        .update({ record_status: "DELETED" })
        .eq("transno", transno);

      if (detailsError) throw detailsError;

      // Refresh sales data in AppContext
      await loadSales();

      // Close the modal
      onClose();

      // If we're on the DeletedItemsPage, reload the page to show the new item
      if (window.location.pathname === "/deleted-items") {
        window.location.reload();
      }
    } catch (err) {
      console.error("Soft delete error:", err);
      setApiError(err.message || "Failed to delete transaction.");
    } finally {
      setLoading(false);
    }
  }

  const transno = sale?.transNo || sale?.transno || "Unknown";

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
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
              className="error-message"
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

          <p style={{ marginBottom: 16 }}>
            Are you sure you want to soft-delete transaction{" "}
            <strong>{transno}</strong>?
          </p>

          <div
            className="warning-box"
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
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2
                  size={14}
                  style={{ animation: "spin 0.7s linear infinite" }}
                />
                Deleting...
              </>
            ) : (
              "Soft-Delete Transaction"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return <Portal>{modalContent}</Portal>;
}
