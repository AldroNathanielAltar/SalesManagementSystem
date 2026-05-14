import { useState } from "react";
import { Bell, Menu, Check } from "lucide-react";
import { useApp } from "../../context/AppContext";
import "./Topbar.css";

export default function Topbar({ onMenuClick, title }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const { notifications, markRead, markAllRead } = useApp();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="topbar">
      <div className="tb-left">
        <button className="tb-menu-btn" onClick={onMenuClick}>
          <Menu size={19} />
        </button>
        <h1 className="tb-title">{title}</h1>
      </div>

      <div className="tb-right">
        {/* Notifications bell only — avatar removed */}
        <div className="tb-rel">
          <button
            className="tb-icon-btn"
            onClick={() => setShowNotifs((v) => !v)}
          >
            <Bell size={17} />
            {unread > 0 && <span className="notif-badge">{unread}</span>}
          </button>
          {showNotifs && (
            <div className="tb-dropdown notif-panel">
              <div className="notif-head">
                <span>Notifications</span>
                {unread > 0 && (
                  <button className="notif-mark-all" onClick={markAllRead}>
                    <Check size={11} /> All read
                  </button>
                )}
              </div>
              {notifications.length === 0 && (
                <p
                  style={{
                    padding: "16px",
                    textAlign: "center",
                    fontSize: 13,
                    color: "var(--text-muted)",
                  }}
                >
                  No notifications
                </p>
              )}
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notif-item ${!n.read ? "unread" : ""}`}
                  onClick={() => {
                    markRead(n.id);
                    setShowNotifs(false);
                  }}
                >
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
      </div>
    </header>
  );
}
