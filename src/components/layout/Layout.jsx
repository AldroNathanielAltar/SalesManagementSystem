import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';
import './Layout.css';

const TITLES = {
  '/sales':              'Sales Transactions',
  '/lookups/customers':  'Customer Lookup',
  '/lookups/employees':  'Employee Lookup',
  '/lookups/products':   'Product Lookup',
  '/lookups/prices':     'Price History',
  '/reports':            'Sales Reports',
  '/admin':              'Admin Panel',
  '/deleted-items':      'Deleted Items',
  '/users':              'User Management',
};

function getTitle(pathname) {
  if (pathname.startsWith('/sales/')) return 'Sale Detail';
  return TITLES[pathname] || 'SalesFlow SMS';
}

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="layout">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="layout-main">
        <Topbar onMenuClick={() => setOpen(true)} title={getTitle(pathname)} />
        <main className="layout-content fade-in">{children}</main>
      </div>
    </div>
  );
}
