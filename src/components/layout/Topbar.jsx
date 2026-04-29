import { useState } from 'react';
import { Bell, Menu, Check, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import './Topbar.css';

export default function Topbar({ onMenuClick, title }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSwitch, setShowSwitch]  = useState(false);
  const { notifications, markRead, markAllRead } = useApp();
  const { currentUser, users, switchSession, isSuperAdmin } = useAuth();
  const unread = notifications.filter(n => !n.read).length;

  // Only active users can be switched to (demo only)
  const switchableUsers = users.filter(u => u.status === 'Active');

  return (
    <header className="topbar">
      <div className="tb-left">
        <button className="tb-menu-btn" onClick={onMenuClick}><Menu size={19} /></button>
        <h1 className="tb-title">{title}</h1>
      </div>

      <div className="tb-right">

        {/* Demo: switch logged-in user */}
        <div className="tb-rel">
          <button className="btn btn-secondary btn-sm tb-switch-btn" onClick={() => setShowSwitch(v => !v)}>
            <RefreshCw size={13} /> Switch Role
          </button>
          {showSwitch && (
            <div className="tb-dropdown tb-switch-panel">
              <p className="tb-dd-label">Demo: Switch Session</p>
              {switchableUsers.map(u => (
                <button
                  key={u.id}
                  className={`tb-switch-item ${u.id === currentUser?.id ? 'current' : ''}`}
                  onClick={() => { switchSession(u.id); setShowSwitch(false); }}
                >
                  <span className="tb-sw-avatar">{u.avatar}</span>
                  <span>
                    <span className="tb-sw-name">{u.name}</span>
                    <span className={`tb-sw-role ${u.role}`}>{u.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
                  </span>
                  {u.id === currentUser?.id && <span className="tb-sw-current">●</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="tb-rel">
          <button className="tb-icon-btn" onClick={() => setShowNotifs(v => !v)}>
            <Bell size={17} />
            {unread > 0 && <span className="notif-badge">{unread}</span>}
          </button>
          {showNotifs && (
            <div className="tb-dropdown notif-panel">
              <div className="notif-head">
                <span>Notifications</span>
                {unread > 0 && <button className="notif-mark-all" onClick={markAllRead}><Check size={11} /> All read</button>}
              </div>
              {notifications.map(n => (
                <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`} onClick={() => markRead(n.id)}>
                  <div className="notif-dot" />
                  <div>
                    <p className="notif-text">{n.text}</p>
                    <p className="notif-time">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="tb-avatar">{currentUser?.avatar}</div>
      </div>
    </header>
  );
}
