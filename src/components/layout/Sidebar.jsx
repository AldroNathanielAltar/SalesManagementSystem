// src/components/layout/Sidebar.jsx
// PR-01: feat/rights-admin-gating
// M4 – Rights & Auth Specialist | Sprint 3
//
// Changes from Sprint 2:
// - Added useRights() import
// - Users link visible only when ADM_USER === 1

import { NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Users,
  Package,
  Tag,
  BarChart3,
  ShieldCheck,
  Trash2,
  TrendingUp,
  ChevronRight,
  LogOut,
  Shield,
  Crown,
  UserCog,
} from "lucide-react";
import { useAuth }   from "../../context/AuthContext";
import { useRights } from "../../context/UserRightsContext";
import "./Sidebar.css";

export default function Sidebar({ open, onClose }) {
  const { currentUser, signOut } = useAuth()
  const { can } = useRights()
  const nav = useNavigate()

  const isSuperAdmin = currentUser?.user_type === 'SUPERADMIN'
  const isAdmin      = currentUser?.user_type === 'ADMIN' || isSuperAdmin

  async function handleLogout() {
    await signOut()
    nav("/login")
  }

  return (
    <>
      {open && <div className="sb-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sb-logo">
          <div className="sb-logo-icon">
            <TrendingUp size={17} />
          </div>
          <span className="sb-logo-text">SalesFlow</span>
        </div>

        <div className="sb-role-wrap">
          <div className={`sb-role-pill ${isSuperAdmin ? "super" : isAdmin ? "admin" : "user"}`}>
            {isSuperAdmin ? <Crown size={11} /> : <Shield size={11} />}
            {isSuperAdmin ? "Super Admin" : isAdmin ? "Admin" : "User"}
          </div>
        </div>

        <nav className="sb-nav">
          {/* Sales */}
          <div className="sb-group">
            <p className="sb-group-label">Sales</p>
            <NavLink to="/sales"
              className={({ isActive }) => `sb-item ${isActive ? "active" : ""}`}
              onClick={onClose}>
              <ShoppingCart size={16} /><span>Transactions</span>
              <ChevronRight size={12} className="sb-arrow" />
            </NavLink>
          </div>

          {/* Lookups */}
          <div className="sb-group">
            <p className="sb-group-label">Lookups</p>
            {[
              { to: "/lookups/customers", icon: Users,   label: "Customers"     },
              { to: "/lookups/employees", icon: Users,   label: "Employees"     },
              { to: "/lookups/products",  icon: Package, label: "Products"      },
              { to: "/lookups/prices",    icon: Tag,     label: "Price History" },
            ].map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => `sb-item ${isActive ? "active" : ""}`}
                onClick={onClose}>
                <Icon size={16} /><span>{label}</span>
                <ChevronRight size={12} className="sb-arrow" />
              </NavLink>
            ))}
          </div>

          {/* Analytics */}
          <div className="sb-group">
            <p className="sb-group-label">Analytics</p>
            <NavLink to="/reports"
              className={({ isActive }) => `sb-item ${isActive ? "active" : ""}`}
              onClick={onClose}>
              <BarChart3 size={16} /><span>Reports</span>
              <ChevronRight size={12} className="sb-arrow" />
            </NavLink>
          </div>

          {/* Admin — hidden for USER accounts */}
          {isAdmin && (
            <div className="sb-group">
              <p className="sb-group-label">Admin</p>

              {/* Users link — gated by ADM_USER right */}
              {can('ADM_USER') && (
                <NavLink to="/users"
                  className={({ isActive }) => `sb-item ${isActive ? "active" : ""}`}
                  onClick={onClose}>
                  <UserCog size={16} /><span>Users</span>
                  <ChevronRight size={12} className="sb-arrow" />
                </NavLink>
              )}

              <NavLink to="/admin"
                className={({ isActive }) => `sb-item ${isActive ? "active" : ""}`}
                onClick={onClose}>
                <ShieldCheck size={16} /><span>Admin</span>
                <ChevronRight size={12} className="sb-arrow" />
              </NavLink>

              <NavLink to="/deleted-items"
                className={({ isActive }) => `sb-item ${isActive ? "active" : ""}`}
                onClick={onClose}>
                <Trash2 size={16} /><span>Deleted Items</span>
                <ChevronRight size={12} className="sb-arrow" />
              </NavLink>
            </div>
          )}
        </nav>

        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">
              {currentUser?.username?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div className="sb-user-info">
              <p className="sb-uname">{currentUser?.username}</p>
              <p className="sb-uemail">{currentUser?.email}</p>
            </div>
          </div>
          <button className="sb-logout" onClick={handleLogout} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
