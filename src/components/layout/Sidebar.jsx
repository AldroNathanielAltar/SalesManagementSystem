// Sidebar.jsx - Main navigation sidebar component
// Provides access to all major sections: Sales, Lookups, Reports, and Admin
// Renders as a collapsible sidebar on desktop and overlay on mobile

import { NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Users,
  Package,
  Tag,
  BarChart3,
  Trash2,
  TrendingUp,
  ChevronRight,
  LogOut,
  Shield,
  Crown,
  UserCog,
  UserCheck,
  Star,
  Package2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useRights } from "../../context/RightsContext";
import "./Sidebar.css";

/**
 * Sidebar Component - Main navigation menu
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls sidebar visibility on mobile
 * @param {Function} props.onClose - Callback to close the sidebar
 */
export default function Sidebar({ open, onClose }) {
  // Authentication and permission hooks
  const { currentUser, signOut } = useAuth(); // User authentication state
  const { can } = useRights(); // Permission checking function
  const nav = useNavigate(); // Navigation function

  // Determine user role from currentUser object
  const userType = currentUser?.user_type || "USER";
  const isSuperAdmin = userType === "SUPERADMIN";
  const isAdmin = userType === "ADMIN" || isSuperAdmin;
  const showAdmin = can("ADM_USER") || isAdmin; // Show admin section if user has permission

  // Build display name from user metadata or fallback to username/email
  const meta = currentUser?.user_metadata || {};
  const firstName = meta.firstName || meta.first_name || "";
  const lastName = meta.lastName || meta.last_name || "";
  const fullName =
    firstName || lastName
      ? `${firstName} ${lastName}`.trim()
      : currentUser?.username || currentUser?.email?.split("@")[0] || "User";

  // Generate avatar initials (first 2 letters of the name)
  const avatarInitials = fullName.slice(0, 2).toUpperCase();

  /**
   * Handles user logout
   * - Signs out from Supabase
   * - Redirects to login page
   */
  async function handleLogout() {
    await signOut();
    nav("/login", { replace: true });
  }

  return (
    <>
      {/* Backdrop overlay for mobile - closes sidebar when clicked */}
      {open && <div className="sb-backdrop" onClick={onClose} />}

      {/* Sidebar container - conditionally open class for mobile */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* Logo / Brand Section */}
        <div className="sb-logo">
          <div className="sb-logo-icon">
            <TrendingUp size={17} /> {/* Sales trend icon */}
          </div>
          <span className="sb-logo-text">SalesFlow</span>
        </div>

        {/* Role pill — shows user's role badge (Super Admin or Admin) */}
        {/* Only visible for admin/superadmin, hidden for regular users */}
        {(isAdmin || isSuperAdmin) && (
          <div className="sb-role-wrap">
            <div className={`sb-role-pill ${isSuperAdmin ? "super" : "admin"}`}>
              {/* Different icons for Super Admin vs Admin */}
              {isSuperAdmin ? <Crown size={11} /> : <Shield size={11} />}
              {isSuperAdmin ? "Super Admin" : "Admin"}
            </div>
          </div>
        )}

        {/* Main Navigation Menu */}
        <nav className="sb-nav">
          {/* ===== SALES SECTION ===== */}
          <div className="sb-group">
            <p className="sb-group-label">Sales</p>
            <NavLink
              to="/sales"
              className={({ isActive }) =>
                `sb-item ${isActive ? "active" : ""}`
              }
              onClick={onClose} // Close sidebar on mobile after navigation
            >
              <ShoppingCart size={16} />
              <span>Transactions</span>
              <ChevronRight size={12} className="sb-arrow" />
            </NavLink>
          </div>

          {/* ===== LOOKUPS SECTION ===== */}
          <div className="sb-group">
            <p className="sb-group-label">Lookups</p>
            {/* Array of lookup pages with their paths, icons, and labels */}
            {[
              { to: "/lookups/customers", icon: Users, label: "Customers" },
              { to: "/lookups/employees", icon: Users, label: "Employees" },
              { to: "/lookups/products", icon: Package, label: "Products" },
              { to: "/lookups/prices", icon: Tag, label: "Price History" },
            ].map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `sb-item ${isActive ? "active" : ""}`
                }
                onClick={onClose}
              >
                <Icon size={16} />
                <span>{label}</span>
                <ChevronRight size={12} className="sb-arrow" />
              </NavLink>
            ))}
          </div>

          {/* ===== REPORTS SECTION ===== */}
          <div className="sb-group">
            <p className="sb-group-label">Reports</p>
            {/* Array of report pages */}
            {[
              {
                to: "/reports/by-employee",
                icon: UserCheck,
                label: "By Employee",
              },
              { to: "/reports/by-customer", icon: Star, label: "By Customer" },
              {
                to: "/reports/top-products",
                icon: Package2,
                label: "Top Products",
              },
              {
                to: "/reports/monthly",
                icon: BarChart3,
                label: "Monthly Trend",
              },
            ].map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `sb-item ${isActive ? "active" : ""}`
                }
                onClick={onClose}
              >
                <Icon size={16} />
                <span>{label}</span>
                <ChevronRight size={12} className="sb-arrow" />
              </NavLink>
            ))}
          </div>

          {/* ===== ADMIN SECTION ===== (Conditional - only for authorized users) */}
          {showAdmin && (
            <div className="sb-group">
              <p className="sb-group-label">Admin</p>
              {/* User Management - for activating/deactivating users */}
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `sb-item ${isActive ? "active" : ""}`
                }
                onClick={onClose}
              >
                <UserCog size={16} />
                <span>User Management</span>
                <ChevronRight size={12} className="sb-arrow" />
              </NavLink>
              {/* Deleted Items - for recovering soft-deleted records */}
              <NavLink
                to="/deleted-items"
                className={({ isActive }) =>
                  `sb-item ${isActive ? "active" : ""}`
                }
                onClick={onClose}
              >
                <Trash2 size={16} />
                <span>Deleted Items</span>
                <ChevronRight size={12} className="sb-arrow" />
              </NavLink>
            </div>
          )}
        </nav>

        {/* ===== FOOTER SECTION ===== */}
        {/* Shows current user info and logout button */}
        <div className="sb-footer">
          {/* User Info Section */}
          <div className="sb-user">
            {/* Avatar circle with user initials */}
            <div className="sb-avatar">{avatarInitials}</div>
            <div className="sb-user-info">
              <p className="sb-uname">{fullName}</p>
              <p className="sb-uemail">{currentUser?.email || ""}</p>
            </div>
          </div>
          {/* Logout Button */}
          <button className="sb-logout" onClick={handleLogout} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
