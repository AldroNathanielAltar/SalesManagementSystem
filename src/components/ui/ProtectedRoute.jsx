import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { currentUser, authLoading, authError } = useAuth();

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

  // Inactive account error
  if (authError === "INACTIVE") {
    return <Navigate to="/login?error=not_activated" replace />;
  }

  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.record_status === "INACTIVE") {
    return <Navigate to="/login?error=not_activated" replace />;
  }

  return children;
}