import { useState } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SoftDeleteSaleDialog({ sale, onClose }) {
  const { softDeleteSale } = useApp();
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState('');

  async function handleConfirm() {
    setLoading(true);
    try {
      await softDeleteSale(sale.transNo);
      onClose();
    } catch (err) {
      setApiError(err.message || 'Failed to delete transaction.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <AlertTriangle size={18} style={{ color:'var(--red)' }} />
            <h3>Confirm Soft-Delete</h3>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          {apiError && (
            <div style={{ padding:'10px 14px', background:'var(--red-dim)', borderRadius:'var(--radius-md)', fontSize:13, color:'var(--red)' }}>
              {apiError}
            </div>
          )}
          <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.7 }}>
            Confirm delete transaction{' '}
            <strong style={{ fontFamily:'var(--font-mono)', color:'var(--accent)' }}>{sale.transNo}</strong>?
          </p>
          <div style={{ background:'var(--amber-dim)', border:'1px solid rgba(217,119,6,.25)', borderRadius:'var(--radius-md)', padding:'10px 14px', fontSize:13, color:'var(--amber)' }}>
            ⚠️ This will also soft-delete all line items under this transaction (cascade). The record can be recovered from Deleted Items.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={handleConfirm} disabled={loading}>
            {loading ? <><Loader2 size={14} style={{ animation:'spin .7s linear infinite' }} /> Deleting…</> : 'Soft-Delete Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
}
