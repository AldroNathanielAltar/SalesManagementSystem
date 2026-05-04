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
import { useRights } from "../../context/UserRightsContext";
import "./Sidebar.css";

export default function Sidebar({ open, onClose }) {
  const { currentUser, signOut } = useAuth();
  const { can } = useRights();
  const nav = useNavigate();

  // Derive role flags from user_type — AuthContext does NOT export these
  const userType = currentUser?.user_type || "USER";
  const isSuperAdmin = userType === "SUPERADMIN";
  const isAdmin = userType === "ADMIN" || isSuperAdmin;
  const showAdmin = can("ADM_USER") || isAdmin;

  const avatarInitials = currentUser?.username
    ? currentUser.username.slice(0, 2).toUpperCase()
    : (currentUser?.email || "U").slice(0, 2).toUpperCase();

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

        <div className="sb-role-wrap">
          <div
            className={`sb-role-pill ${isSuperAdmin ? "super" : isAdmin ? "admin" : "user"}`}
          >
            {isSuperAdmin ? (
              <Crown size={11} />
            ) : isAdmin ? (
              <Shield size={11} />
            ) : null}
            {isSuperAdmin ? "Super Admin" : isAdmin ? "Admin" : "User"}
          </div>
        </div>

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

          {/* Admin — gated by ADM_USER right */}
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

        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">{avatarInitials}</div>
            <div className="sb-user-info">
              <p className="sb-uname">
                {currentUser?.username || currentUser?.email || "User"}
              </p>
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
