import { ShieldCheck, Construction } from "lucide-react";

function PlaceholderPage({ icon: Icon, title, description }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: 16,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: "var(--accent-dim)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--accent)",
        }}
      >
        <Icon size={28} />
      </div>
      <h2
        style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "var(--text-muted)",
          maxWidth: 360,
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          background: "var(--amber-dim)",
          borderRadius: 8,
          border: "1px solid rgba(217,119,6,.2)",
        }}
      >
        <Construction size={14} style={{ color: "var(--amber)" }} />
        <span style={{ fontSize: 12, color: "var(--amber)", fontWeight: 600 }}>
          Coming in Sprint 3
        </span>
      </div>
    </div>
  );
}

export function AdminPage() {
  return (
    <PlaceholderPage
      icon={ShieldCheck}
      title="Admin Panel"
      description="User management: activate/deactivate users. SUPERADMIN rows are fully protected. Wired to Supabase in Sprint 3."
    />
  );
}
