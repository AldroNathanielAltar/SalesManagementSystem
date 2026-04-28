import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser, authLoading } = useAuth()
  const location = useLocation()

  if (authLoading) return null

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.user_type)) {
    return <Navigate to="/dashboard" replace />
  }

  // Supports both children prop (your M2 style) and Outlet (nested routes)
  return children ? children : <Outlet />
}