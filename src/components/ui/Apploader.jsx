import { Loader2 } from "lucide-react";

export default function AppLoader({
  message = "Loading Sales Management System...",
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "16px",
        background:
          "linear-gradient(135deg, #0f0c29 0%, #1a0533 40%, #0d1b3e 100%)",
        color: "white",
      }}
    >
      <Loader2 size={48} style={{ animation: "spin 1s linear infinite" }} />
      <p style={{ fontSize: "16px", fontWeight: 500 }}>{message}</p>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
