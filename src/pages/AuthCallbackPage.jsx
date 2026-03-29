import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import './Auth.css';

export default function AuthCallbackPage() {
  const nav = useNavigate();

  useEffect(() => {
    // TODO: wire real Supabase session exchange
    // supabase.auth.getSession().then(({ data: { session } }) => {
    //   if (session) nav('/sales');
    //   else nav('/login?error=not_activated');
    // });
    const timer = setTimeout(() => nav('/sales'), 2000);
    return () => clearTimeout(timer);
  }, [nav]);

  return (
    <div className="auth-page">
      <div className="auth-card callback-card">
        <div className="auth-logo-icon callback-icon">
          <TrendingUp size={28} />
        </div>
        <h2 className="auth-title" style={{ marginTop: 20 }}>Completing Sign In…</h2>
        <p className="auth-app-sub" style={{ marginBottom: 28 }}>
          Please wait while we verify your session.
        </p>
        <div className="callback-spinner-wrap">
          <div className="callback-spinner" />
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
          You will be redirected automatically.
        </p>
      </div>
    </div>
  );
}
