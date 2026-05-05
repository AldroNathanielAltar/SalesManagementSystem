import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { currentUser } = useAuth(); // Only use what AuthContext exports

  const [sales, setSales] = useState([]);
  const [salesDetail, setSalesDetail] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [priceHist, setPriceHist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Load lookups + sales when user logs in
  useEffect(() => {
    if (!currentUser) {
      setSales([]);
      setSalesDetail([]);
      setCustomers([]);
      setEmployees([]);
      setProducts([]);
      setPriceHist([]);
      return;
    }
    loadLookups();
    loadSales();
    loadSalesDetail();
  }, [currentUser?.userid]);

  async function loadLookups() {
    const [custs, emps, prods, prices] = await Promise.all([
      supabase.from("customer").select("*").order("custno"),
      supabase.from("employee").select("*").order("empno"),
      supabase.from("product").select("*").order("prodCode"),
      supabase
        .from("priceHist")
        .select("*")
        .order("effDate", { ascending: false }),
    ]);
    if (custs.data) setCustomers(custs.data);
    if (emps.data) setEmployees(emps.data);
    if (prods.data) setProducts(prods.data);
    if (prices.data) setPriceHist(prices.data);
  }

  async function loadSales() {
    setLoading(true);
    const isAdminUser =
      currentUser?.user_type === "ADMIN" ||
      currentUser?.user_type === "SUPERADMIN";
    let query = supabase
      .from("sales")
      .select("*")
      .order("salesDate", { ascending: false });
    if (!isAdminUser) query = query.eq("record_status", "ACTIVE");
    const { data, error } = await query;
    if (error) console.error("loadSales error:", error.message);
    else setSales(data || []);
    setLoading(false);
  }

  async function loadSalesDetail() {
    const isAdminUser =
      currentUser?.user_type === "ADMIN" ||
      currentUser?.user_type === "SUPERADMIN";
    let query = supabase.from("salesDetail").select("*");
    if (!isAdminUser) query = query.eq("record_status", "ACTIVE");
    const { data, error } = await query;
    if (error) console.error("loadSalesDetail error:", error.message);
    else setSalesDetail(data || []);
  }

  const getCurrentPrice = useCallback(
    (prodCode) => {
      const rows = priceHist
        .filter((p) => p.prodCode === prodCode)
        .sort((a, b) => new Date(b.effDate) - new Date(a.effDate));
      return rows[0] || null;
    },
    [priceHist],
  );

  // ── SALES CRUD ──────────────────────────────────────────────────────────────
  const addSale = useCallback(async (data) => {
    const { data: inserted, error } = await supabase
      .from("sales")
      .insert([{ ...data, record_status: "ACTIVE" }])
      .select()
      .single();
    if (error) throw error;
    setSales((prev) => [inserted, ...prev]);
    return inserted;
  }, []);

  const updateSale = useCallback(async (transNo, updates) => {
    const { data: updated, error } = await supabase
      .from("sales")
      .update({ ...updates, stamp: new Date().toISOString() })
      .eq("transNo", transNo)
      .select()
      .single();
    if (error) throw error;
    setSales((prev) => prev.map((s) => (s.transNo === transNo ? updated : s)));
    return updated;
  }, []);

  const softDeleteSale = useCallback(
    async (transNo) => {
      const { error } = await supabase
        .from("sales")
        .update({ record_status: "INACTIVE", stamp: new Date().toISOString() })
        .eq("transNo", transNo);
      if (error) throw error;
      await Promise.all([loadSales(), loadSalesDetail()]);
    },
    [currentUser?.user_type],
  );

  const recoverSale = useCallback(
    async (transNo) => {
      const { error } = await supabase
        .from("sales")
        .update({ record_status: "ACTIVE", stamp: new Date().toISOString() })
        .eq("transNo", transNo);
      if (error) throw error;
      await Promise.all([loadSales(), loadSalesDetail()]);
    },
    [currentUser?.user_type],
  );

  // ── SALES DETAIL CRUD ───────────────────────────────────────────────────────
  const addDetailLine = useCallback(async (line) => {
    const { data: inserted, error } = await supabase
      .from("salesDetail")
      .insert([{ ...line, record_status: "ACTIVE" }])
      .select()
      .single();
    if (error) throw error;
    setSalesDetail((prev) => [...prev, inserted]);
    return inserted;
  }, []);

  const updateDetailLine = useCallback(async (id, updates) => {
    const { data: updated, error } = await supabase
      .from("salesDetail")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setSalesDetail((prev) => prev.map((d) => (d.id === id ? updated : d)));
    return updated;
  }, []);

  const softDeleteDetailLine = useCallback(async (id) => {
    const { error } = await supabase
      .from("salesDetail")
      .update({ record_status: "INACTIVE" })
      .eq("id", id);
    if (error) throw error;
    setSalesDetail((prev) =>
      prev.map((d) => (d.id === id ? { ...d, record_status: "INACTIVE" } : d)),
    );
  }, []);

  const recoverDetailLine = useCallback(async (id) => {
    const { error } = await supabase
      .from("salesDetail")
      .update({ record_status: "ACTIVE" })
      .eq("id", id);
    if (error) throw error;
    setSalesDetail((prev) =>
      prev.map((d) => (d.id === id ? { ...d, record_status: "ACTIVE" } : d)),
    );
  }, []);

  const markRead = useCallback(
    (id) =>
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      ),
    [],
  );
  const markAllRead = useCallback(
    () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    [],
  );

  return (
    <AppContext.Provider
      value={{
        loading,
        sales,
        loadSales,
        salesDetail,
        loadSalesDetail,
        addSale,
        updateSale,
        softDeleteSale,
        recoverSale,
        addDetailLine,
        updateDetailLine,
        softDeleteDetailLine,
        recoverDetailLine,
        customers,
        employees,
        products,
        priceHist,
        getCurrentPrice,
        notifications,
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
