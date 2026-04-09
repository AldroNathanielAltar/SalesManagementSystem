import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function EditLineItemModal({ line, onClose }) {
  const { updateDetailLine } = useApp();
  const [qty,       setQty]       = useState(line.qty);
  const [unitPrice, setUnitPrice] = useState(line.unitPrice ?? line.unit_price);
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [apiError,  setApiError]  = useState('');

  async function handleSubmit() {
    const e = {};
    if (!qty || qty < 1) e.qty       = 'Quantity must be at least 1.';
    if (!unitPrice)      e.unitPrice = 'Unit price is required.';
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    try {
      await updateDetailLine(line.id, {
        qty:       Number(qty),
        unitPrice: parseFloat(unitPrice),
      });
      onClose();
    } catch (err) {
      setApiError(err.message || 'Failed to update line item.');
    } finally {
      setLoading(false);
    }
  }

  const total = qty && unitPrice ? (Number(qty) * parseFloat(unitPrice)).toFixed(2) : '—';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Line Item — <span style={{ fontFamily:'var(--font-mono)', color:'var(--accent)', fontSize:13 }}>{line.prodCode}</span></h3>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          {apiError && (
            <div style={{ padding:'10px 14px', background:'var(--red-dim)', borderRadius:'var(--radius-md)', fontSize:13, color:'var(--red)' }}>
              {apiError}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Product</label>
            <input className="form-input" value={`${line.prodCode} — ${line.description}`} disabled style={{ opacity:.7 }} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input className={`form-input ${errors.qty ? 'input-err' : ''}`}
                type="number" min="1" value={qty}
                onChange={e => { setQty(e.target.value); setErrors(x => ({ ...x, qty:'' })); }} />
              {errors.qty && <p className="field-err">{errors.qty}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Unit Price *</label>
              <input className={`form-input ${errors.unitPrice ? 'input-err' : ''}`}
                type="number" min="0" step="0.01" value={unitPrice}
                onChange={e => { setUnitPrice(e.target.value); setErrors(x => ({ ...x, unitPrice:'' })); }} />
              {errors.unitPrice && <p className="field-err">{errors.unitPrice}</p>}
            </div>
          </div>
          <div className="line-total-preview">
            <span>Row Total</span>
            <span className="ltp-val">${total}</span>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <><Loader2 size={14} style={{ animation:'spin .7s linear infinite' }} /> Saving…</> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
