// Layout.jsx - Main layout component that wraps all protected pages
// Handles the sidebar, topbar, and main content area layout

import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./Layout.css";

// Object mapping route paths to their display titles in the topbar
const TITLES = {
  "/sales": "Sales Transactions", // Sales list page
  "/lookups/customers": "Customer Lookup", // Customer lookup page
  "/lookups/employees": "Employee Lookup", // Employee lookup page
  "/lookups/products": "Product Lookup", // Product lookup page
  "/lookups/prices": "Price History", // Price history lookup page
  "/reports": "Sales Reports", // Reports main page
  "/admin": "Admin Panel", // Admin dashboard
  "/deleted-items": "Deleted Items", // Soft-deleted items page
  "/users": "User Management", // User management page
};

/**
 * Determines the title to display in the topbar based on the current route
 * @param {string} pathname - The current URL path
 * @returns {string} - The display title for the current page
 */
function getTitle(pathname) {
  // Check if the path starts with '/sales/' (for individual sale detail pages)
  // Example: '/sales/TR000001' will show 'Sale Detail'
  if (pathname.startsWith("/sales/")) return "Sale Detail";

  // Return the mapped title from TITLES object, or fallback to default
  return TITLES[pathname] || "SalesFlow SMS";
}

/**
 * Layout Component - Main layout wrapper for protected routes
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render in the main content area
 */
export default function Layout({ children }) {
  // State to control sidebar open/close (mobile view)
  const [open, setOpen] = useState(false);

  // Get the current route pathname from React Router
  const { pathname } = useLocation();

  return (
    // Main layout container
    <div className="layout">
      {/* Sidebar component - navigation menu */}
      {/* open: controls whether sidebar is visible on mobile */}
      {/* onClose: function to close the sidebar */}
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Main content area (right side of sidebar) */}
      <div className="layout-main">
        {/* Topbar component - header with title and notification bell */}
        {/* onMenuClick: opens the sidebar on mobile */}
        {/* title: current page title to display */}
        <Topbar onMenuClick={() => setOpen(true)} title={getTitle(pathname)} />

        {/* Main content wrapper - renders the actual page content */}
        {/* fade-in class adds a subtle animation when content loads */}
        <main className="layout-content fade-in">{children}</main>
      </div>
    </div>
  );
}
