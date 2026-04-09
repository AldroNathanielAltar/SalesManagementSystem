import { useState } from 'react';
import { RotateCcw, Trash2, ShieldOff, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ui/ConfirmModal';
import './DeletedItemsPage.css';

export default function DeletedItemsPage() {
  const { sales, salesDetail, recoverSale, recoverDetailLine, loading } = useApp();
  const { currentUser } = useAuth();
  const [tab,     setTab]     = useState('transactions');
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin = currentUser?.user_type === 'ADMIN' || currentUser?.user_type === 'SUPERADMIN';

  if (!isAdmin) {
    return (
      <div className="di-blocked">
        <ShieldOff size={40} style={{ color:'var(--text-muted)' }} />
        <h3>Access Restricted</h3>
        <p>Deleted Items is only visible to Admin and Super Admin users.</p>
      </div>
    );
  }

  const deletedSales = sales.filter(s => s.record_status === 'INACTIVE');
  const deletedLines = salesDetail.filter(d => d.record_status === 'INACTIVE');

  async function handleRecover() {
    if (!confirm) return;
    setActionLoading(true);
    try {
      if (confirm.type === 'sale') await recoverSale(confirm.id);
      if (confirm.type === 'line') await recoverDetailLine(confirm.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Deleted Items</h2>
          <p className="page-subtitle">Soft-deleted records — recoverable by Admin and Super Admin</p>
        </div>
      </div>

      <div className="di-tabs">
        <button className={`di-tab ${tab === 'transactions' ? 'active' : ''}`}
          onClick={() => setTab('transactions')}>
          <Trash2 size={14} />
          Transactions
          {deletedSales.length > 0 && <span className="di-count">{deletedSales.length}</span>}
        </button>
        <button className={`di-tab ${tab === 'lineitems' ? 'active' : ''}`}
          onClick={() => setTab('lineitems')}>
          <Trash2 size={14} />
          Line Items
          {deletedLines.length > 0 && <span className="di-count">{deletedLines.length}</span>}
        </button>
      </div>

      {loading && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:48, gap:10, color:'var(--text-muted)' }}>
          <Loader2 size={18} style={{ animation:'spin .8s linear infinite' }} />
          <span>Loading deleted records…</span>
        </div>
      )}

      {!loading && tab === 'transactions' && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Trans No</th><th>Sales Date</th><th>Customer</th><th>Employee</th><th>Stamp</th><th>Action</th></tr>
            </thead>
            <tbody>
              {deletedSales.map(s => (
                <tr key={s.transNo} className="row-deleted">
                  <td style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--red)' }}>{s.transNo}</td>
                  <td>{s.salesDate}</td>
                  <td>{s.custname}</td>
                  <td>{s.empname}</td>
                  <td style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
                    {s.stamp ? new Date(s.stamp).toLocaleString() : '—'}
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm recover-btn"
                      onClick={() => setConfirm({ type:'sale', id:s.transNo })}>
                      <RotateCcw size={13} /> Recover
                    </button>
                  </td>
                </tr>
              ))}
              {deletedSales.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign:'center', padding:36, color:'var(--text-muted)' }}>
                  No deleted transactions.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'lineitems' && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Trans No</th><th>Prod Code</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Action</th></tr>
            </thead>
            <tbody>
              {deletedLines.map(d => {
                const up = d.unitPrice ?? d.unit_price ?? 0;
                return (
                  <tr key={d.id} className="row-deleted">
                    <td style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)' }}>{d.id}</td>
                    <td style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--red)' }}>{d.transNo}</td>
                    <td style={{ fontFamily:'var(--font-mono)', fontSize:12 }}>{d.prodCode}</td>
                    <td>{d.description}</td>
                    <td>{d.qty}</td>
                    <td style={{ fontWeight:600 }}>${Number(up).toLocaleString()}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm recover-btn"
                        onClick={() => setConfirm({ type:'line', id:d.id })}>
                        <RotateCcw size={13} /> Recover
                      </button>
                    </td>
                  </tr>
                );
              })}
              {deletedLines.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:36, color:'var(--text-muted)' }}>
                  No deleted line items.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {confirm && (
        <ConfirmModal
          title="Recover Record"
          message={
            confirm.type === 'sale'
              ? `Recover transaction "${confirm.id}"? This will also recover all its line items (cascade restore).`
              : `Recover line item "${confirm.id}"?`
          }
          confirmLabel={actionLoading ? 'Recovering…' : 'Recover'}
          confirmClass="btn-primary"
          onConfirm={handleRecover}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
