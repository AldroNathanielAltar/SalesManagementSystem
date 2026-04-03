import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Eye, Pencil, Trash2, X,
  ChevronRight, Calendar, Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useRights } from '../context/RightsContext';
import AddSaleModal from './modals/AddSaleModal';
import EditSaleModal from './modals/EditSaleModal';
import SoftDeleteSaleDialog from './modals/SoftDeleteSaleDialog';
import './SalesListPage.css';

const RS_BADGE = { ACTIVE:'badge-green', INACTIVE:'badge-red' };

export default function SalesListPage() {
  const { sales, salesDetail, loading } = useApp();
  const { currentUser } = useAuth();
  const { can } = useRights();
  const nav = useNavigate();

  const [search,   setSearch]   = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [modal,    setModal]    = useState(null);
  const [selTrans, setSelTrans] = useState(null);

  const isSuperAdmin = currentUser?.user_type === 'SUPERADMIN';
  const isAdmin      = currentUser?.user_type === 'ADMIN' || isSuperAdmin;

  // USER sees ACTIVE only (RLS handles it on DB, this is the UI filter)
  const visibleSales = useMemo(() =>
    isAdmin ? sales : sales.filter(s => s.record_status === 'ACTIVE'),
  [sales, isAdmin]);

  const filtered = useMemo(() => visibleSales.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      s.transNo.toLowerCase().includes(q) ||
      (s.custname || '').toLowerCase().includes(q) ||
      (s.empname  || '').toLowerCase().includes(q);
    const matchFrom = !dateFrom || s.salesDate >= dateFrom;
    const matchTo   = !dateTo   || s.salesDate <= dateTo;
    return matchSearch && matchFrom && matchTo;
  }), [visibleSales, search, dateFrom, dateTo]);

  function lineCount(transNo) {
    return salesDetail.filter(d => d.transNo === transNo && d.record_status === 'ACTIVE').length;
  }
  function rowTotal(transNo) {
    return salesDetail
      .filter(d => d.transNo === transNo && d.record_status === 'ACTIVE')
      .reduce((s, d) => s + d.qty * (d.unitPrice ?? d.unit_price ?? 0), 0);
  }

  const activeCount   = sales.filter(s => s.record_status === 'ACTIVE').length;
  const inactiveCount = sales.filter(s => s.record_status === 'INACTIVE').length;
  const activeRevenue = sales
    .filter(s => s.record_status === 'ACTIVE')
    .reduce((acc, s) => acc + rowTotal(s.transNo), 0);

  return (
    <div className="fade-in">
      {/* Summary cards */}
      <div className="sl-summary">
        <div className="sl-sum-card">
          <p className="slsv">{loading ? '…' : sales.length}</p>
          <p className="slsl">Total Transactions</p>
        </div>
        <div className="sl-sum-card ok">
          <p className="slsv">{loading ? '…' : activeCount}</p>
          <p className="slsl">Active</p>
        </div>
        {isAdmin && (
          <div className="sl-sum-card warn">
            <p className="slsv">{loading ? '…' : inactiveCount}</p>
            <p className="slsl">Soft-Deleted</p>
          </div>
        )}
        <div className="sl-sum-card rev">
          <p className="slsv">{loading ? '…' : `$${activeRevenue.toLocaleString()}`}</p>
          <p className="slsl">Active Revenue</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Sales Transactions</h2>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${filtered.length} of ${visibleSales.length} transactions`}
          </p>
        </div>
        <div className="page-actions">
          <div className="search-wrap">
            <Search size={14} className="search-icon" />
            <input className="search-input" placeholder="Search trans / customer…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="date-filter-wrap">
            <Calendar size={13} style={{ color:'var(--text-muted)' }} />
            <input type="date" className="form-input date-input" value={dateFrom}
              onChange={e => setDateFrom(e.target.value)} title="From date" />
            <span style={{ color:'var(--text-muted)', fontSize:12 }}>–</span>
            <input type="date" className="form-input date-input" value={dateTo}
              onChange={e => setDateTo(e.target.value)} title="To date" />
            {(dateFrom || dateTo) && (
              <button className="btn-icon" title="Clear" onClick={() => { setDateFrom(''); setDateTo(''); }}>
                <X size={13} />
              </button>
            )}
          </div>
          {can('SALES_ADD') && (
            <button className="btn btn-primary" onClick={() => setModal('add')}>
              <Plus size={15} /> Add Transaction
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:48, gap:10, color:'var(--text-muted)' }}>
          <Loader2 size={20} style={{ animation:'spin .8s linear infinite' }} />
          <span>Loading transactions…</span>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Trans No</th>
                <th>Sales Date</th>
                <th>Customer</th>
                <th>Employee</th>
                <th>Items</th>
                <th>Total</th>
                {isAdmin && <th>Status</th>}
                {isAdmin && <th>Stamp</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.transNo} className={s.record_status === 'INACTIVE' ? 'row-inactive' : ''}>
                  <td>
                    <button className="trans-link" onClick={() => nav(`/sales/${s.transNo}`)}>
                      {s.transNo} <ChevronRight size={13} />
                    </button>
                  </td>
                  <td>{s.salesDate}</td>
                  <td>{s.custname}</td>
                  <td>{s.empname}</td>
                  <td style={{ color:'var(--text-muted)' }}>{lineCount(s.transNo)}</td>
                  <td style={{ fontWeight:600 }}>${rowTotal(s.transNo).toLocaleString()}</td>
                  {isAdmin && (
                    <td>
                      <span className={`badge ${RS_BADGE[s.record_status] || 'badge-gray'}`}>
                        {s.record_status}
                      </span>
                    </td>
                  )}
                  {isAdmin && (
                    <td style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
                      {s.stamp ? new Date(s.stamp).toLocaleString() : '—'}
                    </td>
                  )}
                  <td>
                    <div style={{ display:'flex', gap:5 }}>
                      <button className="btn-icon" title="View" onClick={() => nav(`/sales/${s.transNo}`)}>
                        <Eye size={14} />
                      </button>
                      {can('SALES_EDIT') && s.record_status === 'ACTIVE' && (
                        <button className="btn-icon" title="Edit"
                          onClick={() => { setSelTrans(s); setModal('edit'); }}>
                          <Pencil size={14} />
                        </button>
                      )}
                      {can('SALES_DEL') && s.record_status === 'ACTIVE' && (
                        <button className="btn-icon" title="Soft-delete" style={{ color:'var(--red)' }}
                          onClick={() => { setSelTrans(s); setModal('delete'); }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 9 : 7}
                    style={{ textAlign:'center', padding:48, color:'var(--text-muted)' }}>
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal === 'add'    && <AddSaleModal onClose={() => setModal(null)} />}
      {modal === 'edit'   && selTrans && <EditSaleModal sale={selTrans} onClose={() => { setModal(null); setSelTrans(null); }} />}
      {modal === 'delete' && selTrans && <SoftDeleteSaleDialog sale={selTrans} onClose={() => { setModal(null); setSelTrans(null); }} />}
    </div>
  );
}
