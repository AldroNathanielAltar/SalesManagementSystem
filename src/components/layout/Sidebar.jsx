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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

const NAV_GROUPS = [
  {
    label: "Sales",
    items: [{ to: "/sales", icon: ShoppingCart, label: "Transactions" }],
  },
  {
    label: "Lookups",
    items: [
      { to: "/lookups/customers", icon: Users, label: "Customers" },
      { to: "/lookups/employees", icon: Users, label: "Employees" },
      { to: "/lookups/products", icon: Package, label: "Products" },
      { to: "/lookups/prices", icon: Tag, label: "Price History" },
    ],
  },
  {
    label: "Analytics",
    items: [{ to: "/reports", icon: BarChart3, label: "Reports" }],
  },
  {
    label: "Admin",
    adminOnly: true,
    items: [
      { to: "/admin", icon: ShieldCheck, label: "Admin" },
      { to: "/deleted-items", icon: Trash2, label: "Deleted Items" },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const { currentUser, isSuperAdmin, isAdmin } = useAuth();
  const nav = useNavigate();

  function handleLogout() {
    // TODO: supabase.auth.signOut()
    nav("/login");
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
          <div className={`sb-role-pill ${isSuperAdmin ? "super" : "admin"}`}>
            {isSuperAdmin ? <Crown size={11} /> : <Shield size={11} />}
            {isSuperAdmin ? "Super Admin" : isAdmin ? "Admin" : "User"}
          </div>
        </div>

        <nav className="sb-nav">
          {NAV_GROUPS.map((group) => {
            if (group.adminOnly && !isAdmin) return null;
            return (
              <div key={group.label} className="sb-group">
                <p className="sb-group-label">{group.label}</p>
                {group.items.map(({ to, icon: Icon, label }) => (
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
            );
          })}
        </nav>

        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">{currentUser?.avatar}</div>
            <div className="sb-user-info">
              <p className="sb-uname">{currentUser?.name}</p>
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
