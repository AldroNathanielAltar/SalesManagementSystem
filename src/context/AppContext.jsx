import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { currentUser } = useAuth();
  const loadedRef = useRef(false);    // prevent reload on tab switch
  const dbInfoRef = useRef(null);     // cache discovered table names

  const [sales,         setSales]         = useState([]);
  const [salesDetail,   setSalesDetail]   = useState([]);
  const [customers,     setCustomers]     = useState([]);
  const [employees,     setEmployees]     = useState([]);
  const [products,      setProducts]      = useState([]);
  const [priceHist,     setPriceHist]     = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      // Only reset if we're actually logging out — not tab switching
      // Tab switch doesn't change currentUser, so this won't fire
      loadedRef.current = false;
      dbInfoRef.current = null;
      setSales([]); setSalesDetail([]);
      setCustomers([]); setEmployees([]); setProducts([]); setPriceHist([]);
      return;
    }

    // Skip if already loaded — prevents tab-switch reload
    if (loadedRef.current) return;

    loadedRef.current = true;
    discoverAndLoad();
  }, [currentUser?.userid]);

  async function tryTable(names) {
    for (const name of names) {
      const { error } = await supabase.from(name).select('*').limit(1);
      if (!error) return name;
    }
    return names[0];
  }

  async function discoverAndLoad() {
    setLoading(true);

    const [salesTbl, detailTbl, custTbl, empTbl, prodTbl, priceTbl] = await Promise.all([
      tryTable(['sales']),
      tryTable(['salesdetail', 'salesDetail', 'sales_detail']),
      tryTable(['customer', 'customers']),
      tryTable(['employee', 'employees']),
      tryTable(['product', 'products']),
      tryTable(['pricehist', 'priceHist', 'price_hist', 'pricelist']),
    ]);

    const info = { salesTbl, detailTbl, custTbl, empTbl, prodTbl, priceTbl };
    dbInfoRef.current = info;
    console.log('[AppContext] Tables:', info);

    await Promise.all([loadAllSales(info), loadLookups(info)]);
    setLoading(false);
  }

  async function loadLookups({ custTbl, empTbl, prodTbl, priceTbl }) {
    const [c, e, p, ph] = await Promise.all([
      supabase.from(custTbl).select('*'),
      supabase.from(empTbl).select('*'),
      supabase.from(prodTbl).select('*'),
      supabase.from(priceTbl).select('*'),
    ]);
    if (c.data)  setCustomers(c.data);
    if (e.data)  setEmployees(e.data);
    if (p.data)  setProducts(p.data);
    if (ph.data) setPriceHist(ph.data);
  }

  async function loadAllSales({ salesTbl, detailTbl }) {
    const isAdminUser = currentUser?.user_type === 'ADMIN' || currentUser?.user_type === 'SUPERADMIN';

    // Sales
    const { data: sd } = await supabase.from(salesTbl).select('*');
    if (sd) {
      const norm = sd.map(normalizeRow);
      setSales(isAdminUser ? norm : norm.filter(s => s.record_status === 'ACTIVE'));
    }

    // Sales detail
    const { data: dd } = await supabase.from(detailTbl).select('*');
    if (dd) {
      const norm = dd.map(normalizeDetailRow);
      setSalesDetail(isAdminUser ? norm : norm.filter(d => d.record_status === 'ACTIVE'));
    }
  }

  function normalizeRow(row) {
    return {
      ...row,
      transNo:       row.transNo    || row.transno    || row.trans_no    || row.id        || '',
      salesDate:     row.salesDate  || row.sale_date  || row.saledate    || row.date      || '',
      custno:        row.custno     || row.cust_no    || row.custNo      || '',
      custname:      row.custname   || row.cust_name  || row.custName    || '',
      empno:         row.empno      || row.emp_no     || row.empNo       || '',
      empname:       row.empname    || row.emp_name   || row.empName     || '',
      record_status: row.record_status || 'ACTIVE',
      stamp:         row.stamp || row.updated_at || '',
    };
  }

  function normalizeDetailRow(row) {
    return {
      ...row,
      transNo:       row.transNo    || row.transno    || row.trans_no    || '',
      prodCode:      row.prodCode   || row.prod_code  || row.prodcode    || '',
      description:   row.description || row.desc || row.product_name    || '',
      qty:           row.qty        || row.quantity   || 0,
      unitPrice:     row.unitPrice  || row.unit_price || row.price       || 0,
      record_status: row.record_status || 'ACTIVE',
    };
  }

  const getCurrentPrice = useCallback((prodCode) => {
    const rows = priceHist
      .filter(p => (p.prodCode || p.prod_code || p.prodcode) === prodCode)
      .sort((a, b) => new Date(b.effDate || b.eff_date || 0) - new Date(a.effDate || a.eff_date || 0));
    return rows[0] || null;
  }, [priceHist]);

  // Force reload (used by loadSales, loadSalesDetail)
  const reloadSales = useCallback(async () => {
    if (dbInfoRef.current) await loadAllSales(dbInfoRef.current);
  }, [currentUser?.user_type]);

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const addSale = useCallback(async (data) => {
    const tbl = dbInfoRef.current?.salesTbl || 'sales';
    const { data: ins, error } = await supabase.from(tbl)
      .insert([{ ...data, record_status: 'ACTIVE' }]).select().single();
    if (error) throw error;
    const norm = normalizeRow(ins);
    setSales(prev => [norm, ...prev]);
    return norm;
  }, []);

  const updateSale = useCallback(async (transNo, updates) => {
    const tbl = dbInfoRef.current?.salesTbl || 'sales';
    const { data: upd, error } = await supabase.from(tbl)
      .update({ ...updates, stamp: new Date().toISOString() })
      .eq('transNo', transNo).select().single();
    if (error) throw error;
    const norm = normalizeRow(upd);
    setSales(prev => prev.map(s => s.transNo === transNo ? norm : s));
    return norm;
  }, []);

  const softDeleteSale = useCallback(async (transNo) => {
    const tbl = dbInfoRef.current?.salesTbl || 'sales';
    const { error } = await supabase.from(tbl)
      .update({ record_status: 'INACTIVE', stamp: new Date().toISOString() })
      .eq('transNo', transNo);
    if (error) throw error;
    if (dbInfoRef.current) await loadAllSales(dbInfoRef.current);
  }, [currentUser?.user_type]);

  const recoverSale = useCallback(async (transNo) => {
    const tbl = dbInfoRef.current?.salesTbl || 'sales';
    const { error } = await supabase.from(tbl)
      .update({ record_status: 'ACTIVE', stamp: new Date().toISOString() })
      .eq('transNo', transNo);
    if (error) throw error;
    if (dbInfoRef.current) await loadAllSales(dbInfoRef.current);
  }, [currentUser?.user_type]);

  const addDetailLine = useCallback(async (line) => {
    const tbl = dbInfoRef.current?.detailTbl || 'salesdetail';
    const { data: ins, error } = await supabase.from(tbl)
      .insert([{ ...line, record_status: 'ACTIVE' }]).select().single();
    if (error) throw error;
    const norm = normalizeDetailRow(ins);
    setSalesDetail(prev => [...prev, norm]);
    return norm;
  }, []);

  const updateDetailLine = useCallback(async (id, updates) => {
    const tbl = dbInfoRef.current?.detailTbl || 'salesdetail';
    const { data: upd, error } = await supabase.from(tbl)
      .update(updates).eq('id', id).select().single();
    if (error) throw error;
    const norm = normalizeDetailRow(upd);
    setSalesDetail(prev => prev.map(d => d.id === id ? norm : d));
    return norm;
  }, []);

  const softDeleteDetailLine = useCallback(async (id) => {
    const tbl = dbInfoRef.current?.detailTbl || 'salesdetail';
    const { error } = await supabase.from(tbl)
      .update({ record_status: 'INACTIVE' }).eq('id', id);
    if (error) throw error;
    setSalesDetail(prev => prev.map(d => d.id === id ? { ...d, record_status: 'INACTIVE' } : d));
  }, []);

  const recoverDetailLine = useCallback(async (id) => {
    const tbl = dbInfoRef.current?.detailTbl || 'salesdetail';
    const { error } = await supabase.from(tbl)
      .update({ record_status: 'ACTIVE' }).eq('id', id);
    if (error) throw error;
    setSalesDetail(prev => prev.map(d => d.id === id ? { ...d, record_status: 'ACTIVE' } : d));
  }, []);

  const markRead    = useCallback((id) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)), []);
  const markAllRead = useCallback(() =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true }))), []);

  return (
    <AppContext.Provider value={{
      loading,
      sales,       loadSales: reloadSales,
      salesDetail, loadSalesDetail: reloadSales,
      addSale, updateSale, softDeleteSale, recoverSale,
      addDetailLine, updateDetailLine, softDeleteDetailLine, recoverDetailLine,
      customers, employees, products, priceHist, getCurrentPrice,
      notifications, markRead, markAllRead,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}