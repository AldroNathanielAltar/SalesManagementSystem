import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// ── Sidebar nav groups (as per spec) ────────────────
const NAV_GROUPS = [
  {
    group: 'Sales',
    items: [
      {
        label: 'Transactions',
        path: '/transactions',
        icon: (
          <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <line x1="9" y1="12" x2="15" y2="12"/>
            <line x1="9" y1="16" x2="13" y2="16"/>
          </svg>
        ),
      },
    ],
  },
  {
    group: 'Lookups',
    items: [
      {
        label: 'Customers',
        path: '/customers',
        icon: (
          <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        ),
      },
      {
        label: 'Employees',
        path: '/employees',
        icon: (
          <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <circle cx="12" cy="10" r="3"/>
            <path d="M6 20c0-3.31 2.69-6 6-6s6 2.69 6 6"/>
          </svg>
        ),
      },
      {
        label: 'Products',
        path: '/products',
        icon: (
          <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        ),
      },
      {
        label: 'Prices',
        path: '/prices',
        icon: (
          <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        ),
      },
    ],
  },
  {
    group: null, // ungrouped items
    items: [
      {
        label: 'Reports',
        path: '/reports',
        icon: (
          <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6"  y1="20" x2="6"  y2="14"/>
          </svg>
        ),
      },
      {
        label: 'Admin',
        path: '/admin',
        icon: (
          <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        ),
      },
      {
        label: 'Deleted Items',
        path: '/deleted-items',
        icon: (
          <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        ),
      },
    ],
  },
]

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate          = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── SIDEBAR ─────────────────────────── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gray-900 flex flex-col z-30
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">Hope, Inc.</div>
            <div className="text-gray-400 text-xs">SMS</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {/* Dashboard (always first, no group) */}
          <NavLink
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all
              ${isActive
                ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
            }
          >
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Dashboard
          </NavLink>

          {/* Grouped items */}
          {NAV_GROUPS.map((g, gi) => (
            <div key={gi} className="mb-2">
              {g.group && (
                <div className="px-3 pt-3 pb-1.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {g.group}
                  </span>
                </div>
              )}
              {g.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-all
                    ${isActive
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User card at bottom of sidebar */}
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-800">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.avatar || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate">{user?.name || 'User'}</div>
              <div className="text-gray-400 text-xs truncate">{user?.role || 'Member'}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN AREA ────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── NAVBAR ──────────────────────────── */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 lg:px-6 h-14 flex items-center justify-between shadow-sm">
          {/* Left: hamburger + page title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6"  x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <span className="text-sm font-semibold text-gray-700 hidden sm:block">
              Hope, Inc. — Sales Management System
            </span>
          </div>

          {/* Right: logged-in user + logout */}
          <div className="flex items-center gap-3 relative">
            {/* User display */}
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.avatar || 'U'}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user?.name || 'User'}
              </span>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)}/>
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Logout
                  </button>
                </div>
              </>
            )}

            {/* Direct logout button (always visible) */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 border border-red-100 transition-all"
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </header>

        {/* ── PAGE CONTENT ─────────────────────── */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
