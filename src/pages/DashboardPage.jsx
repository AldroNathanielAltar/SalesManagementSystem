import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { useApp } from '../context/AppContext.jsx'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler)

const G = '#40916c', GA = 'rgba(64,145,108,0.12)', B = '#4895ef'
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun']

export default function Dashboard() {
  const { sales, customers, formatPeso, formatDate, badgeClass } = useApp()

  const stats = useMemo(() => {
    const rev  = sales.reduce((s,o) => s + Number(o.total), 0)
    const avg  = sales.length ? Math.round(rev / sales.length) : 0
    return { rev, orders: sales.length, customers: customers.length, avg }
  }, [sales, customers])

  const recent = useMemo(() => [...sales].slice(-5).reverse(), [sales])

  const lineOpts = { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}},y:{grid:{color:'#f0f4f2'},ticks:{callback:v=>v/1000+'k'}}} }
  const barOpts  = { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}},y:{grid:{color:'#f0f4f2'}}} }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening with your sales today.</p>
        </div>
        <div className="page-header-right">
          <span style={{background:'white',border:'1.5px solid var(--border)',padding:'7px 14px',borderRadius:20,fontSize:13,color:'var(--text-mid)',fontWeight:500}}>
            {new Date().toLocaleDateString('en-PH',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
          </span>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="stat-grid">
        <div className="stat-card">
          <div><div className="stat-label">Total Revenue</div><div className="stat-value">{formatPeso(stats.rev)}</div><div className="stat-change up">↑ +12.5%</div></div>
          <div className="stat-icon green"><svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
        </div>
        <div className="stat-card blue">
          <div><div className="stat-label">Total Orders</div><div className="stat-value">{stats.orders}</div><div className="stat-change up">↑ +8.2%</div></div>
          <div className="stat-icon blue"><svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></div>
        </div>
        <div className="stat-card">
          <div><div className="stat-label">Total Customers</div><div className="stat-value">{stats.customers}</div><div className="stat-change up">↑ +5.3%</div></div>
          <div className="stat-icon teal"><svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
        </div>
        <div className="stat-card red">
          <div><div className="stat-label">Avg. Order Value</div><div className="stat-value">{formatPeso(stats.avg)}</div><div className="stat-change down">↓ -2.1%</div></div>
          <div className="stat-icon light-green"><svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="var(--green-accent)" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="chart-grid">
        <div className="chart-card">
          <h3>Revenue Overview</h3>
          <div className="chart-wrap">
            <Line data={{labels:MONTHS,datasets:[{data:[47000,51000,48000,61000,58000,68000],borderColor:G,backgroundColor:GA,borderWidth:2.5,tension:0.4,fill:true,pointBackgroundColor:G,pointRadius:4,pointHoverRadius:6}]}} options={lineOpts}/>
          </div>
        </div>
        <div className="chart-card">
          <h3>Orders by Month</h3>
          <div className="chart-wrap">
            <Bar data={{labels:MONTHS,datasets:[{data:[130,160,138,148,165,180],backgroundColor:B,borderRadius:5,borderSkipped:false}]}} options={barOpts}/>
          </div>
        </div>
      </div>

      {/* RECENT + DONUT */}
      <div className="chart-grid">
        <div className="table-card" style={{marginBottom:0}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <h3 style={{margin:0}}>Recent Sales</h3>
            <Link to="/sales" style={{fontSize:13,color:'var(--green-accent)',fontWeight:600,textDecoration:'none'}}>View all →</Link>
          </div>
          <table>
            <thead><tr><th>Customer</th><th>Order</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {recent.map(o => (
                <tr key={o.id}>
                  <td><strong>{o.customer}</strong></td>
                  <td><span className="mono">{o.id}</span></td>
                  <td><strong>{formatPeso(o.total)}</strong></td>
                  <td><span className={`badge ${badgeClass(o.status)}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="chart-card" style={{marginBottom:0}}>
          <h3>Sales by Category</h3>
          <div className="chart-wrap">
            <Doughnut
              data={{labels:['Electronics','Clothing','Food','Books','Other'],datasets:[{data:[35,25,20,12,8],backgroundColor:['#40916c','#2d6a4f','#1a3a2a','#95d5b2','#d8f3dc'],borderWidth:0,hoverOffset:4}]}}
              options={{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{position:'right',labels:{padding:14,font:{size:12},usePointStyle:true}}}}}
            />
          </div>
        </div>
      </div>
    </>
  )
}
