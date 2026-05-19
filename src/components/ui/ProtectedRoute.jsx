import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Route guard component that restricts access to authenticated users only
export default function ProtectedRoute({ children }) {
  const { currentUser, authLoading, authError } = useAuth();

  // Show loading spinner while authentication state is being determined
  // Show spinner only on first load — not on tab switch
  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f2f5",
          gap: 16,
        }}
      >
        {/* Spinner animation element */}
        <div
          style={{
            width: 36,
            height: 36,
            border: "3px solid #e2e6ed",
            borderTopColor: "#2563eb",
            borderRadius: "50%",
            animation: "spin .8s linear infinite",
          }}
        />
        <p
          style={{
            color: "#6b7280",
            fontSize: 13,
            fontFamily: "sans-serif",
            margin: 0,
          }}
        >
          Loading…
        </p>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // Handle inactive account error by redirecting with error parameter
  if (authError === "INACTIVE") {
    return <Navigate to="/login?error=not_activated" replace />;
  }

  // Redirect to login if no user is authenticated
  if (!currentUser) return <Navigate to="/login" replace />;

  // Redirect to login with error if user account is inactive
  if (currentUser.record_status === "INACTIVE") {
    return <Navigate to="/login?error=not_activated" replace />;
  }

  // User is authenticated and active, render protected content
  return children;
}
