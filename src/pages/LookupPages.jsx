import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabaseClient";
import "./LookupPages.css";

// ─── Shared read-only table ───────────────────────────────────────────────────
function LookupTable({
  title,
  subtitle,
  columns,
  rows,
  loading,
  emptyMsg = "No records found.",
}) {
  const [search, setSearch] = useState("");

  const filtered = rows.filter((row) =>
    columns.some((col) =>
      String(row[col.key] ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">{title}</h2>
          <p className="page-subtitle">
            {loading
              ? "Loading…"
              : `${subtitle} — ${filtered.length} of ${rows.length} records`}
          </p>
        </div>
        <div className="search-wrap">
          <Search size={14} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="lookup-readonly-notice">
        🔒 This is a read-only lookup page. No changes can be made here.
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 48,
            gap: 10,
            color: "var(--text-muted)",
          }}
        >
          <Loader2
            size={18}
            style={{ animation: "spin .8s linear infinite" }}
          />
          <span>Loading data…</span>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="lookup-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c.key} style={c.style || {}}>
                      {c.render
                        ? c.render(row[c.key], row)
                        : (row[c.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{
                      textAlign: "center",
                      padding: 36,
                      color: "var(--text-muted)",
                    }}
                  >
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

// ─── CUSTOMER LOOKUP ─────────────────────────────────────────────────────────
export function CustomerLookupPage() {
  const { customers, loading } = useApp();

  return (
    <LookupTable
      title="Customer Lookup"
      loading={loading}
      subtitle="custno · custname · address · payterm"
      rows={customers}
      columns={[
        {
          key: "custno",
          label: "Customer No",
          style: { fontFamily: "var(--font-mono)", fontSize: 12 },
        },
        {
          key: "custname",
          label: "Customer Name",
          style: { fontWeight: 500 },
        },
        {
          key: "address",
          label: "Address",
          style: { color: "var(--text-secondary)" },
          render: (v) => v || "—",
        },
        {
          key: "payterm",
          label: "Pay Term",
          render: (v) => (
            <span className="badge badge-blue">{v || "Standard"}</span>
          ),
        },
      ]}
    />
  );
}

// ─── EMPLOYEE LOOKUP (with department from jobhistory) ───────────────────────
export function EmployeeLookupPage() {
  const { employees, loading } = useApp();

  return (
    <LookupTable
      title="Employee Lookup"
      loading={loading}
      subtitle="empno · name · gender · hiredate · department"
      rows={employees}
      columns={[
        {
          key: "empno",
          label: "Employee No",
          style: { fontFamily: "var(--font-mono)", fontSize: 12 },
        },
        {
          key: "fullname",
          label: "Name (Last, First)",
          render: (v, row) => v || `${row.lastname}, ${row.firstname}`,
        },
        {
          key: "gender",
          label: "Gender",
          render: (v) => (
            <span
              className={`badge ${v === "Male" || v === "M" ? "badge-blue" : "badge-purple"}`}
            >
              {v || "—"}
            </span>
          ),
        },
        {
          key: "hiredate",
          label: "Hire Date",
          style: { color: "var(--text-secondary)" },
          render: (v) => (v ? new Date(v).toLocaleDateString() : "—"),
        },
        {
          key: "department_name",
          label: "Department",
          render: (v) => v || "—",
        },
      ]}
    />
  );
}

// ─── PRODUCT LOOKUP (with product code and current price) ────────────────────
export function ProductLookupPage() {
  const { products, priceHist, loading } = useApp();

  // Get latest price for each product
  const productsWithPrices = products.map((product) => {
    // Find the latest price for this product
    const productPrices = priceHist
      .filter((ph) => ph.prodcode === product.prodcode)
      .sort((a, b) => new Date(b.effdate) - new Date(a.effdate));

    const latestPrice = productPrices[0]?.unitprice || 0;

    return {
      ...product,
      current_price: latestPrice,
      display_price: latestPrice > 0 ? `$${latestPrice.toLocaleString()}` : "—",
    };
  });

  return (
    <LookupTable
      title="Product Lookup"
      loading={loading}
      subtitle="prodcode · description · unit · current price"
      rows={productsWithPrices}
      columns={[
        {
          key: "prodcode",
          label: "Product Code",
          style: { fontFamily: "var(--font-mono)", fontSize: 12 },
        },
        {
          key: "description",
          label: "Description",
          style: { fontWeight: 500 },
        },
        {
          key: "unit",
          label: "Unit",
          style: { color: "var(--text-secondary)" },
          render: (v) => v || "—",
        },
        {
          key: "current_price",
          label: "Current Price",
          render: (v, row) => (
            <span style={{ fontWeight: 600, color: "var(--accent)" }}>
              {row.display_price}
            </span>
          ),
        },
      ]}
    />
  );
}

// ─── PRICE HISTORY (fixed: no NaN, shows product code, effective date) ──────
export function PriceHistoryPage() {
  const { priceHist, products, loading } = useApp();

  // Join price history with products to get product descriptions
  const priceHistoryWithProducts = priceHist.map((price) => {
    const product = products.find((p) => p.prodcode === price.prodcode);
    return {
      ...price,
      product_description: product?.description || "—",
      unitprice: Number(price.unitprice) || 0, // ← Fix NaN
      display_price:
        Number(price.unitprice) > 0
          ? `$${Number(price.unitprice).toLocaleString()}`
          : "$0.00",
    };
  });

  return (
    <LookupTable
      title="Price History"
      loading={loading}
      subtitle="prodcode · description · effective date · unit price"
      rows={priceHistoryWithProducts}
      columns={[
        {
          key: "prodcode",
          label: "Product Code",
          style: { fontFamily: "var(--font-mono)", fontSize: 12 },
        },
        {
          key: "product_description",
          label: "Description",
          style: { color: "var(--text-secondary)" },
        },
        {
          key: "effdate",
          label: "Effective Date",
          render: (v) => (v ? new Date(v).toLocaleDateString() : "—"),
        },
        {
          key: "unitprice",
          label: "Unit Price",
          render: (v, row) => (
            <span style={{ fontWeight: 600, color: "var(--accent)" }}>
              {row.display_price}
            </span>
          ),
        },
      ]}
    />
  );
}

// ─── DEPARTMENT LOOKUP (new) ─────────────────────────────────────────────────
export function DepartmentLookupPage() {
  const { departments, loading } = useApp();

  return (
    <LookupTable
      title="Department Lookup"
      loading={loading}
      subtitle="deptcode · deptname"
      rows={departments}
      columns={[
        {
          key: "deptcode",
          label: "Department Code",
          style: { fontFamily: "var(--font-mono)", fontSize: 12 },
        },
        {
          key: "deptname",
          label: "Department Name",
          style: { fontWeight: 500 },
        },
      ]}
    />
  );
}

// ─── JOB LOOKUP (new) ────────────────────────────────────────────────────────
export function JobLookupPage() {
  const { jobs, loading } = useApp();

  return (
    <LookupTable
      title="Job Lookup"
      loading={loading}
      subtitle="jobcode · jobdesc"
      rows={jobs}
      columns={[
        {
          key: "jobcode",
          label: "Job Code",
          style: { fontFamily: "var(--font-mono)", fontSize: 12 },
        },
        {
          key: "jobdesc",
          label: "Job Description",
          style: { fontWeight: 500 },
        },
      ]}
    />
  );
}

// ─── JOB HISTORY LOOKUP (employee job history) ───────────────────────────────
export function JobHistoryLookupPage() {
  const { jobHistory, employees, jobs, departments, loading } = useApp();

  // Join job history with employee, job, and department info
  const enrichedJobHistory = jobHistory.map((jh) => {
    const employee = employees.find((e) => e.empno === jh.empno);
    const job = jobs.find((j) => j.jobcode === jh.jobcode);
    const department = departments.find((d) => d.deptcode === jh.deptcode);

    return {
      ...jh,
      employee_name: employee
        ? `${employee.lastname}, ${employee.firstname}`
        : jh.empno,
      job_description: job?.jobdesc || "—",
      department_name: department?.deptname || "—",
      salary: Number(jh.salary) || 0,
      effdate: jh.effdate,
    };
  });

  return (
    <LookupTable
      title="Job History Lookup"
      loading={loading}
      subtitle="employee · job · department · salary · effective date"
      rows={enrichedJobHistory}
      columns={[
        {
          key: "employee_name",
          label: "Employee",
          style: { fontWeight: 500 },
        },
        {
          key: "job_description",
          label: "Job",
          style: { color: "var(--text-secondary)" },
        },
        {
          key: "department_name",
          label: "Department",
          style: { color: "var(--text-secondary)" },
        },
        {
          key: "salary",
          label: "Salary",
          render: (v) => (
            <span style={{ fontWeight: 600 }}>
              ${Number(v).toLocaleString()}
            </span>
          ),
        },
        {
          key: "effdate",
          label: "Effective Date",
          render: (v) => (v ? new Date(v).toLocaleDateString() : "—"),
        },
      ]}
    />
  );
}

// ─── PAYMENT LOOKUP (new) ────────────────────────────────────────────────────
export function PaymentLookupPage() {
  const { payments, sales, loading } = useApp();

  // Join payments with sales to get customer info
  const paymentsWithDetails = payments.map((payment) => {
    const sale = sales.find((s) => s.transno === payment.transno);
    return {
      ...payment,
      custname: sale?.custname || "—",
      amount: Number(payment.amount) || 0,
    };
  });

  return (
    <LookupTable
      title="Payment Lookup"
      loading={loading}
      subtitle="orno · transno · customer · paydate · amount"
      rows={paymentsWithDetails}
      columns={[
        {
          key: "orno",
          label: "OR No",
          style: { fontFamily: "var(--font-mono)", fontSize: 12 },
        },
        {
          key: "transno",
          label: "Trans No",
          style: { fontFamily: "var(--font-mono)", fontSize: 12 },
        },
        {
          key: "custname",
          label: "Customer",
          style: { fontWeight: 500 },
        },
        {
          key: "paydate",
          label: "Payment Date",
          render: (v) => (v ? new Date(v).toLocaleDateString() : "—"),
        },
        {
          key: "amount",
          label: "Amount",
          render: (v) => (
            <span style={{ fontWeight: 600, color: "var(--green)" }}>
              ${Number(v).toLocaleString()}
            </span>
          ),
        },
      ]}
    />
  );
}

// ─── RIGHT LOOKUP (for admin) ────────────────────────────────────────────────
export function RightsLookupPage() {
  const { rights, loading } = useApp();

  return (
    <LookupTable
      title="Rights Lookup"
      loading={loading}
      subtitle="rightid · rightdesc"
      rows={rights}
      columns={[
        {
          key: "rightid",
          label: "Right ID",
          style: { fontFamily: "var(--font-mono)", fontSize: 12 },
        },
        {
          key: "rightdesc",
          label: "Right Description",
          style: { fontWeight: 500 },
        },
      ]}
    />
  );
}

// ─── MODULE LOOKUP (for admin) ───────────────────────────────────────────────
export function ModuleLookupPage() {
  const { modules, loading } = useApp();

  return (
    <LookupTable
      title="Module Lookup"
      loading={loading}
      subtitle="moduleid · moduledesc"
      rows={modules}
      columns={[
        {
          key: "moduleid",
          label: "Module ID",
          style: { fontFamily: "var(--font-mono)", fontSize: 12 },
        },
        {
          key: "moduledesc",
          label: "Module Description",
          style: { fontWeight: 500 },
        },
      ]}
    />
  );
}
