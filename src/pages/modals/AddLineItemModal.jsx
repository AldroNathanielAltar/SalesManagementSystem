import { useState, useEffect } from 'react';
import { X, Zap, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AddLineItemModal({ transNo, onClose }) {
  const { products, getCurrentPrice, addDetailLine } = useApp();
  const [prodCode,   setProdCode]   = useState('');
  const [qty,        setQty]        = useState(1);
  const [unitPrice,  setUnitPrice]  = useState('');
  const [autoFilled, setAutoFilled] = useState(false);
  const [errors,     setErrors]     = useState({});
  const [loading,    setLoading]    = useState(false);
  const [apiError,   setApiError]   = useState('');

  // Price auto-fill from priceHist
  useEffect(() => {
    if (!prodCode) { setUnitPrice(''); setAutoFilled(false); return; }
    const ph = getCurrentPrice(prodCode);
    if (ph) { setUnitPrice(ph.unitPrice ?? ph.unit_price ?? ''); setAutoFilled(true); }
    else    { setUnitPrice(''); setAutoFilled(false); }
  }, [prodCode, getCurrentPrice]);

  function validate() {
    const e = {};
    if (!prodCode)        e.prodCode  = 'Please select a product.';
    if (!qty || qty < 1)  e.qty       = 'Quantity must be at least 1.';
    if (!unitPrice)       e.unitPrice = 'Unit price is required.';
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const prod = products.find(p => p.prodCode === prodCode);
    setLoading(true);
    try {
      await addDetailLine({
        transNo,
        prodCode,
        description: prod?.description || prodCode,
        qty:         Number(qty),
        unitPrice:   parseFloat(unitPrice),
      });
      onClose();
    } catch (err) {
      setApiError(err.message || 'Failed to add line item.');
    } finally {
      setLoading(false);
    }
  }

  const total = qty && unitPrice ? (Number(qty) * parseFloat(unitPrice)).toFixed(2) : '—';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Line Item</h3>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          {apiError && (
            <div style={{ padding:'10px 14px', background:'var(--red-dim)', borderRadius:'var(--radius-md)', fontSize:13, color:'var(--red)' }}>
              {apiError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Product *</label>
            <select
              className={`form-input ${errors.prodCode ? 'input-err' : ''}`}
              value={prodCode}
              onChange={e => { setProdCode(e.target.value); setErrors(x => ({ ...x, prodCode:'' })); }}
            >
              <option value="">— Select product —</option>
              {products.map(p => (
                <option key={p.prodCode} value={p.prodCode}>
                  {p.prodCode} — {p.description}
                </option>
              ))}
            </select>
            {errors.prodCode && <p className="field-err">{errors.prodCode}</p>}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                className={`form-input ${errors.qty ? 'input-err' : ''}`}
                type="number" min="1"
                value={qty}
                onChange={e => { setQty(e.target.value); setErrors(x => ({ ...x, qty:'' })); }}
              />
              {errors.qty && <p className="field-err">{errors.qty}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Unit Price *
                {autoFilled && <span className="autofill-badge"><Zap size={10} /> Auto-filled</span>}
              </label>
              <input
                className={`form-input ${errors.unitPrice ? 'input-err' : ''}`}
                type="number" min="0" step="0.01"
                value={unitPrice}
                onChange={e => { setUnitPrice(e.target.value); setAutoFilled(false); setErrors(x => ({ ...x, unitPrice:'' })); }}
              />
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
            {loading ? <><Loader2 size={14} style={{ animation:'spin .7s linear infinite' }} /> Adding…</> : 'Add Line Item'}
          </button>
        </div>
      </div>
    </div>
  );
}
