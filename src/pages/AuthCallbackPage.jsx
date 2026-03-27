import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthCallbackPage() {
  const { currentUser, authLoading, authError } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (authLoading) return
    if (authError) { navigate('/login?error=not_activated', { replace: true }); return }
    if (currentUser) navigate('/sales', { replace: true })
  }, [currentUser, authLoading, authError, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Signing you in…</p>
      </div>
    </div>
  )
}