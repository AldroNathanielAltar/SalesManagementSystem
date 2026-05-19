// Topbar.jsx - Header component that appears at the top of every page
// Displays page title, menu button for mobile, and notification bell with dropdown
// Also renders toast popup notifications that auto-dismiss after 5 seconds

import { useState } from "react";
import { Bell, Menu, Check } from "lucide-react";
import { useApp } from "../../context/AppContext";
import Toast from "../ui/Toast";
import "./Topbar.css";

/**
 * Topbar Component - Main header bar
 * @param {Object} props - Component props
 * @param {Function} props.onMenuClick - Callback to open sidebar menu (mobile)
 * @param {string} props.title - Current page title to display
 */
export default function Topbar({ onMenuClick, title }) {
  // State to control notification dropdown visibility
  const [showNotifs, setShowNotifs] = useState(false);

  // Get notification-related data and functions from AppContext
  const { notifications, markRead, markAllRead, toast, closeToast } = useApp();

  // Calculate number of unread notifications for badge display
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="topbar">
      {/* 
        Toast Popup - Appears as a floating notification at top right
        Shows success/error/warning/info messages
        Auto-dismisses after 5 seconds or can be manually closed
      */}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={closeToast} />
      )}

      {/* Left side of topbar - Menu button and page title */}
      <div className="tb-left">
        {/* Hamburger menu button - visible on mobile, opens sidebar */}
        <button className="tb-menu-btn" onClick={onMenuClick}>
          <Menu size={19} />
        </button>
        {/* Current page title (e.g., "Sales Transactions", "Customer Lookup") */}
        <h1 className="tb-title">{title}</h1>
      </div>

      {/* Right side of topbar - Notification bell */}
      <div className="tb-right">
        {/* Notifications bell container with relative positioning for dropdown */}
        <div className="tb-rel">
          {/* 
            Notification Bell Button
            Click toggles the notification dropdown panel
          */}
          <button
            className="tb-icon-btn"
            onClick={() => setShowNotifs((v) => !v)}
          >
            <Bell size={17} />
            {/* 
              Badge showing number of unread notifications
              Only appears when there are unread notifications
            */}
            {unread > 0 && <span className="notif-badge">{unread}</span>}
          </button>

          {/* 
            Notification Dropdown Panel
            Shown when showNotifs is true
            Contains list of all notifications
          */}
          {showNotifs && (
            <div className="tb-dropdown notif-panel">
              {/* Header with title and "Mark all read" button */}
              <div className="notif-head">
                <span>Notifications</span>
                {/* Only show "All read" button if there are unread notifications */}
                {unread > 0 && (
                  <button className="notif-mark-all" onClick={markAllRead}>
                    <Check size={11} /> All read
                  </button>
                )}
              </div>

              {/* Empty state - when no notifications exist */}
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

              {/* List of all notifications */}
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notif-item ${!n.read ? "unread" : ""}`}
                  onClick={() => {
                    // Mark individual notification as read when clicked
                    markRead(n.id);
                    // Close dropdown after clicking
                    setShowNotifs(false);
                  }}
                >
                  {/* Dot indicator - shows unread status */}
                  <div className="notif-dot" />
                  <div>
                    {/* Notification message text */}
                    <p className="notif-text">{n.text}</p>
                    {/* Timestamp of when notification was created */}
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
