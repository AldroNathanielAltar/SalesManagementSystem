/**
 * PR-02: feat/ui-reports
 * Sprint 3 M2 — 4 Report pages from Supabase views:
 *   1. SalesByEmployeePage  — sales_by_employee view
 *   2. SalesByCustomerPage  — sales_by_customer view
 *   3. TopProductsPage      — top_products_sold view
 *   4. MonthlySalesTrendPage — monthly_sales_trend view
 *
 * Each page:
 * - Fetches from Supabase view
 * - Loading skeleton
 * - Empty state message
 * - Error state
 * - Sortable table
 * - Bar chart (Recharts)
 * - Mobile responsive
 */
import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Users,
  ShoppingBag,
  Package,
  TrendingUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  AlertCircle,
  RefreshCw,
  Star,
  Calendar,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import "./ReportsPage.css";

/* ── Shared tooltip style ── */
const TT = {
  background: "#fff",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 13,
  padding: "8px 12px",
  boxShadow: "var(--shadow-md)",
};

/* ── Loading skeleton ── */
function ReportSkeleton({ rows = 5 }) {
  return (
    <div className="rp-skeleton">
      <div className="rp-skel rp-skel-title" />
      <div className="rp-skel rp-skel-chart" />
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="rp-skel-row">
          <div className="rp-skel rp-skel-cell" style={{ width: "30%" }} />
          <div className="rp-skel rp-skel-cell" style={{ width: "15%" }} />
          <div className="rp-skel rp-skel-cell" style={{ width: "20%" }} />
        </div>
      ))}
    </div>
  );
}

/* ── Error state ── */
function ReportError({ message, onRetry }) {
  return (
    <div className="rp-error">
      <AlertCircle size={36} style={{ color: "var(--red)", opacity: 0.7 }} />
      <h3>Failed to load report</h3>
      <p>{message}</p>
      <button className="btn btn-secondary" onClick={onRetry}>
        <RefreshCw size={14} /> Retry
      </button>
    </div>
  );
}

/* ── Empty state ── */
function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="rp-empty">
      <Icon size={40} style={{ opacity: 0.25 }} />
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
  );
}

/* ── Sort helper ── */
function useSortable(data, defaultKey, defaultDir = "desc") {
  const [sortKey, setSortKey] = useState(defaultKey);
  const [sortDir, setSortDir] = useState(defaultDir);

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...data].sort((a, b) => {
    const va = a[sortKey] ?? 0,
      vb = b[sortKey] ?? 0;
    const num = typeof va === "number";
    const cmp = num ? va - vb : String(va).localeCompare(String(vb));
    return sortDir === "asc" ? cmp : -cmp;
  });

  function SortIcon({ col }) {
    if (sortKey !== col)
      return <ArrowUpDown size={12} style={{ opacity: 0.35 }} />;
    return sortDir === "asc" ? (
      <ArrowUp size={12} style={{ color: "var(--accent)" }} />
    ) : (
      <ArrowDown size={12} style={{ color: "var(--accent)" }} />
    );
  }

  return { sorted, sortKey, sortDir, toggleSort, SortIcon };
}

