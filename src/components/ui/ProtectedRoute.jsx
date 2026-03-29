import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Wraps a route so only authenticated users can access it.
 * If not authenticated, redirects to /login.
 * If authenticated but INACTIVE (blocked), redirects to /login?error=not_activated.
 *
 * TODO: replace `isAuthenticated` stub with real Supabase session check:
 *   const { data: { session } } = await supabase.auth.getSession()
 */
export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  // Stub: treat having a currentUser as authenticated (replace with Supabase session)
  const isAuthenticated = !!currentUser;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Login guard: block INACTIVE users
  if (currentUser?.status === "INACTIVE") {
    return <Navigate to="/login?error=not_activated" replace />;
  }

  return children;
}
