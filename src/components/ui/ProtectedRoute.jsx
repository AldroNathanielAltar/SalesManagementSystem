import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { currentUser, authLoading } = useAuth();

if (authLoading) return null;

  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.record_status === "INACTIVE")
    return <Navigate to="/login?error=not_activated" replace />;

  return children;
}
