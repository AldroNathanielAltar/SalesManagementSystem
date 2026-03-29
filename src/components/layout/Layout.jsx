import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./Layout.css";

const TITLES = {
  "/sales": "Sales Transactions",
  "/lookups/customers": "Customer Lookup",
  "/lookups/employees": "Employee Lookup",
  "/lookups/products": "Product Lookup",
  "/lookups/prices": "Price History",
  "/reports": "Sales Reports",
  "/admin": "Admin Panel",
  "/deleted-items": "Deleted Items",
  "/dashboard": "Dashboard",
  "/users": "User Management",
};

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const title = TITLES[pathname] || "SalesFlow SMS";

  return (
    <div className="layout">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="layout-main">
        <Topbar onMenuClick={() => setOpen(true)} title={title} />
        <main className="layout-content fade-in">{children}</main>
      </div>
    </div>
  );
}
