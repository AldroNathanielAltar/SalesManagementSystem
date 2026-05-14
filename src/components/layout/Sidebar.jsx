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

export default function Sidebar({ open, onClose }) {
  const { currentUser, signOut } = useAuth();
  const { can } = useRights();
  const nav = useNavigate();

  const userType = currentUser?.user_type || "USER";
  const isSuperAdmin = userType === "SUPERADMIN";
  const isAdmin = userType === "ADMIN" || isSuperAdmin;
  const showAdmin = can("ADM_USER") || isAdmin;

  // Build display name: prefer firstName+lastName from metadata, fall back to username
  const meta = currentUser?.user_metadata || {};
  const firstName = meta.firstName || meta.first_name || "";
  const lastName = meta.lastName || meta.last_name || "";
  const fullName =
    firstName || lastName
      ? `${firstName} ${lastName}`.trim()
      : currentUser?.username || currentUser?.email?.split("@")[0] || "User";

  const avatarInitials = fullName.slice(0, 2).toUpperCase();

  async function handleLogout() {
    await signOut();
    nav("/login", { replace: true });
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

        {/* Role pill — only show if admin or superadmin, hide for plain USER */}
        {(isAdmin || isSuperAdmin) && (
          <div className="sb-role-wrap">
            <div className={`sb-role-pill ${isSuperAdmin ? "super" : "admin"}`}>
              {isSuperAdmin ? <Crown size={11} /> : <Shield size={11} />}
              {isSuperAdmin ? "Super Admin" : "Admin"}
            </div>
          </div>
        )}

        <nav className="sb-nav">
          {/* Sales */}
          <div className="sb-group">
            <p className="sb-group-label">Sales</p>
            <NavLink
              to="/sales"
              className={({ isActive }) =>
                `sb-item ${isActive ? "active" : ""}`
              }
              onClick={onClose}
            >
              <ShoppingCart size={16} />
              <span>Transactions</span>
              <ChevronRight size={12} className="sb-arrow" />
            </NavLink>
          </div>

          {/* Lookups */}
          <div className="sb-group">
            <p className="sb-group-label">Lookups</p>
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

          {/* Reports */}
          <div className="sb-group">
            <p className="sb-group-label">Reports</p>
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

          {/* Admin — gated */}
          {showAdmin && (
            <div className="sb-group">
              <p className="sb-group-label">Admin</p>
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

        {/* Footer — shows full name + email */}
        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">{avatarInitials}</div>
            <div className="sb-user-info">
              <p className="sb-uname">{fullName}</p>
              <p className="sb-uemail">{currentUser?.email || ""}</p>
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
