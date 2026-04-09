import { createContext, useContext, useState, useCallback } from 'react';
import {
  INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_EMPLOYEES,
  INITIAL_SALES, INITIAL_SALES_DETAIL, INITIAL_PRICE_HIST,
  getCurrentPrice,
} from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [sales,       setSales]       = useState(INITIAL_SALES);
  const [salesDetail, setSalesDetail] = useState(INITIAL_SALES_DETAIL);
  const [products,    setProducts]    = useState(INITIAL_PRODUCTS);
  const [customers,   setCustomers]   = useState(INITIAL_CUSTOMERS);
  const [employees,   setEmployees]   = useState(INITIAL_EMPLOYEES);
  const [priceHist,   setPriceHist]   = useState(INITIAL_PRICE_HIST);
  const [notifications, setNotifications] = useState([
    { id:1, text:'New transaction TR000008 from StartupHub Manila', time:'2 min ago',  read:false },
    { id:2, text:'TR000006 soft-deleted by admin',                  time:'18 min ago', read:false },
    { id:3, text:'TR000009 soft-deleted by admin',                  time:'1 hr ago',   read:true  },
  ]);

  // ─── Sales (transactions) ─────────────────────────────────────────────────
  const addSale = useCallback((data) => {
    const num = String(sales.length + 11).padStart(6, '0');
    const transNo = `TR${num}`;
    const stamp = new Date().toISOString().replace('T',' ').slice(0,19);
    setSales(prev => [...prev, { ...data, transNo, record_status:'ACTIVE', stamp }]);
  }, [sales.length]);

  const updateSale = useCallback((transNo, updates) =>
    setSales(prev => prev.map(s => s.transNo === transNo
      ? { ...s, ...updates, stamp: new Date().toISOString().replace('T',' ').slice(0,19) }
      : s)), []);

  // Cascade soft-delete: marks sale + all its detail lines INACTIVE
  const softDeleteSale = useCallback((transNo) => {
    const stamp = new Date().toISOString().replace('T',' ').slice(0,19);
    setSales(prev => prev.map(s => s.transNo === transNo ? { ...s, record_status:'INACTIVE', stamp } : s));
    setSalesDetail(prev => prev.map(d => d.transNo === transNo ? { ...d, record_status:'INACTIVE' } : d));
  }, []);

  // Cascade recover: marks sale + all its detail lines ACTIVE
  const recoverSale = useCallback((transNo) => {
    const stamp = new Date().toISOString().replace('T',' ').slice(0,19);
    setSales(prev => prev.map(s => s.transNo === transNo ? { ...s, record_status:'ACTIVE', stamp } : s));
    setSalesDetail(prev => prev.map(d => d.transNo === transNo ? { ...d, record_status:'ACTIVE' } : d));
  }, []);

  // ─── Sales Detail (line items) ────────────────────────────────────────────
  const addDetailLine = useCallback((line) => {
    const id = `SD${String(salesDetail.length + 100).padStart(3,'0')}`;
    setSalesDetail(prev => [...prev, { ...line, id, record_status:'ACTIVE' }]);
  }, [salesDetail.length]);

  const updateDetailLine = useCallback((id, updates) =>
    setSalesDetail(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d)), []);

  const softDeleteDetailLine = useCallback((id) =>
    setSalesDetail(prev => prev.map(d => d.id === id ? { ...d, record_status:'INACTIVE' } : d)), []);

  const recoverDetailLine = useCallback((id) =>
    setSalesDetail(prev => prev.map(d => d.id === id ? { ...d, record_status:'ACTIVE' } : d)), []);

  // ─── Notifications ────────────────────────────────────────────────────────
  const markRead = useCallback((id) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read:true } : n)), []);
  const markAllRead = useCallback(() =>
    setNotifications(prev => prev.map(n => ({ ...n, read:true }))), []);

  return (
    <AppContext.Provider value={{
      sales, addSale, updateSale, softDeleteSale, recoverSale,
      salesDetail, addDetailLine, updateDetailLine, softDeleteDetailLine, recoverDetailLine,
      products, customers, employees, priceHist, getCurrentPrice,
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
