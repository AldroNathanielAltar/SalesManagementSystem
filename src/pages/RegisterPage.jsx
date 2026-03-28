import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, TrendingUp, User, Mail, Lock, UserCircle } from 'lucide-react';
import './Auth.css';

const EMPTY = { firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: '' };

export default function RegisterPage() {
  const nav = useNavigate();
  const [form, setForm]       = useState(EMPTY);
  const [showPw, setShowPw]   = useState(false);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.firstName.trim())   errs.firstName = 'First name is required.';
    if (!form.lastName.trim())    errs.lastName  = 'Last name is required.';
    if (!form.username.trim())    errs.username  = 'Username is required.';
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required.';
    if (form.password.length < 8) errs.password  = 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  }

  async function handleRegister(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    // TODO: wire to supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { firstName, lastName, username } } })
    setTimeout(() => {
      setLoading(false);
      nav('/login');
    }, 1000);
  }

  function handleGoogle() {
    // TODO: wire to supabase.auth.signInWithOAuth({ provider: 'google' })
    alert('Google Register — wire to Supabase');
  }

  const Field = ({ name, label, type = 'text', icon: Icon, placeholder }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="auth-input-wrap">
        <Icon size={15} className="auth-input-icon" />
        <input
          className={`form-input auth-input ${errors[name] ? 'input-error' : ''}`}
          type={type}
          placeholder={placeholder}
          value={form[name]}
          onChange={e => set(name, e.target.value)}
          autoComplete={name}
        />
      </div>
      {errors[name] && <p className="field-error">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon"><TrendingUp size={22} /></div>
          <div>
            <h1 className="auth-app-name">SalesFlow SMS</h1>
            <p className="auth-app-sub">Hope, Inc. Sales Management System</p>
          </div>
        </div>

        <h2 className="auth-title">Create your account</h2>

        <form className="auth-form" onSubmit={handleRegister} noValidate>
          <div className="auth-row-2">
            <Field name="firstName" label="First Name *" icon={User}       placeholder="Juan" />
            <Field name="lastName"  label="Last Name *"  icon={User}       placeholder="dela Cruz" />
          </div>
          <Field name="username" label="Username *"      icon={UserCircle} placeholder="jdelacruz" />
          <Field name="email"    label="Email Address *" icon={Mail}       placeholder="juan@hopeinc.com" type="email" />

          <div className="form-group">
            <label className="form-label">Password * <span className="auth-hint">(min. 8 characters)</span></label>
            <div className="auth-input-wrap">
              <Lock size={15} className="auth-input-icon" />
              <input
                className={`form-input auth-input auth-input-pw ${errors.password ? 'input-error' : ''}`}
                type={showPw ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
              />
              <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <div className="auth-input-wrap">
              <Lock size={15} className="auth-input-icon" />
              <input
                className={`form-input auth-input auth-input-pw ${errors.confirmPassword ? 'input-error' : ''}`}
                type={showPw ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={e => set('confirmPassword', e.target.value)}
              />
            </div>
            {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Create Account'}
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
          Register with Google
        </button>

        <p className="auth-footer-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
