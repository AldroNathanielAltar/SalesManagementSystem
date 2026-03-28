import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/* ─────────────────────────────────────────────────
   PR-03  feat/ui-app-shell
   • Sticky top Navbar — logged-in user display + logout button
   • Collapsible sidebar with SMS navigation groups:
       Sales → Transactions
       Lookups → Customers, Employees, Products, Prices
       (ungrouped) → Reports, Admin, Deleted Items
   • Mobile: hamburger menu, overlay drawer
   • Desktop: persistent sidebar
   • Layout wrapper via <Outlet />
───────────────────────────────────────────────── */

/* ── Sidebar navigation structure (grouped as per spec) ── */
const NAV = [
  {
    group: "Sales",
    items: [
      {
        label: "Transactions",
        path: "/transactions",
        icon: (
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.9"
          >
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <line x1="9" y1="12" x2="15" y2="12" />
            <line x1="9" y1="16" x2="13" y2="16" />
          </svg>
        ),
      },
    ],
  },
  {
    group: "Lookups",
    items: [
      {
        label: "Customers",
        path: "/customers",
        icon: (
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.9"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
      {
        label: "Employees",
        path: "/employees",
        icon: (
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.9"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <circle cx="12" cy="10" r="3" />
            <path d="M6 20c0-3.31 2.69-6 6-6s6 2.69 6 6" />
          </svg>
        ),
      },
      {
        label: "Products",
        path: "/products",
        icon: (
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.9"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        ),
      },
      {
        label: "Prices",
        path: "/prices",
        icon: (
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.9"
          >
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        ),
      },
    ],
  },
  {
    group: null,
    items: [
      {
        label: "Reports",
        path: "/reports",
        icon: (
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.9"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        ),
      },
      {
        label: "Admin",
        path: "/admin",
        icon: (
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.9"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        ),
      },
      {
        label: "Deleted Items",
        path: "/deleted-items",
        icon: (
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.9"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        ),
      },
    ],
  },
];

/* ── NavItem ── */
function NavItem({ item, onClick }) {
  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
        ${
          isActive
            ? "bg-violet-600 text-white shadow-md shadow-violet-900/40"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      {item.icon}
      {item.label}
    </NavLink>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* ── MOBILE OVERLAY ─────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm"
          onClick={closeDrawer}
        />
      )}

      {/* ── SIDEBAR ────────────────────────── */}
      <aside
        className={`
        fixed top-0 left-0 h-full w-60 bg-slate-900 border-r border-slate-800
        flex flex-col z-30 transition-transform duration-300
        ${drawerOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:z-auto
      `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-900/50">
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth="2.2"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-tight">
              Hope, Inc.
            </p>
            <p className="text-slate-500 text-xs">Sales Management</p>
          </div>
          {/* Close on mobile */}
          <button
            onClick={closeDrawer}
            className="ml-auto lg:hidden text-slate-500 hover:text-white"
          >
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            onClick={closeDrawer}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all mb-2
              ${
                isActive
                  ? "bg-violet-600 text-white shadow-md shadow-violet-900/40"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.9"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Dashboard
          </NavLink>

          {/* Grouped nav */}
          {NAV.map((group, gi) => (
            <div key={gi} className="pt-1">
              {group.group && (
                <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  {group.group}
                </p>
              )}
              {group.items.map((item) => (
                <NavItem key={item.path} item={item} onClick={closeDrawer} />
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom user card */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-slate-800">
            <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.avatar || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {user?.name || "User"}
              </p>
              <p className="text-slate-500 text-xs truncate capitalize">
                {user?.role || "Member"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ───────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── NAVBAR ─────────────────────────── */}
        <header
          className="sticky top-0 z-10 h-14 bg-slate-900 border-b border-slate-800
          flex items-center justify-between px-4 lg:px-6"
        >
          {/* Left side */}
          <div className="flex items-center gap-3">
            {/* Hamburger (mobile) */}
            <button
              onClick={() => setDrawerOpen((v) => !v)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span className="text-sm font-medium text-slate-400 hidden md:block">
              Hope, Inc. — Sales Management System
            </span>
          </div>

          {/* Right side: user display + logout */}
          <div className="flex items-center gap-2">
            {/* User display with dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenu((v) => !v)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.avatar || "U"}
                </div>
                <span className="text-sm font-medium text-slate-300 hidden sm:block max-w-[120px] truncate">
                  {user?.name || "User"}
                </span>
                <svg
                  width="13"
                  height="13"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-500"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {userMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-700">
                      <p className="text-sm font-semibold text-white">
                        {user?.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {user?.email}
                      </p>
                      <span className="inline-block mt-1 text-xs font-medium text-violet-400 bg-violet-900/50 px-2 py-0.5 rounded-full capitalize">
                        {user?.role}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                    >
                      <svg
                        width="15"
                        height="15"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Visible logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                text-red-400 border border-red-900/50 hover:bg-red-900/20 transition-all"
            >
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* ── PAGE CONTENT ──────────────────── */}
        <main className="flex-1 p-4 lg:p-6 bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
