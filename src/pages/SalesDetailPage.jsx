import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, RotateCcw, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useRights } from '../context/UserRightsContext';
import AddLineItemModal  from './modals/AddLineItemModal';
import EditLineItemModal from './modals/EditLineItemModal';
import ConfirmModal      from '../components/ui/ConfirmModal';
import './SalesDetailPage.css';

export default function SalesDetailPage() {
  const { transNo } = useParams();
  const nav = useNavigate();
  const { sales, salesDetail, softDeleteDetailLine, recoverDetailLine, loading } = useApp();
  const { currentUser } = useAuth();
  const { can } = useRights();

  const [modal,    setModal]    = useState(null);
  const [selLine,  setSelLine]  = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin      = currentUser?.user_type === 'ADMIN' || currentUser?.user_type === 'SUPERADMIN';
  const isSuperAdmin = currentUser?.user_type === 'SUPERADMIN';

  const sale = sales.find(s => s.transNo === transNo);

  if (loading && !sale) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:48, gap:10, color:'var(--text-muted)' }}>
        <Loader2 size={20} style={{ animation:'spin .8s linear infinite' }} />
        <span>Loading transaction…</span>
      </div>
    );
  }

  if (!sale) {
    return (
      <div style={{ padding:48, textAlign:'center' }}>
        <p style={{ color:'var(--text-muted)' }}>Transaction <strong>{transNo}</strong> not found.</p>
        <button className="btn btn-secondary" style={{ marginTop:16 }} onClick={() => nav('/sales')}>
          <ArrowLeft size={14} /> Back to Transactions
        </button>
      </div>
    );
  }

  const lines = salesDetail.filter(d =>
    d.transNo === transNo && (isAdmin ? true : d.record_status === 'ACTIVE')
  );
  const activeLines = lines.filter(d => d.record_status === 'ACTIVE');
  const grandTotal  = activeLines.reduce((s, d) => s + d.qty * (d.unitPrice ?? d.unit_price ?? 0), 0);

  function closeModal() { setModal(null); setSelLine(null); }

  async function handleSoftDeleteLine() {
    setActionLoading(true);
    try { await softDeleteDetailLine(selLine.id); closeModal(); }
    catch (err) { alert(err.message); }
    finally { setActionLoading(false); }
  }

  async function handleRecoverLine() {
    setActionLoading(true);
    try { await recoverDetailLine(selLine.id); closeModal(); }
    catch (err) { alert(err.message); }
    finally { setActionLoading(false); }
  }

  return (
    <div className="fade-in">
      <button className="btn btn-secondary btn-sm sd-back" onClick={() => nav('/sales')}>
        <ArrowLeft size={14} /> Back to Transactions
      </button>

      {/* Header card */}
      <div className="card sd-header-card">
        <div className="sd-header-grid">
          <div>
            <p className="sd-label">Transaction No</p>
            <p className="sd-val mono">{sale.transNo}</p>
          </div>
          <div>
            <p className="sd-label">Sales Date</p>
            <p className="sd-val">{sale.salesDate}</p>
          </div>
          <div>
            <p className="sd-label">Customer</p>
            <p className="sd-val">{sale.custname}</p>
            <p className="sd-sub">{sale.custno}</p>
          </div>
          <div>
            <p className="sd-label">Employee</p>
            <p className="sd-val">{sale.empname}</p>
            <p className="sd-sub">{sale.empno}</p>
          </div>
          <div>
            <p className="sd-label">Status</p>
            <span className={`badge ${sale.record_status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>
              {sale.record_status}
            </span>
          </div>
          {isAdmin && (
            <div>
              <p className="sd-label">Stamp</p>
              <p className="sd-val mono" style={{ fontSize:11 }}>
                {sale.stamp ? new Date(sale.stamp).toLocaleString() : '—'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Line items */}
      <div className="page-header" style={{ marginTop:22 }}>
        <div>
          <h3 className="page-title" style={{ fontSize:16 }}>Line Items</h3>
          <p className="page-subtitle">{activeLines.length} active item{activeLines.length !== 1 ? 's' : ''}</p>
        </div>
        {can('SD_ADD') && sale.record_status === 'ACTIVE' && (
          <button className="btn btn-primary" onClick={() => setModal('add')}>
            <Plus size={15} /> Add Line Item
          </button>
        )}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Prod Code</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Row Total</th>
              {isAdmin && <th>Status</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lines.map(line => {
              const up = line.unitPrice ?? line.unit_price ?? 0;
              return (
                <tr key={line.id} className={line.record_status === 'INACTIVE' ? 'row-inactive' : ''}>
                  <td style={{ fontFamily:'var(--font-mono)', fontSize:12 }}>{line.prodCode}</td>
                  <td>{line.description}</td>
                  <td>{line.qty}</td>
                  <td>${Number(up).toLocaleString()}</td>
                  <td style={{ fontWeight:600 }}>${(line.qty * up).toLocaleString()}</td>
                  {isAdmin && (
                    <td>
                      <span className={`badge ${line.record_status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>
                        {line.record_status}
                      </span>
                    </td>
                  )}
                  <td>
                    <div style={{ display:'flex', gap:5 }}>
                      {can('SD_EDIT') && line.record_status === 'ACTIVE' && (
                        <button className="btn-icon" title="Edit"
                          onClick={() => { setSelLine(line); setModal('edit'); }}>
                          <Pencil size={14} />
                        </button>
                      )}
                      {can('SD_DEL') && line.record_status === 'ACTIVE' && (
                        <button className="btn-icon" title="Soft-delete" style={{ color:'var(--red)' }}
                          onClick={() => { setSelLine(line); setModal('delete'); }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                      {isAdmin && line.record_status === 'INACTIVE' && (
                        <button className="btn-icon" title="Recover" style={{ color:'var(--green)' }}
                          onClick={() => { setSelLine(line); setModal('recover'); }}>
                          <RotateCcw size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {lines.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 7 : 6}
                  style={{ textAlign:'center', padding:32, color:'var(--text-muted)' }}>
                  No line items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {activeLines.length > 0 && (
        <div className="sd-grand-total">
          <span>Grand Total ({activeLines.length} active item{activeLines.length !== 1 ? 's' : ''})</span>
          <span className="sd-gt-val">${grandTotal.toLocaleString()}</span>
        </div>
      )}

      {modal === 'add'  && <AddLineItemModal transNo={transNo} onClose={closeModal} />}
      {modal === 'edit' && selLine && <EditLineItemModal line={selLine} onClose={closeModal} />}
      {modal === 'delete' && selLine && (
        <ConfirmModal
          title="Soft-Delete Line Item"
          message={`Soft-delete line item for "${selLine.prodCode}"? It can be recovered from Deleted Items.`}
          confirmLabel="Soft-Delete"
          confirmClass="btn-danger"
          onConfirm={handleSoftDeleteLine}
          onCancel={closeModal}
        />
      )}
      {modal === 'recover' && selLine && (
        <ConfirmModal
          title="Recover Line Item"
          message={`Recover line item for "${selLine.prodCode}"?`}
          confirmLabel="Recover"
          confirmClass="btn-primary"
          onConfirm={handleRecoverLine}
          onCancel={closeModal}
        />
      )}
    </div>
  );
}
