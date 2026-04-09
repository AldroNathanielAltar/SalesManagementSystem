import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'

const UserRightsContext = createContext(null)

// ─────────────────────────────────────────────────────────────────────────────
// UserRightsProvider
// On login, loads all 13 rights from UserModule_Rights for the current user.
// Stores them as a flat map: { SALES_VIEW: 1, SALES_ADD: 0, ... }
// ─────────────────────────────────────────────────────────────────────────────
export function UserRightsProvider({ children }) {
  const { currentUser } = useAuth()
  const [rights, setRights]           = useState({})
  const [rightsLoading, setRightsLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      setRights({})
      setRightsLoading(false)
      return
    }
    loadRights(currentUser.userId)
  }, [currentUser])

  async function loadRights(userId) {
    setRightsLoading(true)

    const { data, error } = await supabase
      .from('UserModule_Rights')
      .select('rightCode, right_value')
      .eq('userId', userId)

    if (error) {
      console.error('Failed to load rights:', error)
      setRightsLoading(false)
      return
    }

    // Convert array to flat map: { SALES_VIEW: 1, SALES_ADD: 0, ... }
    const rightsMap = {}
    data.forEach(row => {
      rightsMap[row.rightCode] = row.right_value
    })

    setRights(rightsMap)
    setRightsLoading(false)
  }

  return (
    <UserRightsContext.Provider value={{ rights, rightsLoading }}>
      {children}
    </UserRightsContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// useRights hook
// Usage: const { rights, rightsLoading } = useRights()
// Check a right: rights.SALES_ADD === 1
// ─────────────────────────────────────────────────────────────────────────────
export function useRights() {
  const ctx = useContext(UserRightsContext)
  if (!ctx) throw new Error('useRights must be used inside <UserRightsProvider>')
  return ctx
}