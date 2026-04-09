import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './LookupPages.css';

// ─── Shared read-only table ───────────────────────────────────────────────────
function LookupTable({ title, subtitle, columns, rows, loading, emptyMsg = 'No records found.' }) {
  const [search, setSearch] = useState('');

  const filtered = rows.filter(row =>
    columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">{title}</h2>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${subtitle} — ${filtered.length} of ${rows.length} records`}
          </p>
        </div>
        <div className="search-wrap">
          <Search size={14} className="search-icon" />
          <input className="search-input" placeholder="Search…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="lookup-readonly-notice">
        🔒 This is a read-only lookup page. No changes can be made here.
      </div>

      {loading ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:48, gap:10, color:'var(--text-muted)' }}>
          <Loader2 size={18} style={{ animation:'spin .8s linear infinite' }} />
          <span>Loading data…</span>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i}>
                  {columns.map(c => (
                    <td key={c.key} style={c.style || {}}>
                      {c.render ? c.render(row[c.key], row) : row[c.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={columns.length}
                    style={{ textAlign:'center', padding:36, color:'var(--text-muted)' }}>
                    {emptyMsg}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function CustomerLookupPage() {
  const { customers, loading } = useApp();
  return (
    <LookupTable
      title="Customer Lookup" loading={loading}
      subtitle="custno · custname · address · payterm"
      rows={customers}
      columns={[
        { key:'custno',   label:'Cust No',   style:{ fontFamily:'var(--font-mono)', fontSize:12 } },
        { key:'custname', label:'Customer Name' },
        { key:'address',  label:'Address',   style:{ color:'var(--text-secondary)' } },
        { key:'payterm',  label:'Pay Term',  render: v => <span className="badge badge-blue">{v}</span> },
      ]}
    />
  );
}

export function EmployeeLookupPage() {
  const { employees, loading } = useApp();
  // Support both DB column name styles
  const rows = employees.map(e => ({
    ...e,
    fullname: e.fullname || `${e.lastname}, ${e.firstname}`,
  }));
  return (
    <LookupTable
      title="Employee Lookup" loading={loading}
      subtitle="empno · lastname, firstname · gender · hiredate"
      rows={rows}
      columns={[
        { key:'empno',      label:'Emp No',   style:{ fontFamily:'var(--font-mono)', fontSize:12 } },
        { key:'fullname',   label:'Name (Last, First)' },
        { key:'gender',     label:'Gender',   render: v => <span className={`badge ${v==='Male'?'badge-blue':'badge-purple'}`}>{v || '—'}</span> },
        { key:'hiredate',   label:'Hire Date', style:{ color:'var(--text-secondary)' } },
        { key:'department', label:'Department' },
      ]}
    />
  );
}

export function ProductLookupPage() {
  const { products, getCurrentPrice, loading } = useApp();
  const rows = products.map(p => ({
    ...p,
    currentPrice: getCurrentPrice(p.prodCode)?.unitPrice
                ?? getCurrentPrice(p.prodCode)?.unit_price
                ?? '—',
  }));
  return (
    <LookupTable
      title="Product Lookup" loading={loading}
      subtitle="prodCode · description · unit · current price"
      rows={rows}
      columns={[
        { key:'prodCode',     label:'Prod Code', style:{ fontFamily:'var(--font-mono)', fontSize:12 } },
        { key:'description',  label:'Description' },
        { key:'unit',         label:'Unit', style:{ color:'var(--text-secondary)' } },
        { key:'currentPrice', label:'Current Price',
          render: v => <span style={{ fontWeight:600 }}>{v !== '—' ? `$${Number(v).toLocaleString()}` : '—'}</span> },
      ]}
    />
  );
}

export function PriceHistoryPage() {
  const { priceHist, products, loading } = useApp();
  const rows = [...priceHist]
    .map(ph => ({
      ...ph,
      unitPrice: ph.unitPrice ?? ph.unit_price,
      description: products.find(p => p.prodCode === ph.prodCode)?.description || ph.prodCode,
    }))
    .sort((a, b) => new Date(b.effDate) - new Date(a.effDate));

  return (
    <LookupTable
      title="Price History" loading={loading}
      subtitle="prodCode · effDate · unitPrice"
      rows={rows}
      columns={[
        { key:'prodCode',    label:'Prod Code',   style:{ fontFamily:'var(--font-mono)', fontSize:12 } },
        { key:'description', label:'Description', style:{ color:'var(--text-secondary)' } },
        { key:'effDate',     label:'Effective Date' },
        { key:'unitPrice',   label:'Unit Price',
          render: v => <span style={{ fontWeight:600 }}>${Number(v).toLocaleString()}</span> },
      ]}
    />
  );
}
