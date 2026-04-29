import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', confirmClass = 'btn-danger', onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <AlertTriangle size={18} style={{ color:'var(--amber)' }} />
            <h3>{title}</h3>
          </div>
          <button className="btn-icon" onClick={onCancel}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6 }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={`btn ${confirmClass}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
