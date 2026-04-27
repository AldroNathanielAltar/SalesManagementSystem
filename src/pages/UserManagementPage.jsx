/**
 * PR-01: feat/ui-admin-users
 * UserManagementPage — Sprint 3 M2
 *
 * Sprint doc requirements:
 * - Table: userid, username, user_type, record_status
 * - Activate / Deactivate buttons per row
 * - SUPERADMIN rows fully disabled + greyed out
 * - Tooltip on hover: "SUPERADMIN accounts cannot be modified"
 * - ADM_USER right gates sidebar link (handled in Sidebar.jsx)
 */
import { useState, useEffect } from 'react';
import {
  Search, Crown, Shield, User, CheckCircle,
  XCircle, Lock, AlertTriangle, Loader2, RefreshCw,
} from 'lucide-react';
import { useAuth }   from '../context/AuthContext';
import { useRights } from '../context/RightsContext';
import { supabase }  from '../lib/supabaseClient';
import './UserManagementPage.css';
import ConfirmModal  from '../components/ui/ConfirmModal';


/* ── Badge helpers ── */
const TYPE_BADGE = {
  SUPERADMIN: { cls: 'badge-amber', icon: Crown,  label: 'Super Admin' },
  ADMIN:      { cls: 'badge-blue',  icon: Shield, label: 'Admin'       },
  USER:       { cls: 'badge-gray',  icon: User,   label: 'User'        },
};
const STATUS_BADGE = {
  ACTIVE:   'badge-green',
  INACTIVE: 'badge-red',
};

