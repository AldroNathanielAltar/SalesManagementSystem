// Import success, error, and close icons from Lucide React
import { CheckCircle, XCircle, X } from "lucide-react";
import "./Toast.css";

// Toast notification component for temporary user feedback messages
// type can be: success, error, warning, or info
export default function Toast({ msg, type = "success", onClose }) {
  // Determine if this is a success toast (shows check icon) or error (shows X icon)
  const isSuccess = type === "success";
  return (
    // Dynamic class based on toast type for different border colors
    <div className={`toast toast-${type}`}>
      {/* Show green check for success, red X for error */}
      {isSuccess ? (
        <CheckCircle size={16} style={{ flexShrink: 0 }} />
      ) : (
        <XCircle size={16} style={{ flexShrink: 0 }} />
      )}
      {/* Toast message text */}
      <span className="toast-msg">{msg}</span>
      {/* Close button to dismiss toast */}
      <button className="toast-close" onClick={onClose}>
        <X size={13} />
      </button>
    </div>
  );
}
