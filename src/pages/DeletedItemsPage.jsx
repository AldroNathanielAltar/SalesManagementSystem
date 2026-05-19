import { useState, useEffect } from "react";
import { RotateCcw, Trash2, ShieldOff, Loader2, RefreshCw } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import ConfirmModal from "../components/ui/ConfirmModal";
import "./DeletedItemsPage.css";

export default function DeletedItemsPage() {
  const { reloadAll, addNotification } = useApp();
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
        <ShieldOff size={48} />
        <h3>Access Restricted</h3>
        <p>Deleted Items is only visible to Super Admin users.</p>
      </div>
    );
  }

  // Fetch deleted items directly from Supabase
  const fetchDeletedItems = async () => {
    setLoading(true);
    try {
      // STEP 1: Fetch deleted sales
      const { data: deletedSalesData, error: salesError } = await supabase
        .from("sales")
        .select("*")
        .in("record_status", ["DELETED", "INACTIVE"]);

      if (salesError) throw salesError;

      // STEP 2: Fetch customer and employee names separately
      let formattedSales = [];

      if (deletedSalesData && deletedSalesData.length > 0) {
        const customerIds = [
          ...new Set(deletedSalesData.map((s) => s.custno).filter(Boolean)),
        ];
        const employeeIds = [
          ...new Set(deletedSalesData.map((s) => s.empno).filter(Boolean)),
        ];

        // Fetch customer names
        let customerMap = new Map();
        if (customerIds.length > 0) {
          const { data: customers } = await supabase
            .from("customer")
            .select("custno, custname")
            .in("custno", customerIds);
          customers?.forEach((c) => customerMap.set(c.custno, c.custname));
        }

        // Fetch employee names
        let employeeMap = new Map();
        if (employeeIds.length > 0) {
          const { data: employees } = await supabase
            .from("employee")
            .select("empno, firstname, lastname")
            .in("empno", employeeIds);
          employees?.forEach((e) =>
            employeeMap.set(e.empno, `${e.lastname}, ${e.firstname}`),
          );
        }

        // Format sales
        formattedSales = deletedSalesData.map((sale) => ({
          transno: sale.transno,
          salesdate: sale.salesdate,
          custno: sale.custno,
          custname: customerMap.get(sale.custno) || "Unknown",
          empno: sale.empno,
          empname: employeeMap.get(sale.empno) || "Unknown",
          record_status: sale.record_status,
          stamp: sale.stamp,
        }));
      }

      setDeletedSales(formattedSales);

      // STEP 3: Fetch deleted line items (no 'id' column, use composite key)
      const { data: deletedLinesData, error: linesError } = await supabase
        .from("salesdetail")
        .select("*")
        .in("record_status", ["DELETED", "INACTIVE"]);

      if (!linesError && deletedLinesData && deletedLinesData.length > 0) {
        // Get product codes
        const productCodes = [
          ...new Set(deletedLinesData.map((l) => l.prodcode).filter(Boolean)),
        ];

        // Fetch product descriptions
        let productMap = new Map();
        if (productCodes.length > 0) {
          const { data: products } = await supabase
            .from("product")
            .select("prodcode, description, unit")
            .in("prodcode", productCodes);
          products?.forEach((p) => productMap.set(p.prodcode, p));
        }

        // Get prices
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

        // Use composite key (transno + prodcode) as unique identifier
        const formattedLines = deletedLinesData.map((line, index) => {
          const product = productMap.get(line.prodcode);
          const unitPrice = priceMap.get(line.prodcode) || 0;
          return {
            key: `${line.transno}-${line.prodcode}-${index}`,
            transno: line.transno,
            prodcode: line.prodcode,
            description: product?.description || line.prodcode,
            unit: product?.unit,
            quantity: Number(line.quantity) || 0,
            unit_price: unitPrice,
            total: (Number(line.quantity) || 0) * unitPrice,
            record_status: line.record_status,
            stamp: line.stamp,
          };
        });

        setDeletedLines(formattedLines);
      } else {
        setDeletedLines([]);
      }
    } catch (err) {
      console.error("Error fetching deleted items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedItems();
  }, []);

  // Recover a sale (soft delete reversal) - NO ALERT
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
      addNotification(
        `🔄 Transaction ${transno} was recovered from deleted items`,
        "success",
      );
      // NO ALERT HERE - removed
    } catch (err) {
      addNotification(err.message || "Failed to recover sale", "error");
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  }

  // Recover a line item - NO ALERT
  async function handleRecoverLine(transno, prodcode) {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("salesdetail")
        .update({ record_status: "ACTIVE" })
        .eq("transno", transno)
        .eq("prodcode", prodcode);

      if (error) throw error;

      await fetchDeletedItems();
      await reloadAll();
      addNotification(
        `🔄 Line item ${prodcode} from transaction ${transno} was recovered`,
        "success",
      );
      // NO ALERT HERE - removed
    } catch (err) {
      addNotification(err.message || "Failed to recover line item", "error");
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  }

  // Permanently delete a sale - NO ALERT
  async function handlePermanentDeleteSale(transno) {
    if (
      !window.confirm(
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
      addNotification(
        `💀 Transaction ${transno} was permanently deleted by ${currentUser?.username || "Super Admin"}`,
        "error",
      );
      // NO ALERT HERE - removed
    } catch (err) {
      addNotification(err.message || "Failed to delete sale", "error");
    } finally {
      setActionLoading(false);
    }
  }

  // Permanently delete a line item - NO ALERT
  async function handlePermanentDeleteLine(transno, prodcode) {
    if (
      !window.confirm(
        `⚠️ WARNING: This will PERMANENTLY delete line item ${prodcode}. This action CANNOT be undone. Are you sure?`,
      )
    )
      return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("salesdetail")
        .delete()
        .eq("transno", transno)
        .eq("prodcode", prodcode);

      if (error) throw error;

      await fetchDeletedItems();
      await reloadAll();
      addNotification(
        `💀 Line item ${prodcode} from transaction ${transno} was permanently deleted`,
        "error",
      );
      // NO ALERT HERE - removed
    } catch (err) {
      addNotification(err.message || "Failed to delete line item", "error");
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

      {loading && (
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

      {!loading && tab === "transactions" && (
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

      {!loading && tab === "lineitems" && (
        <div className="table-wrap">
          <table className="di-table">
            <thead>
              <tr>
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
                  <tr key={d.key} className="row-deleted">
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
                              transno: d.transno,
                              prodcode: d.prodcode,
                              action: "recover",
                            })
                          }
                          disabled={actionLoading}
                        >
                          <RotateCcw size={13} /> Recover
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            handlePermanentDeleteLine(d.transno, d.prodcode)
                          }
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
                    colSpan={8}
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
              : `Recover line item "${confirm.prodcode}" from transaction "${confirm.transno}"?`
          }
          confirmLabel={actionLoading ? "Recovering…" : "Recover"}
          confirmClass="btn-primary"
          onConfirm={() => {
            if (confirm.type === "sale") handleRecoverSale(confirm.id);
            if (confirm.type === "line")
              handleRecoverLine(confirm.transno, confirm.prodcode);
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
