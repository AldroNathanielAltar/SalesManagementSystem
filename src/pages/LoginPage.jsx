import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, TrendingUp, Mail, Lock } from 'lucide-react';
import './Auth.css';

export default function LoginPage() {
  const nav = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); setError(''); }

  async function handleLogin(e) {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setError('Please enter a valid email address.'); return; }
    setLoading(true);
    // TODO: wire to supabase.auth.signInWithPassword({ email, password })
    setTimeout(() => {
      setLoading(false);
      nav('/sales');
    }, 1000);
  }

  function handleGoogle() {
    // TODO: wire to supabase.auth.signInWithOAuth({ provider: 'google' })
    alert('Google OAuth — wire to Supabase');
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon"><TrendingUp size={22} /></div>
          <div>
            <h1 className="auth-app-name">SalesFlow SMS</h1>
            <p className="auth-app-sub">Hope, Inc. Sales Management System</p>
          </div>
        </div>

        <h2 className="auth-title">Sign in to your account</h2>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleLogin} noValidate>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="auth-input-wrap">
              <Mail size={15} className="auth-input-icon" />
              <input
                className="form-input auth-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="auth-input-wrap">
              <Lock size={15} className="auth-input-icon" />
              <input
                className="form-input auth-input auth-input-pw"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <button className="auth-google-btn" onClick={handleGoogle}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          Sign in with Google
        </button>

        <p className="auth-footer-link">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
