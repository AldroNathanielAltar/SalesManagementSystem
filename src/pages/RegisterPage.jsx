import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerWithEmail, loginWithGoogle } from "../services/authService";

/* ─── All sub-components defined OUTSIDE to prevent focus-loss bug ─── */

function Field({
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  hint,
  svgIcon,
}) {
  return (
    <div style={s.fieldGroup}>
      <label style={s.label}>
        {label}
        {hint && <span style={s.hint}>{hint}</span>}
      </label>
      <div style={s.inputWrap}>
        <span style={s.inputIconSpan}>{svgIcon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={name}
          style={{
            ...s.input,
            paddingLeft: 38,
            borderColor: error
              ? "rgba(239,68,68,0.6)"
              : "rgba(255,255,255,0.1)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#7c3aed";
            e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.2)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error
              ? "rgba(239,68,68,0.6)"
              : "rgba(255,255,255,0.1)";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>
      {error && <p style={s.fieldErr}>{error}</p>}
    </div>
  );
}

function PwField({
  label,
  hint,
  name,
  value,
  onChange,
  error,
  showPw,
  onToggle,
}) {
  return (
    <div style={s.fieldGroup}>
      <label style={s.label}>
        {label}
        {hint && <span style={s.hint}>{hint}</span>}
      </label>
      <div style={s.inputWrap}>
        <span style={s.inputIconSpan}>
          <svg
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#64748b"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </span>
        <input
          type={showPw ? "text" : "password"}
          placeholder={
            name === "password"
              ? "Create a strong password"
              : "Repeat your password"
          }
          value={value}
          onChange={onChange}
          autoComplete="new-password"
          style={{
            ...s.input,
            paddingLeft: 38,
            paddingRight: onToggle ? 44 : 14,
            borderColor: error
              ? "rgba(239,68,68,0.6)"
              : "rgba(255,255,255,0.1)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#7c3aed";
            e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.2)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error
              ? "rgba(239,68,68,0.6)"
              : "rgba(255,255,255,0.1)";
            e.target.style.boxShadow = "none";
          }}
        />
        {onToggle && (
          <button type="button" onClick={onToggle} style={s.pwToggle}>
            {showPw ? (
              <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <p style={s.fieldErr}>{error}</p>}
    </div>
  );
}

/* ── Inline SVG icons ── */
const svgUser = (
  <svg
    width="14"
    height="14"
    fill="none"
    viewBox="0 0 24 24"
    stroke="#64748b"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const svgEmail = (
  <svg
    width="14"
    height="14"
    fill="none"
    viewBox="0 0 24 24"
    stroke="#64748b"
    strokeWidth="2"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const nav = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [success, setSuccess] = useState(false);

  function set(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((er) => ({ ...er, [field]: "" }));
      setServerError("");
    };
  }

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email is required.";
    if (form.password.length < 8)
      e.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match.";
    return e;
  }

  async function handleRegister(e) {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(form.email, form.password, {
        firstName: form.firstName,
        lastName: form.lastName,
        full_name: `${form.firstName} ${form.lastName}`,
      });
      setSuccess(true);
    } catch (err) {
      setServerError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setServerError("");
    try {
      await loginWithGoogle();
    } catch (err) {
      setServerError(err.message || "Google sign up failed.");
      setGoogleLoading(false);
    }
  }

  if (success) {
    return (
      <div style={s.page}>
        <div style={s.bgOrb1} />
        <div style={s.bgOrb2} />
        <div style={s.bgGrid} />
        <div
          style={{
            ...s.card,
            maxWidth: 420,
            padding: "40px 32px",
            textAlign: "center",
            position: "relative",
          }}
        >
          <div style={s.cardAccent} />
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(16,185,129,0.15)",
              border: "2px solid rgba(16,185,129,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <svg
              width="30"
              height="30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#10b981"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ ...s.cardTitle, marginBottom: 8 }}>Check your email</h2>
          <p
            style={{
              fontSize: 14,
              color: "#94a3b8",
              lineHeight: 1.6,
              marginBottom: 10,
            }}
          >
            We sent a confirmation link to{" "}
            <strong style={{ color: "#e2e8f0" }}>{form.email}</strong>.
          </p>
          <p
            style={{
              fontSize: 13,
              color: "#64748b",
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            New accounts are{" "}
            <strong style={{ color: "#fbbf24" }}>INACTIVE</strong> by default.
            An administrator must activate your account before you can log in.
          </p>
          <button style={s.submitBtn} onClick={() => nav("/login")}>
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.bgOrb1} />
      <div style={s.bgOrb2} />
      <div style={s.bgGrid} />
      <div style={s.wrapper}>
        <div style={s.brand}>
          <div style={s.brandIcon}>
            <svg
              width="26"
              height="26"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth="2.2"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h1 style={s.brandName}>Hope, Inc. SMS</h1>
          <p style={s.brandSub}>Sales Management System</p>
        </div>

        <div style={{ ...s.card, maxWidth: 520 }}>
          <div style={s.cardAccent} />
          <h2 style={s.cardTitle}>Create your account</h2>
          <p style={{ ...s.cardSub, marginBottom: 20 }}>
            Fill in the details below to get started
          </p>

          {serverError && (
            <div
              style={{
                ...s.alert,
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.35)",
                color: "#fca5a5",
                marginBottom: 16,
              }}
            >
              <svg
                width="15"
                height="15"
                style={{ flexShrink: 0, marginTop: 1 }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {serverError}
            </div>
          )}

          <form onSubmit={handleRegister} noValidate>
            <div style={s.row2}>
              <Field
                name="firstName"
                label="First Name *"
                placeholder="Juan"
                svgIcon={svgUser}
                value={form.firstName}
                onChange={set("firstName")}
                error={errors.firstName}
              />
              <Field
                name="lastName"
                label="Last Name *"
                placeholder="dela Cruz"
                svgIcon={svgUser}
                value={form.lastName}
                onChange={set("lastName")}
                error={errors.lastName}
              />
            </div>
            <Field
              name="email"
              label="Email Address *"
              placeholder="juan@hopeinc.com"
              svgIcon={svgEmail}
              value={form.email}
              onChange={set("email")}
              error={errors.email}
              type="email"
            />

            <PwField
              name="password"
              label="Password *"
              hint="(min. 8 characters)"
              value={form.password}
              onChange={set("password")}
              error={errors.password}
              showPw={showPw}
              onToggle={() => setShowPw((v) => !v)}
            />
            <PwField
              name="confirmPassword"
              label="Confirm Password *"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              error={errors.confirmPassword}
              showPw={showPw}
            />

            <button
              type="submit"
              disabled={loading || googleLoading}
              style={{ ...s.submitBtn, marginTop: 8 }}
            >
              {loading ? (
                <>
                  <svg
                    style={s.spinner}
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      style={{ opacity: 0.25 }}
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      style={{ opacity: 0.75 }}
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>{" "}
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div style={s.divider}>
            <div style={s.dividerLine} />
            <span style={s.dividerText}>or</span>
            <div style={s.dividerLine} />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading || googleLoading}
            style={s.googleBtn}
          >
            {googleLoading ? (
              <svg
                style={s.spinner}
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  style={{ opacity: 0.25 }}
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#a78bfa"
                  strokeWidth="4"
                />
                <path
                  style={{ opacity: 0.75 }}
                  fill="#a78bfa"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Register with Google
          </button>

          <p style={s.footerLink}>
            Already have an account?{" "}
            <Link to="/login" style={s.link}>
              Sign in
            </Link>
          </p>
        </div>
        <p style={s.copyright}>
          © {new Date().getFullYear()} Hope, Inc. · New Era University — BS
          Information Technology
        </p>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #0f0c29 0%, #1a0533 40%, #0d1b3e 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  bgOrb1: {
    position: "absolute",
    top: "-15%",
    right: "-10%",
    width: 600,
    height: 600,
    background:
      "radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  bgOrb2: {
    position: "absolute",
    bottom: "-20%",
    left: "-10%",
    width: 700,
    height: 700,
    background:
      "radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  bgGrid: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
    backgroundSize: "60px 60px",
  },
  wrapper: {
    position: "relative",
    width: "100%",
    maxWidth: 520,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  brand: { textAlign: "center", marginBottom: 24 },
  brandIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
    borderRadius: 18,
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    boxShadow:
      "0 8px 32px rgba(124,58,237,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
    marginBottom: 12,
  },
  brandName: { fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 },
  brandSub: { fontSize: 13, color: "#94a3b8", marginTop: 4, margin: 0 },
  card: {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 20,
    padding: "32px 28px 28px",
    boxShadow:
      "0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
    position: "relative",
    overflow: "hidden",
  },
  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: "linear-gradient(90deg, #7c3aed, #4f46e5, #06b6d4)",
    borderRadius: "20px 20px 0 0",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 4px",
  },
  cardSub: { fontSize: 13, color: "#94a3b8", margin: "0 0 20px" },
  alert: {
    display: "flex",
    alignItems: "flex-start",
    gap: 9,
    padding: "11px 14px",
    borderRadius: 12,
    fontSize: 13,
    lineHeight: 1.5,
  },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  fieldGroup: { marginBottom: 14 },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#cbd5e1",
    marginBottom: 6,
  },
  hint: { fontSize: 11, color: "#64748b", marginLeft: 6, fontWeight: 400 },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputIconSpan: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    zIndex: 1,
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    fontSize: 13.5,
    color: "#fff",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: "inherit",
  },
  pwToggle: {
    position: "absolute",
    right: 11,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    padding: 4,
  },
  fieldErr: { fontSize: 12, color: "#f87171", margin: "5px 0 0" },
  submitBtn: {
    width: "100%",
    padding: "11px 0",
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: "0 4px 20px rgba(124,58,237,0.45)",
    fontFamily: "inherit",
  },
  spinner: { animation: "spin 0.7s linear infinite" },
  divider: { display: "flex", alignItems: "center", gap: 12, margin: "20px 0" },
  dividerLine: { flex: 1, height: 1, background: "rgba(255,255,255,0.08)" },
  dividerText: { fontSize: 12, color: "#64748b", whiteSpace: "nowrap" },
  googleBtn: {
    width: "100%",
    padding: "10px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 12,
    background: "rgba(255,255,255,0.05)",
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  footerLink: {
    textAlign: "center",
    fontSize: 13,
    color: "#64748b",
    marginTop: 18,
    marginBottom: 0,
  },
  link: { color: "#a78bfa", fontWeight: 600, textDecoration: "none" },
  copyright: {
    fontSize: 11,
    color: "#334155",
    marginTop: 18,
    textAlign: "center",
  },
};
