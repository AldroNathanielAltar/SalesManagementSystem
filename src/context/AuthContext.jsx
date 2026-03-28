import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  const login = (userData) => {
    const u = { ...userData, loggedInAt: new Date().toISOString() }
    localStorage.setItem('sms_user', JSON.stringify(u))
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('sms_user')
    setUser(null)
  }

  const register = (userData) => {
    // In a real app this would call an API.
    // For now we just log the user in immediately after registering.
    login(userData)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}