/* ══════════════════════════════════════════════════════════════════
   1. SALES BY EMPLOYEE
══════════════════════════════════════════════════════════════════ */
export function SalesByEmployeePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { sorted, toggleSort, SortIcon } = useSortable(data, "total_revenue");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data: rows, error: err } = await supabase
      .from("sales_by_employee")
      .select("*");
    if (err) setError(err.message);
    else setData(rows || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="fade-in rp-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Sales by Employee</h2>
          <p className="page-subtitle">
            Revenue and transaction count per employee
          </p>
        </div>
        <button className="btn btn-secondary" onClick={load} disabled={loading}>
          <RefreshCw
            size={14}
            style={loading ? { animation: "spin .7s linear infinite" } : {}}
          />
          Refresh
        </button>
      </div>

      {loading && <ReportSkeleton />}
      {!loading && error && <ReportError message={error} onRetry={load} />}
      {!loading && !error && data.length === 0 && (
        <EmptyState
          icon={Users}
          title="No data yet"
          subtitle="No transactions found. Create some sales to see employee performance."
        />
      )}

      {!loading && !error && data.length > 0 && (
        <>
          {/* Bar chart */}
          <div className="card rp-chart-card">
            <p className="rp-chart-title">Revenue by Employee</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sorted.slice(0, 10)} barSize={32}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="empname"
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={TT}
                  formatter={(v) => [`$${Number(v).toLocaleString()}`]}
                />
                <Bar
                  dataKey="total_revenue"
                  name="Revenue"
                  radius={[4, 4, 0, 0]}
                >
                  {sorted.slice(0, 10).map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#2563eb" : "#93c5fd"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="table-wrap" style={{ marginTop: 16 }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>
                    <button
                      className="rp-sort-btn"
                      onClick={() => toggleSort("empname")}
                    >
                      Employee <SortIcon col="empname" />
                    </button>
                  </th>
                  <th>
                    <button
                      className="rp-sort-btn"
                      onClick={() => toggleSort("total_transactions")}
                    >
                      Transactions <SortIcon col="total_transactions" />
                    </button>
                  </th>
                  <th>
                    <button
                      className="rp-sort-btn"
                      onClick={() => toggleSort("total_revenue")}
                    >
                      Total Revenue <SortIcon col="total_revenue" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, i) => (
                  <tr key={row.empno || i}>
                    <td style={{ color: "var(--text-muted)", fontWeight: 700 }}>
                      #{i + 1}
                    </td>
                    <td>{row.empname || row.empno || "—"}</td>
                    <td>{row.total_transactions ?? 0}</td>
                    <td style={{ fontWeight: 600 }}>
                      ${Number(row.total_revenue ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   2. SALES BY CUSTOMER
══════════════════════════════════════════════════════════════════ */
export function SalesByCustomerPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { sorted, toggleSort, SortIcon } = useSortable(data, "total_revenue");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data: rows, error: err } = await supabase
      .from("sales_by_customer")
      .select("*");
    if (err) setError(err.message);
    else setData(rows || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const topCustomer =
    data.length > 0
      ? [...data].sort(
          (a, b) => (b.total_revenue ?? 0) - (a.total_revenue ?? 0),
        )[0]
      : null;

  return (
    <div className="fade-in rp-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Sales by Customer</h2>
          <p className="page-subtitle">
            Total spend and transaction count per customer
          </p>
        </div>
        <button className="btn btn-secondary" onClick={load} disabled={loading}>
          <RefreshCw
            size={14}
            style={loading ? { animation: "spin .7s linear infinite" } : {}}
          />
          Refresh
        </button>
      </div>

      {/* Top customer highlight */}
      {!loading && !error && topCustomer && (
        <div className="rp-top-banner">
          <Star size={16} style={{ color: "var(--amber)", flexShrink: 0 }} />
          <span>
            <strong>Top Customer: </strong>
            {topCustomer.custname} —{" "}
            <strong>
              ${Number(topCustomer.total_revenue ?? 0).toLocaleString()}
            </strong>{" "}
            total spend across {topCustomer.total_transactions} transaction
            {topCustomer.total_transactions !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {loading && <ReportSkeleton />}
      {!loading && error && <ReportError message={error} onRetry={load} />}
      {!loading && !error && data.length === 0 && (
        <EmptyState
          icon={ShoppingBag}
          title="No data yet"
          subtitle="No transactions found. Create some sales to see customer spend."
        />
      )}

      {!loading && !error && data.length > 0 && (
        <>
          <div className="card rp-chart-card">
            <p className="rp-chart-title">Revenue by Customer (Top 10)</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sorted.slice(0, 10)} barSize={32}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="custname"
                  tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) =>
                    v?.length > 12 ? v.slice(0, 12) + "…" : v
                  }
                />
                <YAxis
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={TT}
                  formatter={(v) => [`$${Number(v).toLocaleString()}`]}
                />
                <Bar
                  dataKey="total_revenue"
                  name="Revenue"
                  radius={[4, 4, 0, 0]}
                >
                  {sorted.slice(0, 10).map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#16a34a" : "#86efac"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="table-wrap" style={{ marginTop: 16 }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>
                    <button
                      className="rp-sort-btn"
                      onClick={() => toggleSort("custname")}
                    >
                      Customer <SortIcon col="custname" />
                    </button>
                  </th>
                  <th>
                    <button
                      className="rp-sort-btn"
                      onClick={() => toggleSort("total_transactions")}
                    >
                      Transactions <SortIcon col="total_transactions" />
                    </button>
                  </th>
                  <th>
                    <button
                      className="rp-sort-btn"
                      onClick={() => toggleSort("total_revenue")}
                    >
                      Total Spend <SortIcon col="total_revenue" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, i) => (
                  <tr
                    key={row.custno || i}
                    className={i === 0 ? "rp-top-row" : ""}
                  >
                    <td style={{ color: "var(--text-muted)", fontWeight: 700 }}>
                      {i === 0
                        ? "🥇"
                        : i === 1
                          ? "🥈"
                          : i === 2
                            ? "🥉"
                            : `#${i + 1}`}
                    </td>
                    <td>
                      {row.custname || row.custno || "—"}
                      {i === 0 && <span className="rp-top-tag">Top</span>}
                    </td>
                    <td>{row.total_transactions ?? 0}</td>
                    <td style={{ fontWeight: 600 }}>
                      ${Number(row.total_revenue ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   3. TOP PRODUCTS
══════════════════════════════════════════════════════════════════ */
export function TopProductsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { sorted, toggleSort, SortIcon } = useSortable(data, "total_revenue");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data: rows, error: err } = await supabase
      .from("top_products_sold")
      .select("*");
    if (err) setError(err.message);
    else setData(rows || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const COLORS = [
    "#7c3aed",
    "#2563eb",
    "#0891b2",
    "#059669",
    "#d97706",
    "#dc2626",
    "#db2777",
    "#9333ea",
  ];

  return (
    <div className="fade-in rp-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Top Products Sold</h2>
          <p className="page-subtitle">Products ranked by total revenue</p>
        </div>
        <button className="btn btn-secondary" onClick={load} disabled={loading}>
          <RefreshCw
            size={14}
            style={loading ? { animation: "spin .7s linear infinite" } : {}}
          />
          Refresh
        </button>
      </div>

      {loading && <ReportSkeleton />}
      {!loading && error && <ReportError message={error} onRetry={load} />}
      {!loading && !error && data.length === 0 && (
        <EmptyState
          icon={Package}
          title="No data yet"
          subtitle="No sales detail records found. Add line items to sales to see product rankings."
        />
      )}

      {!loading && !error && data.length > 0 && (
        <>
          <div className="card rp-chart-card">
            <p className="rp-chart-title">Top Products by Revenue</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={sorted.slice(0, 10)}
                layout="vertical"
                barSize={20}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="description"
                  width={140}
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) =>
                    v?.length > 18 ? v.slice(0, 18) + "…" : v
                  }
                />
                <Tooltip
                  contentStyle={TT}
                  formatter={(v) => [`$${Number(v).toLocaleString()}`]}
                />
                <Bar
                  dataKey="total_revenue"
                  name="Revenue"
                  radius={[0, 4, 4, 0]}
                >
                  {sorted.slice(0, 10).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="table-wrap" style={{ marginTop: 16 }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>
                    <button
                      className="rp-sort-btn"
                      onClick={() => toggleSort("description")}
                    >
                      Product <SortIcon col="description" />
                    </button>
                  </th>
                  <th>
                    <button
                      className="rp-sort-btn"
                      onClick={() => toggleSort("total_qty_sold")}
                    >
                      Qty Sold <SortIcon col="total_qty_sold" />
                    </button>
                  </th>
                  <th>
                    <button
                      className="rp-sort-btn"
                      onClick={() => toggleSort("total_revenue")}
                    >
                      Revenue <SortIcon col="total_revenue" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, i) => (
                  <tr key={row.prodCode || i}>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          background: COLORS[i % COLORS.length] + "22",
                          color: COLORS[i % COLORS.length],
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td>{row.description || row.prodCode || "—"}</td>
                    <td>{row.total_qty_sold ?? 0}</td>
                    <td style={{ fontWeight: 600 }}>
                      ${Number(row.total_revenue ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   4. MONTHLY SALES TREND
══════════════════════════════════════════════════════════════════ */
export function MonthlySalesTrendPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data: rows, error: err } = await supabase
      .from("monthly_sales_trend")
      .select("*")
      .order("sale_month", { ascending: true });
    if (err) setError(err.message);
    else setData(rows || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* Year filter */
  const years = [
    ...new Set(data.map((r) => r.sale_month?.slice(0, 4)).filter(Boolean)),
  ].sort();

  const filtered = yearFilter
    ? data.filter((r) => r.sale_month?.startsWith(yearFilter))
    : data;

  const chartData = filtered.map((r) => ({
    ...r,
    label: r.sale_month || "—",
    revenue: Number(r.total_revenue ?? 0),
    orders: Number(r.transaction_count ?? 0),
  }));

  const totalRev = filtered.reduce(
    (s, r) => s + Number(r.total_revenue ?? 0),
    0,
  );
  const totalOrders = filtered.reduce(
    (s, r) => s + Number(r.transaction_count ?? 0),
    0,
  );

  return (
    <div className="fade-in rp-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Monthly Sales Trend</h2>
          <p className="page-subtitle">
            Revenue and transaction count by month
          </p>
        </div>
        <div className="page-actions">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={14} style={{ color: "var(--text-muted)" }} />
            <select
              className="form-input"
              style={{ width: "auto" }}
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            {yearFilter && (
              <button
                className="btn-icon"
                onClick={() => setYearFilter("")}
                title="Clear filter"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <button
            className="btn btn-secondary"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw
              size={14}
              style={loading ? { animation: "spin .7s linear infinite" } : {}}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* KPIs */}
      {!loading && !error && filtered.length > 0 && (
        <div className="rp-kpi-row">
          <div className="rp-kpi">
            <p className="rp-kpi-val">${totalRev.toLocaleString()}</p>
            <p className="rp-kpi-label">
              Total Revenue{yearFilter ? ` (${yearFilter})` : ""}
            </p>
          </div>
          <div className="rp-kpi">
            <p className="rp-kpi-val">{totalOrders}</p>
            <p className="rp-kpi-label">Total Transactions</p>
          </div>
          <div className="rp-kpi">
            <p className="rp-kpi-val">{filtered.length}</p>
            <p className="rp-kpi-label">Months of Data</p>
          </div>
          <div className="rp-kpi">
            <p className="rp-kpi-val">
              ${totalOrders > 0 ? (totalRev / totalOrders).toFixed(0) : "0"}
            </p>
            <p className="rp-kpi-label">Avg. Order Value</p>
          </div>
        </div>
      )}

      {loading && <ReportSkeleton />}
      {!loading && error && <ReportError message={error} onRetry={load} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={TrendingUp}
          title="No data for this period"
          subtitle={
            yearFilter
              ? `No transactions found for ${yearFilter}.`
              : "No transaction data available yet."
          }
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          {/* Dual-axis bar + line chart */}
          <div className="card rp-chart-card">
            <p className="rp-chart-title">Revenue & Transactions by Month</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barSize={28}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={TT}
                  formatter={(v, name) =>
                    name === "Revenue"
                      ? [`$${Number(v).toLocaleString()}`, "Revenue"]
                      : [v, "Transactions"]
                  }
                />
                <Legend
                  wrapperStyle={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="Revenue"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  name="Transactions"
                  stroke="#d97706"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#d97706" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="table-wrap" style={{ marginTop: 16 }}>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Transactions</th>
                  <th>Total Revenue</th>
                  <th>Avg. Per Transaction</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, i) => (
                  <tr key={row.label}>
                    <td style={{ fontWeight: 600 }}>{row.label}</td>
                    <td>{row.orders}</td>
                    <td style={{ fontWeight: 600 }}>
                      ${row.revenue.toLocaleString()}
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      $
                      {row.orders > 0
                        ? (row.revenue / row.orders).toFixed(0)
                        : "0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
