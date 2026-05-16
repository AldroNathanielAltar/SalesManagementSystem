import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { currentUser } = useAuth();
  const loadedRef = useRef(false);
  const dbInfoRef = useRef(null);

  // ── All tables matching your exact schema ────────────────────────────────
  const [sales, setSales] = useState([]);
  const [salesDetail, setSalesDetail] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [priceHist, setPriceHist] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [jobHistory, setJobHistory] = useState([]);
  const [payments, setPayments] = useState([]);
  const [rights, setRights] = useState([]);
  const [modules, setModules] = useState([]);
  const [monthlySalesTrend, setMonthlySalesTrend] = useState([]);
  const [salesByCustomer, setSalesByCustomer] = useState([]);
  const [topProductsSold, setTopProductsSold] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Role helpers
  const isAdminUser = useCallback(() => {
    return (
      currentUser?.user_type === "ADMIN" ||
      currentUser?.user_type === "SUPERADMIN"
    );
  }, [currentUser?.user_type]);

  const isSuperAdmin = useCallback(() => {
    return currentUser?.user_type === "SUPERADMIN";
  }, [currentUser?.user_type]);

  // ── NOTIFICATION FUNCTIONS ──────────────────────────────────────────────
  const addNotification = useCallback((text, type = "info") => {
    const newNotification = {
      id: Date.now(),
      text,
      time: new Date().toLocaleString(),
      read: false,
      type,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  const markRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  useEffect(() => {
    if (!currentUser) {
      loadedRef.current = false;
      dbInfoRef.current = null;
      setSales([]);
      setSalesDetail([]);
      setCustomers([]);
      setEmployees([]);
      setProducts([]);
      setPriceHist([]);
      setDepartments([]);
      setJobs([]);
      setPayments([]);
      return;
    }
    if (loadedRef.current) return;
    loadedRef.current = true;
    loadAll();
  }, [currentUser?.userid]);

  async function loadAll() {
    setLoading(true);

    dbInfoRef.current = {
      salesTbl: "sales",
      detailTbl: "salesdetail",
      custTbl: "customer",
      empTbl: "employee",
      prodTbl: "product",
      priceTbl: "pricehist",
      deptTbl: "department",
      jobTbl: "job",
      jobHistoryTbl: "jobhistory",
      paymentTbl: "payment",
      rightsTbl: "rights",
      moduleTbl: "module",
      monthlySalesTbl: "monthly_sales_trend",
      salesByCustomerTbl: "sales_by_customer",
      topProductsTbl: "top_products_sold",
    };

    await Promise.all([
      loadSalesData(),
      loadLookups(),
      loadAdminData(),
      loadReportViews(),
    ]);

    setLoading(false);
  }

  async function loadLookups() {
    // ─── CUSTOMERS ──────────────────────────────────────────
    const { data: customersData } = await supabase.from("customer").select("*");

    if (customersData) {
      setCustomers(
        customersData.map((c) => ({
          ...c,
          custno: c.custno,
          custname: c.custname,
          address: c.address,
          payterm: c.payterm,
        })),
      );
    }

    // ─── EMPLOYEES with department from jobhistory ──────────
    const { data: employeesData } = await supabase.from("employee").select("*");

    if (employeesData) {
      // Get current department for each employee from jobhistory
      const { data: jobHistoryData } = await supabase
        .from("jobhistory")
        .select("empno, deptcode, jobcode")
        .order("effdate", { ascending: false });

      const currentDeptMap = new Map();
      if (jobHistoryData) {
        jobHistoryData.forEach((jh) => {
          if (!currentDeptMap.has(jh.empno)) {
            currentDeptMap.set(jh.empno, jh.deptcode);
          }
        });
      }

      // Get department names
      const { data: deptData } = await supabase.from("department").select("*");
      const deptNameMap = new Map();
      if (deptData) {
        deptData.forEach((d) => deptNameMap.set(d.deptcode, d.deptname));
      }

      setEmployees(
        employeesData.map((e) => ({
          ...e,
          empno: e.empno,
          fullname: `${e.lastname}, ${e.firstname}`,
          department_code: currentDeptMap.get(e.empno) || "—",
          department_name: deptNameMap.get(currentDeptMap.get(e.empno)) || "—",
        })),
      );
    }

    // ─── PRODUCTS ───────────────────────────────────────────
    const { data: productsData } = await supabase.from("product").select("*");

    if (productsData) {
      setProducts(
        productsData.map((p) => ({
          ...p,
          prodcode: p.prodcode,
          description: p.description,
          unit: p.unit,
        })),
      );
    }

    // ─── PRICE HISTORY ──────────────────────────────────────
    const { data: priceData } = await supabase
      .from("pricehist")
      .select("*")
      .order("effdate", { ascending: false });

    if (priceData) {
      setPriceHist(
        priceData.map((ph) => ({
          ...ph,
          prodcode: ph.prodcode,
          effdate: ph.effdate,
          unitprice: Number(ph.unitprice) || 0,
        })),
      );
    }

    // ─── DEPARTMENTS ────────────────────────────────────────
    const { data: deptData } = await supabase.from("department").select("*");
    if (deptData) setDepartments(deptData);

    // ─── JOBS ───────────────────────────────────────────────
    const { data: jobData } = await supabase.from("job").select("*");
    if (jobData) setJobs(jobData);

    // ─── JOB HISTORY ────────────────────────────────────────
    const { data: jhData } = await supabase.from("jobhistory").select("*");
    if (jhData) setJobHistory(jhData);

    // ─── PAYMENTS ───────────────────────────────────────────
    const { data: paymentData } = await supabase.from("payment").select("*");
    if (paymentData) setPayments(paymentData);
  }

  async function loadSalesData() {
    const isAdmin = isAdminUser();

    // ─── SALES with joins ───────────────────────────────────
    let salesQuery = supabase.from("sales").select(`
        *,
        customer:customer!sales_custno_fkey (*),
        employee:employee!sales_empno_fkey (*)
      `);

    if (!isAdmin) {
      salesQuery = salesQuery.eq("record_status", "ACTIVE");
    }

    const { data: salesData } = await salesQuery;

    if (salesData) {
      const normalizedSales = salesData.map((row) => ({
        transno: row.transno,
        salesdate: row.salesdate,
        custno: row.custno,
        custname: row.customer?.custname || row.custname,
        custaddress: row.customer?.address,
        custpayterm: row.customer?.payterm,
        empno: row.empno,
        empname: row.employee
          ? `${row.employee.lastname}, ${row.employee.firstname}`
          : "",
        record_status: row.record_status,
        stamp: row.stamp,
      }));
      setSales(normalizedSales);
    }

    // ─── SALES DETAIL with product join ─────────────────────
    let detailQuery = supabase.from("salesdetail").select(`
        *,
        product:product!salesdetail_prodcode_fkey (*)
      `);

    if (!isAdmin) {
      detailQuery = detailQuery.eq("record_status", "ACTIVE");
    }

    const { data: detailData } = await detailQuery;

    if (detailData) {
      const normalizedDetails = detailData.map((row) => ({
        ...row,
        transno: row.transno,
        prodcode: row.prodcode,
        description: row.product?.description,
        unit: row.product?.unit,
        quantity: Number(row.quantity) || 0,
        record_status: row.record_status,
      }));
      setSalesDetail(normalizedDetails);
    }
  }

  async function loadAdminData() {
    const [rightsRes, modulesRes] = await Promise.allSettled([
      supabase.from("rights").select("*"),
      supabase.from("module").select("*"),
    ]);
    if (rightsRes.value?.data) setRights(rightsRes.value.data);
    if (modulesRes.value?.data) setModules(modulesRes.value.data);
  }

  async function loadReportViews() {
    // ─── MONTHLY SALES TREND ────────────────────────────────
    const { data: monthlyData } = await supabase
      .from("monthly_sales_trend")
      .select("*")
      .order("salemonth", { ascending: false });

    if (monthlyData) {
      setMonthlySalesTrend(
        monthlyData.map((m) => ({
          salemonth: m.salemonth,
          totaltransactions: Number(m.totaltransactions) || 0,
          totalrevenue: Number(m.totalrevenue) || 0,
          avg_per_transaction:
            m.totaltransactions > 0 ? m.totalrevenue / m.totaltransactions : 0,
        })),
      );
    }

    // ─── SALES BY CUSTOMER ──────────────────────────────────
    const { data: customerSalesData } = await supabase
      .from("sales_by_customer")
      .select("*")
      .order("totalrevenue", { ascending: false });

    if (customerSalesData) {
      setSalesByCustomer(
        customerSalesData.map((c) => ({
          custno: c.custno,
          custname: c.custname,
          payterm: c.payterm,
          totaltransactions: Number(c.totaltransactions) || 0,
          totalrevenue: Number(c.totalrevenue) || 0,
        })),
      );
    }

    // ─── TOP PRODUCTS SOLD ──────────────────────────────────
    const { data: topProductsData } = await supabase
      .from("top_products_sold")
      .select("*")
      .order("totalrevenue", { ascending: false });

    if (topProductsData) {
      setTopProductsSold(
        topProductsData.map((p) => ({
          prodcode: p.prodcode,
          description: p.description,
          unit: p.unit,
          totalquantity: Number(p.totalquantity) || 0,
          latestprice: Number(p.latestprice) || 0,
          totalrevenue: Number(p.totalrevenue) || 0,
        })),
      );
    }
  }

  // ── getCurrentPrice for a product ───────────────────────────────────────
  const getCurrentPrice = useCallback(
    (prodcode) => {
      const priceEntry = priceHist.find((ph) => ph.prodcode === prodcode);
      if (!priceEntry) return null;
      return {
        prodcode: priceEntry.prodcode,
        unitprice: Number(priceEntry.unitprice) || 0,
        effdate: priceEntry.effdate,
      };
    },
    [priceHist],
  );

  const reloadSales = useCallback(async () => {
    await loadSalesData();
  }, []);

  const reloadAll = useCallback(async () => {
    loadedRef.current = false;
    await loadAll();
  }, []);

  // ── SALES CRUD with notifications ──────────────────────────────────────────
  const addSale = useCallback(
    async (data) => {
      const { data: ins, error } = await supabase
        .from("sales")
        .insert([
          {
            ...data,
            record_status: "ACTIVE",
            stamp: new Date().toISOString(),
          },
        ])
        .select()
        .single();
      if (error) throw error;
      await reloadSales();
      addNotification(
        `✅ Transaction ${data.transno} was created successfully`,
        "success",
      );
      return ins;
    },
    [reloadSales, addNotification],
  );

  const updateSale = useCallback(
    async (transno, updates) => {
      const { data: upd, error } = await supabase
        .from("sales")
        .update({
          ...updates,
          stamp: new Date().toISOString(),
        })
        .eq("transno", transno)
        .select()
        .single();
      if (error) throw error;
      await reloadSales();
      addNotification(
        `✏️ Transaction ${transno} was updated by ${currentUser?.username || "Admin"}`,
        "info",
      );
      return upd;
    },
    [reloadSales, addNotification, currentUser],
  );

  const softDeleteSale = useCallback(
    async (transno) => {
      if (!isSuperAdmin()) {
        throw new Error("Only superadmin can soft delete sales");
      }
      const { error } = await supabase
        .from("sales")
        .update({
          record_status: "DELETED",
          stamp: new Date().toISOString(),
        })
        .eq("transno", transno);
      if (error) throw error;
      await reloadSales();
      addNotification(
        `🗑️ Transaction ${transno} was soft-deleted by ${currentUser?.username || "Super Admin"}`,
        "warning",
      );
    },
    [reloadSales, isSuperAdmin, addNotification, currentUser],
  );

  // ── SALES DETAIL CRUD with notifications ───────────────────────────────────
  const addDetailLine = useCallback(
    async (line) => {
      const { data: ins, error } = await supabase
        .from("salesdetail")
        .insert([
          {
            ...line,
            record_status: "ACTIVE",
            stamp: new Date().toISOString(),
          },
        ])
        .select()
        .single();
      if (error) throw error;
      await reloadSales();
      addNotification(
        `➕ Product ${line.prodcode} was added to transaction ${line.transno}`,
        "info",
      );
      return ins;
    },
    [reloadSales, addNotification],
  );

  const updateDetailLine = useCallback(
    async (transno, prodcode, updates) => {
      const { data: upd, error } = await supabase
        .from("salesdetail")
        .update(updates)
        .eq("transno", transno)
        .eq("prodcode", prodcode)
        .select()
        .single();
      if (error) throw error;
      await reloadSales();
      addNotification(
        `📦 Product ${prodcode} quantity was updated in transaction ${transno}`,
        "info",
      );
      return upd;
    },
    [reloadSales, addNotification],
  );

  const softDeleteDetailLine = useCallback(
    async (transno, prodcode) => {
      const { error } = await supabase
        .from("salesdetail")
        .update({ record_status: "DELETED" })
        .eq("transno", transno)
        .eq("prodcode", prodcode);
      if (error) throw error;
      await reloadSales();
      addNotification(
        `❌ Product ${prodcode} was removed from transaction ${transno}`,
        "warning",
      );
    },
    [reloadSales, addNotification],
  );

  // ── Helper to calculate totals from sales and details ───────────────────
  const getSaleTotal = useCallback(
    (transno) => {
      const details = salesDetail.filter((d) => d.transno === transno);
      return details.reduce(
        (sum, d) =>
          sum + d.quantity * (getCurrentPrice(d.prodcode)?.unitprice || 0),
        0,
      );
    },
    [salesDetail, getCurrentPrice],
  );

  return (
    <AppContext.Provider
      value={{
        loading,
        // Main data
        sales,
        salesDetail,
        customers,
        employees,
        products,
        priceHist,
        departments,
        jobs,
        jobHistory,
        payments,
        rights,
        modules,
        // Report data (from views)
        monthlySalesTrend,
        salesByCustomer,
        topProductsSold,
        // Methods
        loadSales: reloadSales,
        reloadAll,
        addSale,
        updateSale,
        softDeleteSale,
        addDetailLine,
        updateDetailLine,
        softDeleteDetailLine,
        getCurrentPrice,
        getSaleTotal,
        // Role helpers
        isAdmin: isAdminUser(),
        isSuperAdmin: isSuperAdmin(),
        // Notifications
        notifications,
        addNotification,
        markRead,
        markAllRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
