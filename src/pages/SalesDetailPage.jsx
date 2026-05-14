import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Printer } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useApp } from "../context/AppContext";
import "./SalesDetailPage.css";

export default function SalesDetailPage() {
  const { transNo } = useParams();
  const navigate = useNavigate();
  const { getCurrentPrice } = useApp();

  const [loading, setLoading] = useState(true);
  const [sale, setSale] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSaleDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load sale header with customer and employee info
        const { data: saleData, error: saleError } = await supabase
          .from("sales")
          .select(
            `
            transno,
            salesdate,
            custno,
            empno,
            record_status,
            stamp,
            customer:custno (custno, custname, address, payterm),
            employee:empno (empno, firstname, lastname)
          `,
          )
          .eq("transno", transNo)
          .single();

        if (saleError) throw saleError;

        if (!saleData) {
          setError(`Transaction ${transNo} not found.`);
          setLoading(false);
          return;
        }

        // Load line items from salesdetail table (no 'id' column - use transno and prodcode)
        const { data: detailsData, error: detailsError } = await supabase
          .from("salesdetail")
          .select(
            `
            transno,
            prodcode,
            quantity,
            record_status
          `,
          )
          .eq("transno", transNo)
          .eq("record_status", "ACTIVE");

        if (detailsError) throw detailsError;

        // Get product descriptions from product table
        const productCodes = detailsData?.map((d) => d.prodcode) || [];

        let productsData = [];
        if (productCodes.length > 0) {
          const { data } = await supabase
            .from("product")
            .select("prodcode, description, unit")
            .in("prodcode", productCodes);
          productsData = data || [];
        }

        const productMap = new Map();
        productsData.forEach((p) => {
          productMap.set(p.prodcode, {
            description: p.description,
            unit: p.unit,
          });
        });

        // Calculate prices and totals for each line item
        const itemsWithPrices = (detailsData || []).map((item, index) => {
          const price = getCurrentPrice(item.prodcode)?.unitprice || 0;
          const total = (item.quantity || 0) * price;
          const product = productMap.get(item.prodcode) || {};

          return {
            key: `${item.transno}-${item.prodcode}-${index}`, // Use composite key as unique identifier
            prodcode: item.prodcode,
            description: product.description || item.prodcode,
            unit: product.unit || "pc",
            quantity: Number(item.quantity) || 0,
            unitPrice: price,
            total: total,
          };
        });

        setSale({
          transno: saleData.transno,
          salesdate: saleData.salesdate,
          custno: saleData.custno,
          custname: saleData.customer?.custname || "Unknown",
          custaddress: saleData.customer?.address,
          custpayterm: saleData.customer?.payterm,
          empno: saleData.empno,
          empname: saleData.employee
            ? `${saleData.employee.lastname}, ${saleData.employee.firstname}`
            : "Unknown",
          record_status: saleData.record_status,
          stamp: saleData.stamp,
        });

        setLineItems(itemsWithPrices);
      } catch (err) {
        console.error("Error loading sale details:", err);
        setError(err.message || "Failed to load transaction details");
      } finally {
        setLoading(false);
      }
    };

    if (transNo) {
      loadSaleDetails();
    }
  }, [transNo, getCurrentPrice]);

  const grandTotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const totalItems = lineItems.length;

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 size={24} className="spin" />
        <p>Loading transaction details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate("/sales")}>
          Back to Transactions
        </button>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="error-container">
        <h3>Transaction Not Found</h3>
        <p>Transaction {transNo} does not exist.</p>
        <button className="btn btn-primary" onClick={() => navigate("/sales")}>
          Back to Transactions
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="detail-header">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/sales")}
        >
          <ArrowLeft size={16} /> Back to Transactions
        </button>
        <button className="btn btn-secondary" onClick={() => window.print()}>
          <Printer size={16} /> Print
        </button>
      </div>

      {/* Sale Information Card */}
      <div className="detail-card">
        <h2>Sale Detail</h2>
        <div className="detail-grid">
          <div className="detail-group">
            <label>Transaction No:</label>
            <span className="detail-value">{sale.transno}</span>
          </div>
          <div className="detail-group">
            <label>Sales Date:</label>
            <span className="detail-value">
              {new Date(sale.salesdate).toLocaleDateString()}
            </span>
          </div>
          <div className="detail-group">
            <label>Status:</label>
            <span
              className={`badge ${sale.record_status === "ACTIVE" ? "badge-green" : "badge-red"}`}
            >
              {sale.record_status}
            </span>
          </div>
        </div>
      </div>

      {/* Customer & Employee Info */}
      <div className="detail-card">
        <h3>Customer Information</h3>
        <div className="detail-grid">
          <div className="detail-group">
            <label>Customer Code:</label>
            <span>{sale.custno}</span>
          </div>
          <div className="detail-group">
            <label>Customer Name:</label>
            <span>{sale.custname}</span>
          </div>
          <div className="detail-group">
            <label>Address:</label>
            <span>{sale.custaddress || "—"}</span>
          </div>
          <div className="detail-group">
            <label>Pay Term:</label>
            <span>{sale.custpayterm || "—"}</span>
          </div>
        </div>

        <h3>Employee Information</h3>
        <div className="detail-grid">
          <div className="detail-group">
            <label>Employee Code:</label>
            <span>{sale.empno}</span>
          </div>
          <div className="detail-group">
            <label>Employee Name:</label>
            <span>{sale.empname}</span>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="detail-card">
        <h3>Line Items ({totalItems} items)</h3>
        <div className="table-wrap">
          <table className="detail-table">
            <thead>
              <tr>
                <th>Product Code</th>
                <th>Description</th>
                <th>Unit</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.key}>
                  <td>{item.prodcode}</td>
                  <td>{item.description}</td>
                  <td>{item.unit}</td>
                  <td style={{ textAlign: "right" }}>{item.quantity}</td>
                  <td style={{ textAlign: "right" }}>
                    ${item.unitPrice.toLocaleString()}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>
                    ${item.total.toLocaleString()}
                  </td>
                </tr>
              ))}
              {lineItems.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: 32 }}>
                    No line items found for this transaction.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="5" style={{ textAlign: "right", fontWeight: 600 }}>
                  Grand Total ({totalItems} items):
                </td>
                <td
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: "var(--accent)",
                  }}
                >
                  ${grandTotal.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