export default function UserManagementPage() {
  const { currentUser } = useAuth();
  // Derive role flags from user_type — matches your AuthContext shape
  const userType     = currentUser?.user_type || 'USER';
  const isSuperAdmin = userType === 'SUPERADMIN';
  const isAdmin      = userType === 'ADMIN' || isSuperAdmin;
  const { can } = useRights();

  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [search,       setSearch]       = useState('');
  const [typeFilter,   setTypeFilter]   = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [confirm,      setConfirm]      = useState(null); // { action, user }
  const [actionLoading,setActionLoading]= useState(false);
  const [toast,        setToast]        = useState(null); // { msg, type }
  const [tooltip,      setTooltip]      = useState(null); // userid of hovered protected row

  useEffect(() => {
    if (can('ADM_USER') || isAdmin) fetchUsers();
  }, [can, isAdmin]);

  async function fetchUsers(quiet = false) {
    quiet ? setRefreshing(true) : setLoading(true);
    const { data, error } = await supabase
      .from('user')
      .select('userid, username, user_type, record_status')
      .order('user_type')
      .order('username');
    if (error) {
      showToast('Failed to load users: ' + error.message, 'error');
    } else {
      setUsers(data || []);
    }
    quiet ? setRefreshing(false) : setLoading(false);
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  /* ── Access guard (rendered after hooks) ── */
  if (!can('ADM_USER') && !isAdmin) {
    return (
      <div className="um-blocked">
        <Lock size={40} />
        <h3>Access Restricted</h3>
        <p>You need the ADM_USER right to access User Management.</p>
      </div>
    );
  }

  /* ── Activate / Deactivate ── */
  async function handleAction() {
    if (!confirm) return;
    const { action, user } = confirm;
    setActionLoading(true);
    try {
      const newStatus = action === 'activate' ? 'ACTIVE' : 'INACTIVE';
      const { error } = await supabase
        .from('user')
        .update({ record_status: newStatus })
        .eq('userId', user.userId)
        .neq('user_type', 'SUPERADMIN'); // RLS guard at DB level too

      if (error) throw error;
      setUsers(prev => prev.map(u =>
        u.userid === user.userid ? { ...u, record_status: newStatus } : u
      ));
      showToast(
        `${user.username} has been ${action === 'activate' ? 'activated' : 'deactivated'}.`,
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Action failed.', 'error');
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  }

  /* ── Filtering ── */
  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      u.username?.toLowerCase().includes(q) ||
      u.userid?.toLowerCase().includes(q);
    const matchType   = typeFilter   === 'All' || u.user_type     === typeFilter;
    const matchStatus = statusFilter === 'All' || u.record_status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  /* ── Summary counts ── */
  const total    = users.length;
  const active   = users.filter(u => u.record_status === 'ACTIVE').length;
  const inactive = users.filter(u => u.record_status === 'INACTIVE').length;
  const supers   = users.filter(u => u.user_type === 'SUPERADMIN').length;

  /* ── Can current user act on target? ── */
  function canAct(target) {
    if (!target) return false;
    if (target.userId === (currentUser?.userId || currentUser?.id)) return false; // can't act on self
    if (target.user_type === 'SUPERADMIN') return false;     // superadmin protected
    return isAdmin;
  }

  return (
    <div className="fade-in">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Summary strip */}
      <div className="um-summary">
        <div className="um-sum-card">
          <p className="um-sv">{loading ? '…' : total}</p>
          <p className="um-sl">Total Users</p>
        </div>
        <div className="um-sum-card ok">
          <p className="um-sv">{loading ? '…' : active}</p>
          <p className="um-sl">Active</p>
        </div>
        <div className="um-sum-card warn">
          <p className="um-sv">{loading ? '…' : inactive}</p>
          <p className="um-sl">Inactive</p>
        </div>
        <div className="um-sum-card super">
          <p className="um-sv">{loading ? '…' : supers}</p>
          <p className="um-sl">Super Admins</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="page-header">
        <div>
          <h2 className="page-title">User Management</h2>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${filtered.length} of ${total} users`}
          </p>
        </div>
        <div className="page-actions">
          <div className="search-wrap">
            <Search size={14} className="search-icon" />
            <input className="search-input" placeholder="Search username…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input" style={{ width: 'auto' }}
            value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="All">All Roles</option>
            <option value="SUPERADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>
          <select className="form-input" style={{ width: 'auto' }}
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <button className="btn btn-secondary"
            onClick={() => fetchUsers(true)} disabled={refreshing}>
            <RefreshCw size={14} style={refreshing ? { animation: 'spin .7s linear infinite' } : {}} />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="um-skeleton-wrap">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="um-skeleton-row">
              <div className="um-skel um-skel-avatar" />
              <div className="um-skel um-skel-text" style={{ width: '18%' }} />
              <div className="um-skel um-skel-text" style={{ width: '12%' }} />
              <div className="um-skel um-skel-badge" />
              <div className="um-skel um-skel-btn" />
              <div className="um-skel um-skel-btn" />
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Username / ID</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const tb       = TYPE_BADGE[u.user_type] || TYPE_BADGE.USER;
                const TypeIcon = tb.icon;
                const isProtected = u.user_type === 'SUPERADMIN';
                const isSelf      = u.userid === currentUser?.userid;
                const actable     = canAct(u);

                return (
                  <tr
                    key={u.userid}
                    className={isProtected ? 'um-row-protected' : ''}
                    onMouseEnter={() => isProtected && setTooltip(u.userid)}
                    onMouseLeave={() => setTooltip(null)}
                    style={{ position: 'relative' }}
                  >
                    {/* Tooltip */}
                    {tooltip === u.userid && (
                      <td colSpan={0} style={{ padding: 0, border: 'none', position: 'static' }}>
                        <div className="um-tooltip">
                          🔒 SUPERADMIN accounts cannot be modified
                        </div>
                      </td>
                    )}

                    {/* Avatar */}
                    <td>
                      <div className="um-user-cell">
                        <div className={`um-avatar um-avatar-${u.user_type?.toLowerCase()}`}>
                          {(u.username || 'U').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {u.username || '—'}
                          </span>
                          {isSelf && <span className="um-you-badge">You</span>}
                          {isProtected && <Lock size={11} style={{ color: 'var(--amber)', marginLeft: 6 }} />}
                        </div>
                      </div>
                    </td>

                    {/* ID */}
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                      {u.userid?.slice(0, 8)}…
                    </td>

                    {/* Role */}
                    <td>
                      <span className={`badge ${tb.cls}`}>
                        <TypeIcon size={10} /> {tb.label}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`badge ${STATUS_BADGE[u.record_status] || 'badge-gray'}`}>
                        {u.record_status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      {isProtected || isSelf ? (
                        <span className="um-protected-label">
                          {isProtected ? '🔒 Protected' : '— (You)'}
                        </span>
                      ) : (
                        <div style={{ display: 'flex', gap: 7 }}>
                          {u.record_status === 'INACTIVE' && actable && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setConfirm({ action: 'activate', user: u })}
                            >
                              <CheckCircle size={13} /> Activate
                            </button>
                          )}
                          {u.record_status === 'ACTIVE' && actable && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setConfirm({ action: 'deactivate', user: u })}
                            >
                              <XCircle size={13} /> Deactivate
                            </button>
                          )}
                          {!actable && (
                            <span className="um-protected-label">No permission</span>
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
                    <User size={32} style={{ opacity: .3, marginBottom: 8 }} />
                    <p>No users found.</p>
                    {search && (
                      <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }}
                        onClick={() => setSearch('')}>
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
          title={confirm.action === 'activate' ? 'Activate User' : 'Deactivate User'}
          message={
            confirm.action === 'activate'
              ? `Activate "${confirm.user.username}"? They will regain access to the system.`
              : `Deactivate "${confirm.user.username}"? They will lose system access immediately.`
          }
          confirmLabel={actionLoading ? 'Processing…' : confirm.action === 'activate' ? 'Activate' : 'Deactivate'}
          confirmClass={confirm.action === 'activate' ? 'btn-primary' : 'btn-danger'}
          onConfirm={handleAction}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
