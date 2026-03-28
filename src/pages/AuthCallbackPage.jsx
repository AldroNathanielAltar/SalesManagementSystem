import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function AuthCallbackPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  useEffect(() => {
    // In production, parse the token/user from URL params or cookies
    // that your backend sets after Google OAuth completes.
    // Example: GET /auth/callback?token=xxx&user=yyy
    const params = new URLSearchParams(window.location.search)
    const token  = params.get('token')
    const name   = params.get('name')
    const email  = params.get('email')

    if (token && email) {
      // Real OAuth: log the user in with data from the callback
      login({
        name:   name || email.split('@')[0],
        email,
        role:   'user',
        avatar: (name || email)[0].toUpperCase(),
        token,
      })
      navigate('/dashboard', { replace: true })
    } else {
      // Simulate a 2-second exchange then redirect to dashboard (demo only)
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [login, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex flex-col items-center justify-center gap-6">

      {/* Spinner */}
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 rounded-full border-4 border-violet-100"/>
        {/* Spinning arc */}
        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-violet-600 animate-spin"/>
        {/* Logo in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Text */}
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-800">Signing you in...</h2>
        <p className="text-sm text-gray-500 mt-1">
          Please wait while we verify your session with Google.
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      <p className="text-xs text-gray-400 absolute bottom-6">
        © {new Date().getFullYear()} Hope, Inc. · New Era University
      </p>
    </div>
  )
}
