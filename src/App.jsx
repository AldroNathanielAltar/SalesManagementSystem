import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage            from './pages/LoginPage'
import RegisterPage         from './pages/RegisterPage'
import AuthCallbackPage     from './pages/AuthCallbackPage'
import SalesPage            from './pages/SalesPage'
import SalesDetailPage      from './pages/SalesDetailPage'
import LookupCustomersPage  from './pages/LookupCustomersPage'
import LookupEmployeesPage  from './pages/LookupEmployeesPage'
import LookupProductsPage   from './pages/LookupProductsPage'
import LookupPricesPage     from './pages/LookupPricesPage'
import ReportsPage          from './pages/ReportsPage'
import AdminPage            from './pages/AdminPage'
import DeletedItemsPage     from './pages/DeletedItemsPage'

function AppRoutes() {
  const { authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/login"         element={<LoginPage />} />
      <Route path="/register"      element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Protected — any authenticated ACTIVE user */}
      <Route element={<ProtectedRoute />}>
        <Route path="/sales"             element={<SalesPage />} />
        <Route path="/sales/:transNo"    element={<SalesDetailPage />} />
        <Route path="/lookups/customers" element={<LookupCustomersPage />} />
        <Route path="/lookups/employees" element={<LookupEmployeesPage />} />
        <Route path="/lookups/products"  element={<LookupProductsPage />} />
        <Route path="/lookups/prices"    element={<LookupPricesPage />} />
        <Route path="/reports"           element={<ReportsPage />} />
      </Route>

      {/* Admin / SUPERADMIN only */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN','SUPERADMIN']} />}>
        <Route path="/admin"         element={<AdminPage />} />
        <Route path="/deleted-items" element={<DeletedItemsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="/"  element={<Navigate to="/sales" replace />} />
      <Route path="*"  element={<Navigate to="/sales" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}