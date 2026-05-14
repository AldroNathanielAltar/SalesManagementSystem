import { useState, useEffect, useCallback, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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
  AlertCircle,
  RefreshCw,
  Star,
  Calendar,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import "./ReportsPage.css";

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

function ReportError({ message, onRetry }) {
  return (
    <div className="rp-error">
      <AlertCircle size={36} style={{ color: "var(--red)", opacity: 0.7 }} />
      <h3>Failed to load report</h3>
      <p>{message}</p>
      <button className="btn btn-primary" onClick={onRetry}>
        <RefreshCw size={14} /> Retry
      </button>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="rp-empty">
      <Icon size={40} style={{ opacity: 0.25 }} />
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
  );
}

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
    const va = a[sortKey] ?? 0;
    const vb = b[sortKey] ?? 0;
    const cmp =
      typeof va === "number" ? va - vb : String(va).localeCompare(String(vb));
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

  return { sorted, toggleSort, SortIcon };
}

/* ══════════════════════════════════════════════════════════
   1. SALES BY EMPLOYEE - FIXED with Revenue
══════════════════════════════════════════════════════════ */
export function SalesByEmployeePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);

  const loadData = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    setError("");

    try {
      // Get all active sales
      const { data: salesData, error: salesError } = await supabase
        .from("sales")
        .select(
          `
          transno,
          empno,
          record_status
        `,
        )
        .eq("record_status", "ACTIVE");

      if (salesError) throw salesError;

      // Get all sales details with quantities
      const { data: detailsData, error: detailsError } = await supabase
        .from("salesdetail")
        .select(
          `
          transno,
          prodcode,
          quantity
        `,
        )
        .eq("record_status", "ACTIVE");

      if (detailsError) throw detailsError;

      // Get all prices from pricehist (latest price per product)
      const { data: priceData, error: priceError } = await supabase
        .from("pricehist")
        .select("prodcode, unitprice, effdate")
        .order("effdate", { ascending: false });

      if (priceError) throw priceError;

      // Get latest price per product
      const latestPriceMap = new Map();
      priceData?.forEach((price) => {
        if (!latestPriceMap.has(price.prodcode)) {
          latestPriceMap.set(price.prodcode, Number(price.unitprice) || 0);
        }
      });

      // Calculate revenue per transaction
      const transactionRevenue = new Map();
      detailsData?.forEach((detail) => {
        const transno = detail.transno;
        const quantity = Number(detail.quantity) || 0;
        const price = latestPriceMap.get(detail.prodcode) || 0;
        const revenue = quantity * price;

        transactionRevenue.set(
          transno,
          (transactionRevenue.get(transno) || 0) + revenue,
        );
      });

      // Get employee names
      const { data: employeesData } = await supabase
        .from("employee")
        .select("empno, firstname, lastname");

      const employeeNameMap = new Map();
      employeesData?.forEach((emp) => {
        employeeNameMap.set(emp.empno, `${emp.lastname}, ${emp.firstname}`);
      });

      // Aggregate by employee
      const employeeMap = new Map();
      salesData?.forEach((sale) => {
        const empno = sale.empno;
        if (!empno) return;

        if (!employeeMap.has(empno)) {
          employeeMap.set(empno, {
            empno: empno,
            empname: employeeNameMap.get(empno) || empno,
            total_transactions: 0,
            total_revenue: 0,
          });
        }

        const record = employeeMap.get(empno);
        record.total_transactions += 1;
        record.total_revenue += transactionRevenue.get(sale.transno) || 0;
      });

      if (mountedRef.current) {
        setData(
          Array.from(employeeMap.values()).filter(
            (e) => e.total_transactions > 0,
          ),
        );
      }
    } catch (err) {
      console.error("Sales by employee error:", err);
      if (mountedRef.current) setError(err.message || "Failed to load");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadData();
    return () => {
      mountedRef.current = false;
    };
  }, [loadData]);

  const { sorted, toggleSort, SortIcon } = useSortable(data, "total_revenue");

  const totalRevenue = data.reduce((sum, row) => sum + row.total_revenue, 0);
  const totalTransactions = data.reduce(
    (sum, row) => sum + row.total_transactions,
    0,
  );

  return (
    <div className="fade-in rp-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Sales by Employee</h2>
          <p className="page-subtitle">
            Revenue and transaction count per employee
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw
            size={14}
            style={loading ? { animation: "spin .7s linear infinite" } : {}}
          />
          Refresh
        </button>
      </div>

      {/* Summary KPIs */}
      {!loading && !error && data.length > 0 && (
        <div className="rp-kpi-row">
          <div className="rp-kpi">
            <p className="rp-kpi-val">{data.length}</p>
            <p className="rp-kpi-label">Active Employees</p>
          </div>
          <div className="rp-kpi">
            <p className="rp-kpi-val">{totalTransactions}</p>
            <p className="rp-kpi-label">Total Transactions</p>
          </div>
          <div className="rp-kpi">
            <p className="rp-kpi-val">${totalRevenue.toLocaleString()}</p>
            <p className="rp-kpi-label">Total Revenue</p>
          </div>
          <div className="rp-kpi">
            <p className="rp-kpi-val">
              $
              {totalTransactions > 0
                ? (totalRevenue / totalTransactions).toFixed(2)
                : "0"}
            </p>
            <p className="rp-kpi-label">Avg. Transaction Value</p>
          </div>
        </div>
      )}

      {loading && <ReportSkeleton />}
      {!loading && error && <ReportError message={error} onRetry={loadData} />}
      {!loading && !error && data.length === 0 && (
        <EmptyState
          icon={Users}
          title="No data yet"
          subtitle="No transactions found. Create some sales to see employee performance."
        />
      )}
      {!loading && !error && data.length > 0 && (
        <>
          <div className="card rp-chart-card">
            <p className="rp-chart-title">Revenue by Employee (Top 10)</p>
            <ResponsiveContainer width="100%" height={260}>
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
                  formatter={(v) => [
                    `$${Number(v).toLocaleString()}`,
                    "Revenue",
                  ]}
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
          <div className="table-wrap" style={{ marginTop: 16 }}>
            <table className="rp-table">
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
                  <tr key={row.empno}>
                    <td style={{ color: "var(--text-muted)", fontWeight: 700 }}>
                      #{i + 1}
                    </td>
                    <td>{row.empname}</td>
                    <td>{row.total_transactions ?? 0}</td>
                    <td style={{ fontWeight: 600, color: "var(--accent)" }}>
                      ${(row.total_revenue ?? 0).toLocaleString()}
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

/* ══════════════════════════════════════════════════════════
   2. SALES BY CUSTOMER - FIXED with Revenue
══════════════════════════════════════════════════════════ */
export function SalesByCustomerPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);

  const loadData = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    setError("");

    try {
      // Try to use sales_by_customer view first
      const { data: viewData, error: viewError } = await supabase
        .from("sales_by_customer")
        .select("*")
        .order("totalrevenue", { ascending: false });

      if (!viewError && viewData && viewData.length > 0) {
        setData(
          viewData.map((c) => ({
            custno: c.custno,
            custname: c.custname,
            payterm: c.payterm,
            total_transactions: Number(c.totaltransactions) || 0,
            total_revenue: Number(c.totalrevenue) || 0,
          })),
        );
      } else {
        // Fallback: calculate from raw data
        const { data: salesData, error: salesError } = await supabase
          .from("sales")
          .select("custno, transno")
          .eq("record_status", "ACTIVE");

        if (salesError) throw salesError;

        const { data: detailsData } = await supabase
          .from("salesdetail")
          .select("transno, prodcode, quantity")
          .eq("record_status", "ACTIVE");

        const { data: priceData } = await supabase
          .from("pricehist")
          .select("prodcode, unitprice")
          .order("effdate", { ascending: false });

        const latestPriceMap = new Map();
        priceData?.forEach((p) => {
          if (!latestPriceMap.has(p.prodcode)) {
            latestPriceMap.set(p.prodcode, Number(p.unitprice) || 0);
          }
        });

        const transRevenue = new Map();
        detailsData?.forEach((d) => {
          const rev = (d.quantity || 0) * (latestPriceMap.get(d.prodcode) || 0);
          transRevenue.set(d.transno, (transRevenue.get(d.transno) || 0) + rev);
        });

        const { data: customersData } = await supabase
          .from("customer")
          .select("custno, custname, payterm");

        const customerMap = new Map();
        customersData?.forEach((c) => {
          customerMap.set(c.custno, {
            custname: c.custname,
            payterm: c.payterm,
          });
        });

        const aggMap = new Map();
        salesData?.forEach((sale) => {
          const custno = sale.custno;
          if (!custno) return;

          if (!aggMap.has(custno)) {
            const custInfo = customerMap.get(custno) || {};
            aggMap.set(custno, {
              custno: custno,
              custname: custInfo.custname || custno,
              payterm: custInfo.payterm || "—",
              total_transactions: 0,
              total_revenue: 0,
            });
          }
          const record = aggMap.get(custno);
          record.total_transactions += 1;
          record.total_revenue += transRevenue.get(sale.transno) || 0;
        });

        setData(
          Array.from(aggMap.values()).filter((c) => c.total_transactions > 0),
        );
      }
    } catch (err) {
      console.error("Sales by customer error:", err);
      if (mountedRef.current) setError(err.message || "Failed to load");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadData();
    return () => {
      mountedRef.current = false;
    };
  }, [loadData]);

  const { sorted, toggleSort, SortIcon } = useSortable(data, "total_revenue");
  const topCustomer = data.length > 0 ? sorted[0] : null;

  return (
    <div className="fade-in rp-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Sales by Customer</h2>
          <p className="page-subtitle">
            Total spend and transaction count per customer
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw
            size={14}
            style={loading ? { animation: "spin .7s linear infinite" } : {}}
          />
          Refresh
        </button>
      </div>

      {!loading && !error && topCustomer && (
        <div className="rp-top-banner">
          <Star size={16} style={{ color: "var(--amber)", flexShrink: 0 }} />
          <span>
            <strong>Top Customer: </strong>
            {topCustomer.custname} —{" "}
            <strong>
              ${Number(topCustomer.total_revenue ?? 0).toLocaleString()}
            </strong>{" "}
            total spend
          </span>
        </div>
      )}

      {loading && <ReportSkeleton />}
      {!loading && error && <ReportError message={error} onRetry={loadData} />}
      {!loading && !error && data.length === 0 && (
        <EmptyState
          icon={ShoppingBag}
          title="No data yet"
          subtitle="No transactions found."
        />
      )}
      {!loading && !error && data.length > 0 && (
        <>
          <div className="card rp-chart-card">
            <p className="rp-chart-title">Revenue by Customer (Top 10)</p>
            <ResponsiveContainer width="100%" height={260}>
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
                    v?.length > 15 ? v.slice(0, 15) + "…" : v
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
                  fill="#16a34a"
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
            <table className="rp-table">
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
                  <tr key={row.custno} className={i === 0 ? "rp-top-row" : ""}>
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
                      {row.custname}
                      {i === 0 && <span className="rp-top-tag">Top</span>}
                    </td>
                    <td>{row.total_transactions ?? 0}</td>
                    <td style={{ fontWeight: 600, color: "var(--accent)" }}>
                      ${(row.total_revenue ?? 0).toLocaleString()}
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

/* ══════════════════════════════════════════════════════════
   3. TOP PRODUCTS
══════════════════════════════════════════════════════════ */
export function TopProductsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);

  const loadData = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    setError("");

    try {
      // Try to use top_products_sold view first
      const { data: viewData, error: viewError } = await supabase
        .from("top_products_sold")
        .select("*")
        .order("totalrevenue", { ascending: false });

      if (!viewError && viewData && viewData.length > 0) {
        setData(
          viewData.map((p) => ({
            prodcode: p.prodcode,
            description: p.description,
            total_qty_sold: Number(p.totalquantity) || 0,
            total_revenue: Number(p.totalrevenue) || 0,
          })),
        );
      } else {
        // Fallback: aggregate from salesdetail
        const { data: detailsData, error: detailsError } = await supabase
          .from("salesdetail")
          .select("prodcode, quantity")
          .eq("record_status", "ACTIVE");

        if (detailsError) throw detailsError;

        const { data: productsDataLookup } = await supabase
          .from("product")
          .select("prodcode, description");

        const productDescMap = new Map();
        productsDataLookup?.forEach((p) => {
          productDescMap.set(p.prodcode, p.description);
        });

        const aggMap = new Map();
        detailsData?.forEach((detail) => {
          const prodcode = detail.prodcode;
          if (!prodcode) return;

          if (!aggMap.has(prodcode)) {
            aggMap.set(prodcode, {
              prodcode: prodcode,
              description: productDescMap.get(prodcode) || prodcode,
              total_qty_sold: 0,
              total_revenue: 0,
            });
          }
          const record = aggMap.get(prodcode);
          record.total_qty_sold += Number(detail.quantity) || 0;
        });

        setData(Array.from(aggMap.values()));
      }
    } catch (err) {
      console.error("Top products error:", err);
      if (mountedRef.current) setError(err.message || "Failed to load");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadData();
    return () => {
      mountedRef.current = false;
    };
  }, [loadData]);

  const { sorted, toggleSort, SortIcon } = useSortable(data, "total_qty_sold");
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
          <p className="page-subtitle">Products ranked by quantity sold</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw
            size={14}
            style={loading ? { animation: "spin .7s linear infinite" } : {}}
          />{" "}
          Refresh
        </button>
      </div>

      {loading && <ReportSkeleton />}
      {!loading && error && <ReportError message={error} onRetry={loadData} />}
      {!loading && !error && data.length === 0 && (
        <EmptyState
          icon={Package}
          title="No data yet"
          subtitle="Add line items to sales to see product rankings."
        />
      )}
      {!loading && !error && data.length > 0 && (
        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table className="rp-table">
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
              </tr>
            </thead>
            <tbody>
              {sorted.slice(0, 20).map((row, i) => (
                <tr key={row.prodcode}>
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
                  <td>{row.description || row.prodcode}</td>
                  <td>{row.total_qty_sold ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   4. MONTHLY SALES TREND
══════════════════════════════════════════════════════════ */
export function MonthlySalesTrendPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const mountedRef = useRef(true);

  const loadData = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    setError("");

    try {
      // Try to use monthly_sales_trend view first
      const { data: viewData, error: viewError } = await supabase
        .from("monthly_sales_trend")
        .select("*")
        .order("salemonth", { ascending: false });

      if (!viewError && viewData && viewData.length > 0) {
        setData(
          viewData.map((m) => ({
            salemonth: m.salemonth,
            total_transactions: Number(m.totaltransactions) || 0,
            total_revenue: Number(m.totalrevenue) || 0,
          })),
        );
      } else {
        // Fallback: aggregate from sales table by month
        const { data: salesRaw, error: salesError } = await supabase
          .from("sales")
          .select("salesdate")
          .eq("record_status", "ACTIVE");

        if (salesError) throw salesError;

        const monthMap = new Map();
        salesRaw?.forEach((sale) => {
          if (!sale.salesdate) return;

          const date = new Date(sale.salesdate);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          const displayMonth = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          });

          if (!monthMap.has(monthKey)) {
            monthMap.set(monthKey, {
              salemonth: displayMonth,
              monthKey: monthKey,
              total_transactions: 0,
              total_revenue: 0,
            });
          }
          const record = monthMap.get(monthKey);
          record.total_transactions += 1;
        });

        setData(
          Array.from(monthMap.values()).sort((a, b) =>
            b.monthKey.localeCompare(a.monthKey),
          ),
        );
      }
    } catch (err) {
      console.error("Monthly sales trend error:", err);
      if (mountedRef.current) setError(err.message || "Failed to load");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadData();
    return () => {
      mountedRef.current = false;
    };
  }, [loadData]);

  const years = [
    ...new Set(data.map((r) => r.salemonth?.slice(-4)).filter(Boolean)),
  ].sort();
  const filtered = yearFilter
    ? data.filter((r) => r.salemonth?.includes(yearFilter))
    : data;
  const totalTransactions = filtered.reduce(
    (s, r) => s + r.total_transactions,
    0,
  );

  return (
    <div className="fade-in rp-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Monthly Sales Trend</h2>
          <p className="page-subtitle">Transaction count by month</p>
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
              <button className="btn-icon" onClick={() => setYearFilter("")}>
                <X size={13} />
              </button>
            )}
          </div>
          <button
            className="btn btn-secondary"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw
              size={14}
              style={loading ? { animation: "spin .7s linear infinite" } : {}}
            />{" "}
            Refresh
          </button>
        </div>
      </div>

      {!loading && !error && filtered.length > 0 && (
        <div className="rp-kpi-row">
          <div className="rp-kpi">
            <p className="rp-kpi-val">{totalTransactions}</p>
            <p className="rp-kpi-label">Total Transactions</p>
          </div>
          <div className="rp-kpi">
            <p className="rp-kpi-val">{filtered.length}</p>
            <p className="rp-kpi-label">Months of Data</p>
          </div>
          <div className="rp-kpi">
            <p className="rp-kpi-val">
              {filtered.length > 0
                ? (totalTransactions / filtered.length).toFixed(1)
                : "0"}
            </p>
            <p className="rp-kpi-label">Avg. Monthly Transactions</p>
          </div>
        </div>
      )}

      {loading && <ReportSkeleton />}
      {!loading && error && <ReportError message={error} onRetry={loadData} />}
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
          <div className="card rp-chart-card">
            <p className="rp-chart-title">Transactions by Month</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={filtered} barSize={40}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="salemonth"
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={TT}
                  formatter={(v) => [v, "Transactions"]}
                />
                <Bar
                  dataKey="total_transactions"
                  name="Transactions"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                >
                  {filtered.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#2563eb" : "#93c5fd"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="table-wrap" style={{ marginTop: 16 }}>
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Transactions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.salemonth}>
                    <td style={{ fontWeight: 600 }}>{row.salemonth}</td>
                    <td>{row.total_transactions}</td>
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
