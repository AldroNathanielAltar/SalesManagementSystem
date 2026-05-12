import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { currentUser, authLoading } = useAuth();

if (authLoading) return (
  <div style={{ 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    background: 'var(--bg-base)'
  }}>
    <p style={{ color: 'var(--text-muted)', fontFamily: 'sans-serif' }}>Loading…</p>
  </div>
)

  if (!currentUser) return <Navigate to="/login" replace />;

  if (currentUser.record_status === "INACTIVE") {
    return <Navigate to="/login?error=not_activated" replace />;
  }

  return children;
}