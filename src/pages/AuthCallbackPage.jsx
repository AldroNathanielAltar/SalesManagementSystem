// src/pages/AuthCallbackPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleGoogleCallback } from "../services/authService";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Handle Google OAuth callback
        await handleGoogleCallback();
        // Redirect to sales page on success
        navigate("/sales", { replace: true });
      } catch (err) {
        console.error("Auth callback error:", err);
        setError(err.message);
        // Redirect to login with error after 3 seconds
        setTimeout(() => {
          navigate("/login?error=not_activated", { replace: true });
        }, 3000);
      }
    };

    processCallback();
  }, [navigate]);

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0f0c29 0%, #1a0533 40%, #0d1b3e 100%)",
          color: "white",
          textAlign: "center",
          padding: 20,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: "3px solid rgba(255,255,255,0.2)",
            borderTop: "3px solid #ef4444",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <h3>Authentication Error</h3>
        <p>{error}</p>
        <p>Redirecting to login page...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f0c29 0%, #1a0533 40%, #0d1b3e 100%)",
        color: "white",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <Loader2 size={48} style={{ animation: "spin 0.8s linear infinite" }} />
        <p style={{ marginTop: 16 }}>Completing sign in...</p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
