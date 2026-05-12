import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { currentUser, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f2f5",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #e2e6ed",
              borderTopColor: "#2563eb",
              borderRadius: "50%",
              animation: "spin .8s linear infinite",
            }}
          />
          <p
            style={{ color: "#6b7280", fontSize: 14, fontFamily: "sans-serif" }}
          >
            Verifying session…
          </p>
        </div>
        <style>{`
          @keyframes spin { from { transform:rotate(0) } to { transform:rotate(360deg) } }
        `}</style>
      </div>
    );
  }

  // No user → go to login
  if (!currentUser) return <Navigate to="/login" replace />;

  // Inactive user
  if (currentUser.record_status === "INACTIVE") {
    return <Navigate to="/login?error=not_activated" replace />;
  }

  return children;
}
