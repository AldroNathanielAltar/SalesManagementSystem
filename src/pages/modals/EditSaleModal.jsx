import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function EditSaleModal({ sale, onClose }) {
  const { customers, employees, updateSale } = useApp();
  const [form, setForm] = useState({
    salesDate: sale.salesDate,
    custno:    sale.custno,
    empno:     sale.empno,
  });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState('');

  function set(f, v) { setForm(p => ({ ...p, [f]: v })); setErrors(e => ({ ...e, [f]: '' })); setApiError(''); }

  async function handleSubmit() {
    const e = {};
    if (!form.salesDate) e.salesDate = 'Sales date is required.';
    if (!form.custno)    e.custno    = 'Please select a customer.';
    if (!form.empno)     e.empno     = 'Please select an employee.';
    if (Object.keys(e).length) { setErrors(e); return; }

    const cust = customers.find(c => c.custno === form.custno);
    const emp  = employees.find(e => e.empno  === form.empno);

    setLoading(true);
    try {
      await updateSale(sale.transNo, {
        salesDate: form.salesDate,
        custno:    form.custno,
        custname:  cust?.custname || sale.custname,
        empno:     form.empno,
        empname:   emp ? `${emp.lastname}, ${emp.firstname}` : sale.empname,
      });
      onClose();
    } catch (err) {
      setApiError(err.message || 'Failed to update transaction.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit — <span style={{ fontFamily:'var(--font-mono)', color:'var(--accent)', fontSize:13 }}>{sale.transNo}</span></h3>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          {apiError && <div style={{ padding:'10px 14px', background:'var(--red-dim)', borderRadius:'var(--radius-md)', fontSize:13, color:'var(--red)' }}>{apiError}</div>}

          <div className="form-group">
            <label className="form-label">Sales Date *</label>
            <input className={`form-input ${errors.salesDate ? 'input-err' : ''}`} type="date"
              value={form.salesDate} onChange={e => set('salesDate', e.target.value)} />
            {errors.salesDate && <p className="field-err">{errors.salesDate}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Customer *</label>
            <select className={`form-input ${errors.custno ? 'input-err' : ''}`}
              value={form.custno} onChange={e => set('custno', e.target.value)}>
              <option value="">— Select customer —</option>
              {customers.map(c => (
                <option key={c.custno} value={c.custno}>{c.custno} — {c.custname}</option>
              ))}
            </select>
            {errors.custno && <p className="field-err">{errors.custno}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Employee *</label>
            <select className={`form-input ${errors.empno ? 'input-err' : ''}`}
              value={form.empno} onChange={e => set('empno', e.target.value)}>
              <option value="">— Select employee —</option>
              {employees.map(e => (
                <option key={e.empno} value={e.empno}>{e.empno} — {e.lastname}, {e.firstname}</option>
              ))}
            </select>
            {errors.empno && <p className="field-err">{errors.empno}</p>}
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
