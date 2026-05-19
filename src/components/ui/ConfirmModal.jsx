// Import warning triangle and close/X icons from Lucide React
import { AlertTriangle, X } from 'lucide-react';

// Define the ConfirmModal component for confirmation dialogs (delete, warnings, etc.)
// Destructure props with default values for confirmLabel and confirmClass
export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', confirmClass = 'btn-danger', onConfirm, onCancel }) {
  return (
    // Overlay that covers the entire screen; clicking it triggers onCancel
    <div className="modal-overlay" onClick={onCancel}>
      {/* Modal container with fixed max width; stopPropagation prevents click from bubbling to overlay */}
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        
        {/* Modal header section containing title and close button */}
        <div className="modal-header">
          {/* Flex container for icon and title alignment */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* Warning triangle icon with amber color */}
            <AlertTriangle size={18} style={{ color:'var(--amber)' }} />
            <h3>{title}</h3>
          </div>
          {/* Icon button to close/cancel the modal */}
          <button className="btn-icon" onClick={onCancel}><X size={16} /></button>
        </div>
        
        {/* Modal body section containing the confirmation message */}
        <div className="modal-body">
          {/* Styled paragraph for the message with smaller font and secondary text color */}
          <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6 }}>{message}</p>
        </div>
        
        {/* Modal footer section containing action buttons */}
        <div className="modal-footer">
          {/* Cancel button that triggers onCancel */}
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          {/* Confirm button with dynamic class name and label; triggers onConfirm */}
          <button className={`btn ${confirmClass}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}// Import warning triangle and close/X icons from Lucide React
import { AlertTriangle, X } from 'lucide-react';

// Define the ConfirmModal component for confirmation dialogs (delete, warnings, etc.)
// Destructure props with default values for confirmLabel and confirmClass
export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', confirmClass = 'btn-danger', onConfirm, onCancel }) {
  return (
    // Overlay that covers the entire screen; clicking it triggers onCancel
    <div className="modal-overlay" onClick={onCancel}>
      {/* Modal container with fixed max width; stopPropagation prevents click from bubbling to overlay */}
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        
        {/* Modal header section containing title and close button */}
        <div className="modal-header">
          {/* Flex container for icon and title alignment */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* Warning triangle icon with amber color */}
            <AlertTriangle size={18} style={{ color:'var(--amber)' }} />
            <h3>{title}</h3>
          </div>
          {/* Icon button to close/cancel the modal */}
          <button className="btn-icon" onClick={onCancel}><X size={16} /></button>
        </div>
        
        {/* Modal body section containing the confirmation message */}
        <div className="modal-body">
          {/* Styled paragraph for the message with smaller font and secondary text color */}
          <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6 }}>{message}</p>
        </div>
        
        {/* Modal footer section containing action buttons */}
        <div className="modal-footer">
          {/* Cancel button that triggers onCancel */}
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          {/* Confirm button with dynamic class name and label; triggers onConfirm */}
          <button className={`btn ${confirmClass}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}