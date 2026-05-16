import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronRight,
  Calendar,
  Loader2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionsContext";
import { supabase } from "../lib/supabaseClient";
import AddSaleModal from "./modals/AddSaleModal";
import EditSaleModal from "./modals/EditSaleModal";
import SoftDeleteSaleDialog from "./modals/SoftDeleteSaleDialog";
import "./SalesListPage.css";

const RS_BADGE = {
  ACTIVE: "badge-green",
  INACTIVE: "badge-red",
  DELETED: "badge-red",
};

export default function SalesListPage() {
  const { sales, loading: appLoading, loadSales } = useApp();
  const { currentUser } = useAuth();
  const { canAdd, canEdit, canDelete, isAdmin, isSuperAdmin } =
    usePermissions();
  const nav = useNavigate();

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [modal, setModal] = useState(null);
  const [selTrans, setSelTrans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salesMetrics, setSalesMetrics] = useState({});
  const [formattedSales, setFormattedSales] = useState([]);

  // Sorting state
  const [sortField, setSortField] = useState("salesDate");
  const [sortDirection, setSortDirection] = useState("desc");

  // Check if user can see stamp (Superadmin or Admin)
  const canSeeStamp = isSuperAdmin() || currentUser?.user_type === "ADMIN";

  // Handle sort click
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Render sort icon
  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <ArrowUp size={12} className="sort-icon-inactive" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp size={12} className="sort-icon-active" />
    ) : (
      <ArrowDown size={12} className="sort-icon-active" />
    );
  };

  // Fetch sales data
  useEffect(() => {
    const loadSalesData = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("sales")
          .select(
            `
            transno,
            salesdate,
            custno,
            empno,
            record_status,
            stamp,
            customer:custno (custname),
            employee:empno (firstname, lastname)
          `,
          )
          .order("salesdate", { ascending: false });

        if (!isAdmin() && !isSuperAdmin()) {
          query = query.eq("record_status", "ACTIVE");
        }

        const { data, error } = await query;
        if (error) throw error;

        const formatted = (data || []).map((s) => ({
          transNo: s.transno,
          salesDate: s.salesdate,
          displayDate: s.salesdate
            ? new Date(s.salesdate).toLocaleDateString()
            : "—",
          custno: s.custno,
          custname: s.customer?.custname || "Unknown",
          empno: s.empno,
          empname: s.employee
            ? `${s.employee.lastname}, ${s.employee.firstname}`
            : "Unknown",
          record_status: s.record_status || "ACTIVE",
          stamp: s.stamp,
        }));

        setFormattedSales(formatted);

        // Calculate metrics after loading sales
        const transNos = formatted.map((s) => s.transNo);
        if (transNos.length > 0) {
          const { data: details } = await supabase
            .from("salesdetail")
            .select("transno, prodcode, quantity, record_status")
            .in("transno", transNos)
            .eq("record_status", "ACTIVE");

          const { data: prices } = await supabase
            .from("pricehist")
            .select("prodcode, unitprice")
            .order("effdate", { ascending: false });

          const priceMap = new Map();
          prices?.forEach((p) => {
            if (!priceMap.has(p.prodcode)) {
              priceMap.set(p.prodcode, Number(p.unitprice) || 0);
            }
          });

          const metrics = {};
          details?.forEach((detail) => {
            const transno = detail.transno;
            const quantity = Number(detail.quantity) || 0;
            const price = priceMap.get(detail.prodcode) || 0;
            const revenue = quantity * price;

            if (!metrics[transno]) {
              metrics[transno] = { items: 0, total: 0 };
            }
            metrics[transno].items += 1;
            metrics[transno].total += revenue;
          });

          setSalesMetrics(metrics);
        }
      } catch (err) {
        console.error("Error loading sales:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSalesData();
  }, [isAdmin, isSuperAdmin, appLoading]);

  // Function to refresh data after actions (without page refresh)
  const refreshData = async () => {
    await loadSales();

    try {
      let query = supabase
        .from("sales")
        .select(
          `
          transno,
          salesdate,
          custno,
          empno,
          record_status,
          stamp,
          customer:custno (custname),
          employee:empno (firstname, lastname)
        `,
        )
        .order("salesdate", { ascending: false });

      if (!isAdmin() && !isSuperAdmin()) {
        query = query.eq("record_status", "ACTIVE");
      }

      const { data, error } = await query;
      if (error) throw error;

      const formatted = (data || []).map((s) => ({
        transNo: s.transno,
        salesDate: s.salesdate,
        displayDate: s.salesdate
          ? new Date(s.salesdate).toLocaleDateString()
          : "—",
        custno: s.custno,
        custname: s.customer?.custname || "Unknown",
        empno: s.empno,
        empname: s.employee
          ? `${s.employee.lastname}, ${s.employee.firstname}`
          : "Unknown",
        record_status: s.record_status || "ACTIVE",
        stamp: s.stamp,
      }));

      setFormattedSales(formatted);

      const transNos = formatted.map((s) => s.transNo);
      if (transNos.length > 0) {
        const { data: details } = await supabase
          .from("salesdetail")
          .select("transno, prodcode, quantity, record_status")
          .in("transno", transNos)
          .eq("record_status", "ACTIVE");

        const { data: prices } = await supabase
          .from("pricehist")
          .select("prodcode, unitprice")
          .order("effdate", { ascending: false });

        const priceMap = new Map();
        prices?.forEach((p) => {
          if (!priceMap.has(p.prodcode)) {
            priceMap.set(p.prodcode, Number(p.unitprice) || 0);
          }
        });

        const metrics = {};
        details?.forEach((detail) => {
          const transno = detail.transno;
          const quantity = Number(detail.quantity) || 0;
          const price = priceMap.get(detail.prodcode) || 0;
          const revenue = quantity * price;

          if (!metrics[transno]) {
            metrics[transno] = { items: 0, total: 0 };
          }
          metrics[transno].items += 1;
          metrics[transno].total += revenue;
        });

        setSalesMetrics(metrics);
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

  // Apply sorting and filtering
  const filteredAndSorted = useMemo(() => {
    let result = formattedSales.filter((s) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        s.transNo.toLowerCase().includes(q) ||
        s.custname.toLowerCase().includes(q) ||
        s.empname.toLowerCase().includes(q);

      const matchFrom = !dateFrom || s.salesDate >= dateFrom;
      const matchTo = !dateTo || s.salesDate <= dateTo;

      return matchSearch && matchFrom && matchTo;
    });

    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "items") {
        aVal = salesMetrics[a.transNo]?.items || 0;
        bVal = salesMetrics[b.transNo]?.items || 0;
      } else if (sortField === "total") {
        aVal = salesMetrics[a.transNo]?.total || 0;
        bVal = salesMetrics[b.transNo]?.total || 0;
      }

      if (typeof aVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [
    formattedSales,
    search,
    dateFrom,
    dateTo,
    sortField,
    sortDirection,
    salesMetrics,
  ]);

  const activeCount = formattedSales.filter(
    (s) => s.record_status === "ACTIVE",
  ).length;
  const inactiveCount = formattedSales.filter(
    (s) => s.record_status !== "ACTIVE",
  ).length;
  const activeRevenue = formattedSales
    .filter((s) => s.record_status === "ACTIVE")
    .reduce((sum, s) => sum + (salesMetrics[s.transNo]?.total || 0), 0);

  const hasActiveFilters = search || dateFrom || dateTo;

  return (
    <div className="fade-in">
      {/* Summary cards */}
      <div className="sl-summary">
        <div className="sl-sum-card">
          <p className="slsv">
            {loading || appLoading ? "…" : formattedSales.length}
          </p>
          <p className="slsl">Total Transactions</p>
        </div>
        <div className="sl-sum-card ok">
          <p className="slsv">{loading || appLoading ? "…" : activeCount}</p>
          <p className="slsl">Active</p>
        </div>
        {(isAdmin() || isSuperAdmin()) && (
          <div className="sl-sum-card warn">
            <p className="slsv">
              {loading || appLoading ? "…" : inactiveCount}
            </p>
            <p className="slsl">Inactive/Deleted</p>
          </div>
        )}
        <div className="sl-sum-card rev">
          <p className="slsv">
            {loading || appLoading ? "…" : `$${activeRevenue.toLocaleString()}`}
          </p>
          <p className="slsl">Active Revenue</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Sales Transactions</h2>
          <p className="page-subtitle">
            {loading || appLoading
              ? "Loading…"
              : `${filteredAndSorted.length} of ${formattedSales.length} transactions`}
            {hasActiveFilters && (
              <span className="filter-active-badge"> (Filtered)</span>
            )}
          </p>
        </div>
        <div className="page-actions">
          <div className="search-wrap">
            <Search size={14} className="search-icon" />
            <input
              className="search-input"
              placeholder="Search trans / customer / employee…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="date-filter-wrap">
            <Calendar size={13} style={{ color: "var(--text-muted)" }} />
            <input
              type="date"
              className="form-input date-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="From"
            />
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>–</span>
            <input
              type="date"
              className="form-input date-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="To"
            />
          </div>
          {hasActiveFilters && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearch("");
                setDateFrom("");
                setDateTo("");
              }}
            >
              <X size={14} /> Clear Filters
            </button>
          )}
          {(canAdd() || isSuperAdmin()) && (
            <button className="btn btn-primary" onClick={() => setModal("add")}>
              <Plus size={15} /> Add Transaction
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {(loading || appLoading) && (
        <div className="loading-container">
          <Loader2 size={20} className="spin" />
          <span>Loading transactions…</span>
        </div>
      )}

      {/* Table */}
      {!loading && !appLoading && (
        <div className="table-wrap">
          <table className="sl-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort("transNo")}>
                  Trans No <SortIcon field="transNo" />
                </th>
                <th
                  className="sortable"
                  onClick={() => handleSort("displayDate")}
                >
                  Sales Date <SortIcon field="displayDate" />
                </th>
                <th className="sortable" onClick={() => handleSort("custname")}>
                  Customer <SortIcon field="custname" />
                </th>
                <th className="sortable" onClick={() => handleSort("empname")}>
                  Employee <SortIcon field="empname" />
                </th>
                <th className="sortable" onClick={() => handleSort("items")}>
                  Items <SortIcon field="items" />
                </th>
                <th className="sortable" onClick={() => handleSort("total")}>
                  Total <SortIcon field="total" />
                </th>
                {(isAdmin() || isSuperAdmin()) && <th>Status</th>}
                {canSeeStamp && <th>Last Modified</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((s) => {
                const metric = salesMetrics[s.transNo] || {
                  items: 0,
                  total: 0,
                };
                return (
                  <tr
                    key={s.transNo}
                    className={
                      s.record_status !== "ACTIVE" ? "row-inactive" : ""
                    }
                  >
                    <td>
                      <button
                        className="trans-link"
                        onClick={() => nav(`/sales/${s.transNo}`)}
                      >
                        {s.transNo} <ChevronRight size={13} />
                      </button>
                    </td>
                    <td>{s.displayDate}</td>
                    <td>{s.custname}</td>
                    <td>{s.empname}</td>
                    <td style={{ color: "var(--text-muted)" }}>
                      {metric.items}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      ${metric.total.toLocaleString()}
                    </td>
                    {(isAdmin() || isSuperAdmin()) && (
                      <td>
                        <span
                          className={`badge ${RS_BADGE[s.record_status] || "badge-gray"}`}
                        >
                          {s.record_status}
                        </span>
                      </td>
                    )}
                    {canSeeStamp && (
                      <td className="stamp-cell">
                        {s.stamp ? new Date(s.stamp).toLocaleString() : "—"}
                      </td>
                    )}
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          title="View"
                          onClick={() => nav(`/sales/${s.transNo}`)}
                        >
                          <Eye size={14} />
                        </button>
                        {(canEdit() || isSuperAdmin()) &&
                          s.record_status === "ACTIVE" && (
                            <button
                              className="btn-icon"
                              title="Edit"
                              onClick={() => {
                                setSelTrans(s);
                                setModal("edit");
                              }}
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                        {(canDelete() || isSuperAdmin()) &&
                          s.record_status === "ACTIVE" && (
                            <button
                              className="btn-icon delete-btn"
                              title="Soft-delete"
                              onClick={() => {
                                setSelTrans(s);
                                setModal("delete");
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredAndSorted.length === 0 && (
                <tr>
                  <td colSpan={canSeeStamp ? 9 : 8} className="empty-row">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {modal === "add" && (
        <AddSaleModal
          onClose={() => {
            setModal(null);
            refreshData();
          }}
        />
      )}
      {modal === "edit" && selTrans && (
        <EditSaleModal
          sale={selTrans}
          onClose={() => {
            setModal(null);
            setSelTrans(null);
            refreshData();
          }}
        />
      )}
      {modal === "delete" && selTrans && (
        <SoftDeleteSaleDialog
          sale={selTrans}
          onClose={() => {
            setModal(null);
            setSelTrans(null);
            refreshData();
          }}
        />
      )}
    </div>
  );
}
