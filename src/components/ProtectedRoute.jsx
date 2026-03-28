import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ allowedRoles }) {
  const { currentUser, authLoading } = useAuth()
  const location = useLocation()

  if (authLoading) return null

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.user_type)) {
    return <Navigate to="/sales" replace />
  }

  return <Outlet />
}
