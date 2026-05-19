/**
 * UserManagementPage.jsx — Sprint 3
 * - Activate / Deactivate user
 * - Promote user to ADMIN or SUPERADMIN (SUPERADMIN only for promoting to SUPERADMIN)
 * - SUPERADMIN rows are read-only with tooltip
 * - Automatically handles user_module foreign key constraints
 * - Uses PermissionsContext for access control
 * - Includes notifications for all user actions
 */
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Crown,
  Shield,
  User,
  CheckCircle,
  XCircle,
  Lock,
  Loader2,
  RefreshCw,
  ArrowUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionsContext";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabaseClient";
import Toast from "../components/ui/Toast";
import ConfirmModal from "../components/ui/ConfirmModal";
import "./UserManagementPage.css";

const TYPE_BADGE = {
  SUPERADMIN: { cls: "badge-amber", icon: Crown, label: "Super Admin" },
  ADMIN: { cls: "badge-blue", icon: Shield, label: "Admin" },
  USER: { cls: "badge-gray", icon: User, label: "User" },
};
const STATUS_BADGE = { ACTIVE: "badge-green", INACTIVE: "badge-red" };

export default function UserManagementPage() {
  const { currentUser } = useAuth();
  const { hasPermission, isSuperAdmin, isAdmin } = usePermissions();
  const { addNotification } = useApp();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  const canManageUsers = hasPermission("ADM_USER") || isSuperAdmin();

  const fetchUsers = useCallback(
    async (quiet = false) => {
      quiet ? setRefreshing(true) : setLoading(true);
      const { data, error } = await supabase
        .from("user")
        .select("userid, username, user_type, record_status")
        .order("user_type")
        .order("username");
      if (error) {
        // Use addNotification instead of showToast for errors
        addNotification(`Failed to load users: ${error.message}`, "error");
      } else {
        setUsers(data || []);
      }
      quiet ? setRefreshing(false) : setLoading(false);
    },
    [addNotification],
  );

  useEffect(() => {
    if (canManageUsers) fetchUsers();
  }, [fetchUsers, canManageUsers]);

  // Helper function to delete user_module records for a user
  const deleteUserModuleRecords = async (userId) => {
    const { error } = await supabase
      .from("user_module")
      .delete()
      .eq("userid", userId);

    if (error && !error.message.includes("does not exist")) {
      console.warn("Error deleting user_module:", error);
    }
    return true;
  };

  /* ── Confirm actions with foreign key handling ── */
  async function handleConfirm() {
    if (!confirm) return;
    const { action, user } = confirm;
    setActionLoading(true);
    try {
      let updateData = {};
      let notificationMessage = "";
      let successMessage = "";

      if (action === "activate") {
        updateData = { record_status: "ACTIVE" };
        notificationMessage = `✅ User ${user.username} was activated`;
        successMessage = `${user.username} has been activated.`;
      }

      if (action === "deactivate") {
        await deleteUserModuleRecords(user.userid);
        updateData = { record_status: "INACTIVE" };
        notificationMessage = `⛔ User ${user.username} was deactivated`;
        successMessage = `${user.username} has been deactivated and their permissions have been removed.`;
      }

      if (action === "promote-admin") {
        updateData = { user_type: "ADMIN" };
        notificationMessage = `👑 User ${user.username} was promoted to Admin`;
        successMessage = `${user.username} promoted to Admin. They must log out and back in for changes to take effect.`;
      }

      if (action === "promote-superadmin") {
        updateData = { user_type: "SUPERADMIN" };
        notificationMessage = `👑 User ${user.username} was promoted to Super Admin`;
        successMessage = `${user.username} promoted to Super Admin. They must log out and back in for changes to take effect.`;
      }

      if (action === "demote-user") {
        updateData = { user_type: "USER" };
        notificationMessage = `⬇️ User ${user.username} was demoted to User`;
        successMessage = `${user.username} demoted to User. They must log out and back in for changes to take effect.`;
      }

      const { error } = await supabase
        .from("user")
        .update(updateData)
        .eq("userid", user.userid)
        .neq("user_type", "SUPERADMIN");

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) =>
          u.userid === user.userid ? { ...u, ...updateData } : u,
        ),
      );

      // Only ONE notification - addNotification handles both bell icon AND toast popup
      addNotification(notificationMessage, "success");

      // Removed the duplicate showToast call
    } catch (err) {
      addNotification(err.message || "Action failed.", "error");
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  }

  /* ── Filtering ── */
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      u.username?.toLowerCase().includes(q) ||
      u.userid?.toLowerCase().includes(q);
    const matchType = typeFilter === "All" || u.user_type === typeFilter;
    const matchStatus =
      statusFilter === "All" || u.record_status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const total = users.length;
  const active = users.filter((u) => u.record_status === "ACTIVE").length;
  const inactive = users.filter((u) => u.record_status === "INACTIVE").length;
  const supers = users.filter((u) => u.user_type === "SUPERADMIN").length;

  function canAct(target) {
    if (!target) return false;
    if (target.userid === currentUser?.userid) return false;
    if (target.user_type === "SUPERADMIN") return false;
    return canManageUsers;
  }

  /* ── Confirm modal config per action ── */
  const CONFIRM_CONFIG = {
    activate: {
      title: "Activate User",
      confirmLabel: "Activate",
      confirmClass: "btn-primary",
    },
    deactivate: {
      title: "Deactivate User",
      confirmLabel: "Deactivate",
      confirmClass: "btn-danger",
    },
    "promote-admin": {
      title: "Promote to Admin",
      confirmLabel: "Promote to Admin",
      confirmClass: "btn-primary",
    },
    "promote-superadmin": {
      title: "Promote to Super Admin",
      confirmLabel: "Promote to Super Admin",
      confirmClass: "btn-warning",
    },
    "demote-user": {
      title: "Demote to User",
      confirmLabel: "Demote to User",
      confirmClass: "btn-danger",
    },
  };

  function confirmMsg(action, username) {
    const msgs = {
      activate: `Activate "${username}"? They will regain access to the system.`,
      deactivate: `Deactivate "${username}"? They will lose system access immediately. All their module permissions will be removed.`,
      "promote-admin": `Promote "${username}" to Admin? They will gain admin privileges.`,
      "promote-superadmin": `⚠️ Promote "${username}" to Super Admin? This gives them full unrestricted access. This action cannot be undone via the app.`,
      "demote-user": `Demote "${username}" to User? They will lose admin privileges.`,
    };
    return msgs[action] || "Confirm this action?";
  }

  /* ── Access guard ── */
  if (!canManageUsers) {
    return (
      <div className="um-blocked">
        <Lock size={40} />
        <h3>Access Restricted</h3>
        <p>You need administrator privileges to access User Management.</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Toast is now handled by Topbar, so remove it from here to avoid duplicates */}
      {/* Removed the standalone Toast component since it's already in Topbar */}

      {/* Summary */}
      <div className="um-summary">
        <div className="um-sum-card">
          <p className="um-sv">{loading ? "…" : total}</p>
          <p className="um-sl">Total Users</p>
        </div>
        <div className="um-sum-card ok">
          <p className="um-sv">{loading ? "…" : active}</p>
          <p className="um-sl">Active</p>
        </div>
        <div className="um-sum-card warn">
          <p className="um-sv">{loading ? "…" : inactive}</p>
          <p className="um-sl">Inactive</p>
        </div>
        <div className="um-sum-card super">
          <p className="um-sv">{loading ? "…" : supers}</p>
          <p className="um-sl">Super Admins</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="page-header">
        <div>
          <h2 className="page-title">User Management</h2>
          <p className="page-subtitle">
            {loading ? "Loading…" : `${filtered.length} of ${total} users`}
          </p>
        </div>
        <div className="page-actions">
          <div className="search-wrap">
            <Search size={14} className="search-icon" />
            <input
              className="search-input"
              placeholder="Search username…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-input"
            style={{ width: "auto" }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="SUPERADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>
          <select
            className="form-input"
            style={{ width: "auto" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <button
            className="btn btn-secondary"
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={14}
              style={
                refreshing ? { animation: "spin .7s linear infinite" } : {}
              }
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="um-skeleton-wrap">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="um-skeleton-row">
              <div className="um-skel um-skel-avatar" />
              <div className="um-skel um-skel-text" style={{ width: "18%" }} />
              <div className="um-skel um-skel-text" style={{ width: "12%" }} />
              <div className="um-skel um-skel-badge" />
              <div className="um-skel um-skel-btn" />
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="table-wrap">
          <table className="um-table">
            <thead>
              <tr>
                <th>User</th>
                <th>User ID</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const tb = TYPE_BADGE[u.user_type] || TYPE_BADGE.USER;
                const TypeIcon = tb.icon;
                const isProtected = u.user_type === "SUPERADMIN";
                const isSelf = u.userid === currentUser?.userid;
                const actable = canAct(u);

                return (
                  <tr
                    key={u.userid}
                    className={isProtected ? "um-row-protected" : ""}
                    onMouseEnter={() => isProtected && setTooltip(u.userid)}
                    onMouseLeave={() => setTooltip(null)}
                    style={{ position: "relative" }}
                  >
                    {tooltip === u.userid && (
                      <div className="um-tooltip">
                        🔒 SUPERADMIN accounts cannot be modified
                      </div>
                    )}
                    <td className="um-user-cell">
                      <div
                        className={`um-avatar um-avatar-${u.user_type?.toLowerCase()}`}
                      >
                        {(u.username || "U").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span
                          style={{
                            fontWeight: 600,
                            color: "var(--text-primary)",
                          }}
                        >
                          {u.username || "—"}
                        </span>
                        {isSelf && <span className="um-you-badge">You</span>}
                        {isProtected && (
                          <Lock
                            size={11}
                            style={{ color: "var(--amber)", marginLeft: 6 }}
                          />
                        )}
                      </div>
                    </td>
                    <td className="um-id-cell">{u.userid?.slice(0, 8)}…</td>
                    <td>
                      <span className={`badge ${tb.cls}`}>
                        <TypeIcon size={10} /> {tb.label}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${STATUS_BADGE[u.record_status] || "badge-gray"}`}
                      >
                        {u.record_status === "ACTIVE" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {isProtected || isSelf ? (
                        <span className="um-protected-label">
                          {isProtected ? "🔒 Protected" : "— (You)"}
                        </span>
                      ) : (
                        <div className="um-action-buttons">
                          {u.record_status === "INACTIVE" && actable && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() =>
                                setConfirm({ action: "activate", user: u })
                              }
                            >
                              <CheckCircle size={13} /> Activate
                            </button>
                          )}
                          {u.record_status === "ACTIVE" && actable && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() =>
                                setConfirm({ action: "deactivate", user: u })
                              }
                            >
                              <XCircle size={13} /> Deactivate
                            </button>
                          )}
                          {actable && u.user_type === "USER" && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() =>
                                setConfirm({ action: "promote-admin", user: u })
                              }
                              title="Promote to Admin"
                            >
                              <ArrowUp size={13} /> Make Admin
                            </button>
                          )}
                          {actable &&
                            isSuperAdmin() &&
                            u.user_type === "USER" && (
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() =>
                                  setConfirm({
                                    action: "promote-superadmin",
                                    user: u,
                                  })
                                }
                                title="Promote to Super Admin"
                              >
                                <Crown size={13} /> Make Super Admin
                              </button>
                            )}
                          {actable &&
                            isSuperAdmin() &&
                            u.user_type === "ADMIN" && (
                              <>
                                <button
                                  className="btn btn-warning btn-sm"
                                  onClick={() =>
                                    setConfirm({
                                      action: "promote-superadmin",
                                      user: u,
                                    })
                                  }
                                  title="Promote to Super Admin"
                                >
                                  <Crown size={13} /> Make Super Admin
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() =>
                                    setConfirm({
                                      action: "demote-user",
                                      user: u,
                                    })
                                  }
                                  title="Demote to User"
                                >
                                  <User size={13} /> Make User
                                </button>
                              </>
                            )}
                          {actable &&
                            isAdmin() &&
                            !isSuperAdmin() &&
                            u.user_type === "ADMIN" && (
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() =>
                                  setConfirm({ action: "demote-user", user: u })
                                }
                                title="Demote to User"
                              >
                                <User size={13} /> Make User
                              </button>
                            )}
                          {!actable && (
                            <span className="um-protected-label">
                              No permission
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="um-empty">
                    <User size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                    <p>No users found.</p>
                    {search && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ marginTop: 8 }}
                        onClick={() => setSearch("")}
                      >
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm modal */}
      {confirm && (
        <ConfirmModal
          title={
            actionLoading
              ? "Processing…"
              : CONFIRM_CONFIG[confirm.action]?.title || "Confirm"
          }
          message={confirmMsg(confirm.action, confirm.user.username)}
          confirmLabel={
            actionLoading
              ? "Processing…"
              : CONFIRM_CONFIG[confirm.action]?.confirmLabel || "Confirm"
          }
          confirmClass={
            CONFIRM_CONFIG[confirm.action]?.confirmClass || "btn-primary"
          }
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
