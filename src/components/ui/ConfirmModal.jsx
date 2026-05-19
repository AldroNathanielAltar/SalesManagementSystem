import { AlertTriangle, X } from "lucide-react";

// Confirmation modal component for user actions like delete or warning prompts
export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  confirmClass = "btn-danger",
  onConfirm,
  onCancel,
}) {
  return (
    // Close modal when clicking overlay background
    <div className="modal-overlay" onClick={onCancel}>
      {/* Prevent click inside modal from closing it */}
      <div
        className="modal"
        style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AlertTriangle size={18} style={{ color: "var(--amber)" }} />
            <h3>{title}</h3>
          </div>
          <button className="btn-icon" onClick={onCancel}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">
          <p
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            {message}
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          {/* Confirm button uses dynamic class for styling (e.g., btn-danger, btn-primary) */}
          <button className={`btn ${confirmClass}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
