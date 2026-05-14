import { useState, useEffect } from "react";
import { RotateCcw, Trash2, ShieldOff, Loader2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import ConfirmModal from "../components/ui/ConfirmModal";
import "./DeletedItemsPage.css";

export default function DeletedItemsPage() {
  const { sales, salesDetail, loading: appLoading, reloadAll } = useApp();
  const { currentUser } = useAuth();
  const [tab, setTab] = useState("transactions");
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deletedSales, setDeletedSales] = useState([]);
  const [deletedLines, setDeletedLines] = useState([]);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = currentUser?.user_type === "SUPERADMIN";

  // Only superadmin can access deleted items
  if (!isSuperAdmin) {
    return (
      <div className="di-blocked">
        <ShieldOff size={40} style={{ color: "var(--text-muted)" }} />
        <h3>Access Restricted</h3>
        <p>Deleted Items is only visible to Super Admin users.</p>
      </div>
    );
  }

  // Fetch deleted items directly from Supabase
  const fetchDeletedItems = async () => {
    setLoading(true);
    try {
      // Fetch deleted sales (record_status = 'DELETED' or 'INACTIVE')
      const { data: deletedSalesData, error: salesError } = await supabase
        .from("sales")
        .select(
          `
          transno,
          salesdate,
          custno,
          empno,
          record_status,
          stamp,
          customer:custno (
            custno,
            custname
          ),
          employee:empno (
            empno,
            firstname,
            lastname
          )
        `,
        )
        .in("record_status", ["DELETED", "INACTIVE"]);

      if (salesError) throw salesError;

      // Fetch deleted line items
      const { data: deletedLinesData, error: linesError } = await supabase
        .from("salesdetail")
        .select(
          `
          id,
          transno,
          prodcode,
          quantity,
          record_status,
          stamp,
          product:prodcode (
            prodcode,
            description,
            unit
          )
        `,
        )
        .in("record_status", ["DELETED", "INACTIVE"]);

      if (linesError) throw linesError;

      // Get prices for line items from pricehist
      const { data: priceData } = await supabase
        .from("pricehist")
        .select("prodcode, unitprice")
        .order("effdate", { ascending: false });

      const priceMap = new Map();
      priceData?.forEach((price) => {
        if (!priceMap.has(price.prodcode)) {
          priceMap.set(price.prodcode, Number(price.unitprice) || 0);
        }
      });

      // Format deleted sales
      const formattedSales = (deletedSalesData || []).map((sale) => ({
        transno: sale.transno,
        salesdate: sale.salesdate,
        custno: sale.custno,
        custname: sale.customer?.custname || "Unknown",
        empno: sale.empno,
        empname: sale.employee
          ? `${sale.employee.lastname}, ${sale.employee.firstname}`
          : "Unknown",
        record_status: sale.record_status,
        stamp: sale.stamp,
      }));

      // Format deleted line items
      const formattedLines = (deletedLinesData || []).map((line) => ({
        id: line.id,
        transno: line.transno,
        prodcode: line.prodcode,
        description: line.product?.description || line.prodcode,
        unit: line.product?.unit,
        quantity: Number(line.quantity) || 0,
        unit_price: priceMap.get(line.prodcode) || 0,
        record_status: line.record_status,
        stamp: line.stamp,
      }));

      setDeletedSales(formattedSales);
      setDeletedLines(formattedLines);
    } catch (err) {
      console.error("Error fetching deleted items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedItems();
  }, []);

  // Recover a sale (soft delete reversal)
  async function handleRecoverSale(transno) {
    setActionLoading(true);
    try {
      const { error: saleError } = await supabase
        .from("sales")
        .update({
          record_status: "ACTIVE",
          stamp: new Date().toISOString(),
        })
        .eq("transno", transno);

      if (saleError) throw saleError;

      // Also recover associated line items
      const { error: linesError } = await supabase
        .from("salesdetail")
        .update({ record_status: "ACTIVE" })
        .eq("transno", transno);

      if (linesError) throw linesError;

      await fetchDeletedItems();
      await reloadAll();
      alert(`Transaction ${transno} recovered successfully!`);
    } catch (err) {
      alert(err.message || "Failed to recover sale");
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  }

  // Recover a line item
  async function handleRecoverLine(lineId) {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("salesdetail")
        .update({ record_status: "ACTIVE" })
        .eq("id", lineId);

      if (error) throw error;

      await fetchDeletedItems();
      await reloadAll();
      alert(`Line item recovered successfully!`);
    } catch (err) {
      alert(err.message || "Failed to recover line item");
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  }

  // Permanently delete a sale (hard delete - superadmin only)
  async function handlePermanentDeleteSale(transno) {
    if (
      !confirm(
        "⚠️ WARNING: This will PERMANENTLY delete this transaction. This action CANNOT be undone. Are you sure?",
      )
    )
      return;

    setActionLoading(true);
    try {
      // First delete associated line items
      const { error: linesError } = await supabase
        .from("salesdetail")
        .delete()
        .eq("transno", transno);

      if (linesError) throw linesError;

      // Then delete the sale
      const { error: saleError } = await supabase
        .from("sales")
        .delete()
        .eq("transno", transno);

      if (saleError) throw saleError;

      await fetchDeletedItems();
      await reloadAll();
      alert(`Transaction ${transno} permanently deleted.`);
    } catch (err) {
      alert(err.message || "Failed to delete sale");
    } finally {
      setActionLoading(false);
    }
  }

  // Permanently delete a line item
  async function handlePermanentDeleteLine(lineId) {
    if (
      !confirm(
        "⚠️ WARNING: This will PERMANENTLY delete this line item. This action CANNOT be undone. Are you sure?",
      )
    )
      return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("salesdetail")
        .delete()
        .eq("id", lineId);

      if (error) throw error;

      await fetchDeletedItems();
      await reloadAll();
      alert(`Line item permanently deleted.`);
    } catch (err) {
      alert(err.message || "Failed to delete line item");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Deleted Items</h2>
          <p className="page-subtitle">
            Soft-deleted records — recoverable by Super Admin only. Use with
            caution.
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={fetchDeletedItems}
          disabled={loading}
        >
          <RefreshCw
            size={14}
            style={loading ? { animation: "spin .8s linear infinite" } : {}}
          />
          Refresh
        </button>
      </div>

      <div className="di-tabs">
        <button
          className={`di-tab ${tab === "transactions" ? "active" : ""}`}
          onClick={() => setTab("transactions")}
        >
          <Trash2 size={14} />
          Deleted Transactions
          {deletedSales.length > 0 && (
            <span className="di-count">{deletedSales.length}</span>
          )}
        </button>
        <button
          className={`di-tab ${tab === "lineitems" ? "active" : ""}`}
          onClick={() => setTab("lineitems")}
        >
          <Trash2 size={14} />
          Deleted Line Items
          {deletedLines.length > 0 && (
            <span className="di-count">{deletedLines.length}</span>
          )}
        </button>
      </div>

      {(loading || appLoading) && (
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
          <span>Loading deleted records…</span>
        </div>
      )}

      {!loading && !appLoading && tab === "transactions" && (
        <div className="table-wrap">
          <table className="di-table">
            <thead>
              <tr>
                <th>Trans No</th>
                <th>Sales Date</th>
                <th>Customer</th>
                <th>Employee</th>
                <th>Status</th>
                <th>Deleted Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deletedSales.map((s) => (
                <tr key={s.transno} className="row-deleted">
                  <td
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--red)",
                    }}
                  >
                    {s.transno}
                  </td>
                  <td>
                    {s.salesdate
                      ? new Date(s.salesdate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>{s.custname}</td>
                  <td>{s.empname}</td>
                  <td>
                    <span className="badge badge-danger">
                      {s.record_status}
                    </span>
                  </td>
                  <td
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {s.stamp ? new Date(s.stamp).toLocaleString() : "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn btn-primary btn-sm recover-btn"
                        onClick={() =>
                          setConfirm({
                            type: "sale",
                            id: s.transno,
                            action: "recover",
                          })
                        }
                        disabled={actionLoading}
                      >
                        <RotateCcw size={13} /> Recover
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handlePermanentDeleteSale(s.transno)}
                        disabled={actionLoading}
                      >
                        <Trash2 size={13} /> Permanently Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {deletedSales.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: 36,
                      color: "var(--text-muted)",
                    }}
                  >
                    No deleted transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !appLoading && tab === "lineitems" && (
        <div className="table-wrap">
          <table className="di-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Trans No</th>
                <th>Product Code</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deletedLines.map((d) => {
                const total = d.quantity * d.unit_price;
                return (
                  <tr key={d.id} className="row-deleted">
                    <td
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--text-muted)",
                      }}
                    >
                      {d.id}
                    </td>
                    <td
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        color: "var(--red)",
                      }}
                    >
                      {d.transno}
                    </td>
                    <td
                      style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
                    >
                      {d.prodcode}
                    </td>
                    <td>{d.description}</td>
                    <td>{d.quantity}</td>
                    <td style={{ fontWeight: 600 }}>
                      ${d.unit_price.toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      ${total.toLocaleString()}
                    </td>
                    <td>
                      <span className="badge badge-danger">
                        {d.record_status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn btn-primary btn-sm recover-btn"
                          onClick={() =>
                            setConfirm({
                              type: "line",
                              id: d.id,
                              action: "recover",
                            })
                          }
                          disabled={actionLoading}
                        >
                          <RotateCcw size={13} /> Recover
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handlePermanentDeleteLine(d.id)}
                          disabled={actionLoading}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {deletedLines.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      textAlign: "center",
                      padding: 36,
                      color: "var(--text-muted)",
                    }}
                  >
                    No deleted line items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm Modal for Recovery */}
      {confirm && confirm.action === "recover" && (
        <ConfirmModal
          title="Recover Record"
          message={
            confirm.type === "sale"
              ? `Recover transaction "${confirm.id}"? This will also recover all its line items (cascade restore).`
              : `Recover line item "${confirm.id}"?`
          }
          confirmLabel={actionLoading ? "Recovering…" : "Recover"}
          confirmClass="btn-primary"
          onConfirm={() => {
            if (confirm.type === "sale") handleRecoverSale(confirm.id);
            if (confirm.type === "line") handleRecoverLine(confirm.id);
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

// Add RefreshCw icon import
import { RefreshCw } from "lucide-react";
