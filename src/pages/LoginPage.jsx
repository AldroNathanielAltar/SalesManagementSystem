import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { loginWithEmail, loginWithGoogle } from "../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(
    searchParams.get("error") === "not_activated"
      ? "Your account is inactive. Please contact your administrator."
      : searchParams.get("registered") === "true"
        ? "Account created! Please check your email to confirm, then sign in."
        : "",
  );
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Please enter a valid email address.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 6)
      e.password = "Password must be at least 6 characters.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await loginWithEmail(form.email, form.password);
      navigate("/sales", { replace: true });
    } catch (err) {
      setServerError(
        err.message === "Invalid login credentials"
          ? "Incorrect email or password. Please try again."
          : err.message || "Sign in failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setServerError("");
    try {
      await loginWithGoogle();
    } catch (err) {
      setServerError(err.message || "Google sign in failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const field = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: "" }));
  };

  return (
    <div style={styles.page}>
      {/* ── Rich animated background ── */}
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />
      <div style={styles.bgOrb3} />
      <div style={styles.bgGrid} />

      <div style={styles.wrapper}>
        {/* Brand */}
        <div style={styles.brand}>
          <div style={styles.brandIcon}>
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
          <h1 style={styles.brandName}>Hope, Inc. SMS</h1>
          <p style={styles.brandSub}>Sales Management System</p>
        </div>

        {/* Card */}
        <div style={styles.card}>
          {/* Top accent bar */}
          <div style={styles.cardAccent} />

          <h2 style={styles.cardTitle}>Welcome back</h2>
          <p style={styles.cardSub}>Sign in to your account to continue</p>

          {/* Server error / success */}
          {serverError && (
            <div
              style={{
                ...styles.alert,
                background: serverError.includes("created")
                  ? "rgba(16,185,129,0.12)"
                  : "rgba(239,68,68,0.12)",
                border: `1px solid ${serverError.includes("created") ? "rgba(16,185,129,0.35)" : "rgba(239,68,68,0.35)"}`,
                color: serverError.includes("created") ? "#6ee7b7" : "#fca5a5",
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

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email address</label>
              <div style={styles.inputWrap}>
                <svg
                  style={styles.inputIcon}
                  width="15"
                  height="15"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  value={form.email}
                  onChange={field("email")}
                  placeholder="you@hope.com"
                  autoComplete="email"
                  style={{
                    ...styles.input,
                    borderColor: errors.email
                      ? "rgba(239,68,68,0.6)"
                      : "rgba(255,255,255,0.1)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#7c3aed";
                    e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.email
                      ? "rgba(239,68,68,0.6)"
                      : "rgba(255,255,255,0.1)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
              {errors.email && <p style={styles.fieldErr}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div style={{ ...styles.fieldGroup, marginBottom: 24 }}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <svg
                  style={styles.inputIcon}
                  width="15"
                  height="15"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={field("password")}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{
                    ...styles.input,
                    paddingRight: 44,
                    borderColor: errors.password
                      ? "rgba(239,68,68,0.6)"
                      : "rgba(255,255,255,0.1)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#7c3aed";
                    e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.password
                      ? "rgba(239,68,68,0.6)"
                      : "rgba(255,255,255,0.1)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={styles.pwToggle}
                >
                  {showPw ? (
                    <svg
                      width="17"
                      height="17"
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
                      width="17"
                      height="17"
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
              </div>
              {errors.password && (
                <p style={styles.fieldErr}>{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              style={styles.submitBtn}
            >
              {loading ? (
                <>
                  <svg
                    style={styles.spinner}
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
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>or continue with</span>
            <div style={styles.dividerLine} />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            style={styles.googleBtn}
          >
            {googleLoading ? (
              <svg
                style={styles.spinner}
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
            Sign in with Google
          </button>

          <p style={styles.footerLink}>
            Don't have an account?{" "}
            <Link to="/register" style={styles.link}>
              Create one
            </Link>
          </p>
        </div>

        <p style={styles.copyright}>
          © {new Date().getFullYear()} Hope, Inc. · New Era University — BS
          Information Technology
        </p>
      </div>
    </div>
  );
}

/* ── Inline styles — zero CSS dependency ── */
const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #0f0c29 0%, #1a0533 40%, #0d1b3e 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
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
  bgOrb3: {
    position: "absolute",
    top: "40%",
    left: "30%",
    width: 400,
    height: 400,
    background:
      "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  bgGrid: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
    backgroundSize: "60px 60px",
  },
  wrapper: {
    position: "relative",
    width: "100%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  brand: { textAlign: "center", marginBottom: 28 },
  brandIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 58,
    height: 58,
    borderRadius: 18,
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    boxShadow:
      "0 8px 32px rgba(124,58,237,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
    marginBottom: 14,
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
    padding: "32px 32px 28px",
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
  cardSub: { fontSize: 13, color: "#94a3b8", margin: "0 0 22px" },
  alert: {
    display: "flex",
    alignItems: "flex-start",
    gap: 9,
    padding: "11px 14px",
    borderRadius: 12,
    fontSize: 13,
    marginBottom: 18,
    lineHeight: 1.5,
  },
  fieldGroup: { marginBottom: 16 },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#cbd5e1",
    marginBottom: 7,
  },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: {
    position: "absolute",
    left: 13,
    color: "#64748b",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "10px 14px 10px 38px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    fontSize: 14,
    color: "#fff",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: "inherit",
  },
  pwToggle: {
    position: "absolute",
    right: 12,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    padding: 4,
    transition: "color 0.15s",
  },
  fieldErr: { fontSize: 12, color: "#f87171", marginTop: 6, margin: "6px 0 0" },
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
    transition: "opacity 0.15s, transform 0.15s",
    fontFamily: "inherit",
  },
  spinner: { animation: "spin 0.7s linear infinite" },
  divider: { display: "flex", alignItems: "center", gap: 12, margin: "22px 0" },
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
    transition: "background 0.15s, border-color 0.15s",
    fontFamily: "inherit",
  },
  footerLink: {
    textAlign: "center",
    fontSize: 13,
    color: "#64748b",
    marginTop: 20,
    marginBottom: 0,
  },
  link: { color: "#a78bfa", fontWeight: 600, textDecoration: "none" },
  copyright: {
    fontSize: 11,
    color: "#334155",
    marginTop: 20,
    textAlign: "center",
  },
};

/* Inject keyframe for spinner */
if (typeof document !== "undefined" && !document.getElementById("__spin_kf")) {
  const s = document.createElement("style");
  s.id = "__spin_kf";
  s.textContent =
    "@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }";
  document.head.appendChild(s);
}
