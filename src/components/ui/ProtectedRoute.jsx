// src/components/ui/ProtectedRoute.jsx
// PR-03: feat/rights-stamp-sidebar
// M4 – Rights & Auth Specialist | Sprint 2
//
// Changes:
// - Added /deleted-items route guard — USER accounts redirected to /sales
// - Uses record_status (not status) for login guard — matches AuthContext

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { currentUser, authLoading } = useAuth();
  const location = useLocation();

  // Wait for auth to resolve before making any redirect decisions
  if (authLoading) return null;

  // Not logged in — redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Login guard — block INACTIVE users
  if (currentUser?.record_status === "INACTIVE") {
    return <Navigate to="/login?error=not_activated" replace />;
  }

  // Route guard — /deleted-items blocked for USER accounts
  const isUser = currentUser?.user_type === "USER";
  if (isUser && location.pathname === "/deleted-items") {
    return <Navigate to="/sales" replace />;
  }

  return children;
}
