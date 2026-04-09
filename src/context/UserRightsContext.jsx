// src/context/UserRightsContext.jsx
// PR-01: feat/rights-context
// M4 – Rights & Auth Specialist | Sprint 2
//
// Loads all 13 rights from usermodule_rights for the logged-in user on login.
// Exposes a rights map, can() helper, and the useRights() hook to all components.
//
// Table: usermodule_rights
// Columns: userid (text), rightid (varchar), right_value (int4)

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'

// ---------------------------------------------------------------------------
// The 13 right IDs — must match exactly what M3 seeded in the rights table
// ---------------------------------------------------------------------------
const DEFAULT_RIGHTS = {
  SALES_VIEW:   0,
  SALES_ADD:    0,
  SALES_EDIT:   0,
  SALES_DEL:    0,
  SD_VIEW:      0,
  SD_ADD:       0,
  SD_EDIT:      0,
  SD_DEL:       0,
  CUST_LOOKUP:  0,
  EMP_LOOKUP:   0,
  PROD_LOOKUP:  0,
  PRICE_LOOKUP: 0,
  ADM_USER:     0,
}

const UserRightsContext = createContext(null)

// ─────────────────────────────────────────────────────────────────────────────
// UserRightsProvider
// On login, loads all 13 rights from usermodule_rights for the current user.
// Stores them as a flat map: { SALES_VIEW: 1, SALES_ADD: 0, ... }
// ─────────────────────────────────────────────────────────────────────────────
export function UserRightsProvider({ children }) {
  const { currentUser } = useAuth()

  const [rights, setRights]               = useState(DEFAULT_RIGHTS)
  const [rightsLoading, setRightsLoading] = useState(false)
  const [rightsError, setRightsError]     = useState('')

  useEffect(() => {
    if (!currentUser?.userId) {
      // Logged out — reset to all-zero defaults
      setRights(DEFAULT_RIGHTS)
      setRightsError('')
      return
    }

    fetchRights(currentUser.userId)
  }, [currentUser])

  async function fetchRights(userId) {
    setRightsLoading(true)
    setRightsError('')

    const { data, error } = await supabase
      .from('usermodule_rights')        // lowercase — matches Supabase table name
      .select('rightid, right_value')
      .eq('userid', userId)             // lowercase — matches Supabase column name

    if (error) {
      console.error('[UserRightsContext] Failed to load rights:', error.message)
      setRightsError('Failed to load user rights. Please refresh.')
      setRightsLoading(false)
      return
    }

    // Build the rights map from the fetched rows.
    // Start from DEFAULT_RIGHTS (all zeros) so any missing right stays 0.
    const rightsMap = { ...DEFAULT_RIGHTS }

    data.forEach(({ rightid, right_value }) => {
      const key = rightid?.toUpperCase()    // normalize casing just in case
      if (key in rightsMap) {
        rightsMap[key] = right_value ?? 0   // treat NULL as 0
      }
    })

    setRights(rightsMap)
    setRightsLoading(false)
  }

  // ---------------------------------------------------------------------------
  // can(right) — helper used by components to check a single right
  // Usage: can('SALES_ADD') returns true if right_value === 1
  // ---------------------------------------------------------------------------
  function can(right) {
    return rights[right] === 1
  }

  return (
    <UserRightsContext.Provider value={{ rights, can, rightsLoading, rightsError }}>
      {children}
    </UserRightsContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// useRights hook
// Usage: const { rights, can, rightsLoading } = useRights()
// Check a right: can('SALES_ADD') or rights.SALES_ADD === 1
// ─────────────────────────────────────────────────────────────────────────────
export function useRights() {
  const ctx = useContext(UserRightsContext)
  if (!ctx) throw new Error('useRights must be used inside <UserRightsProvider>')
  return ctx
}
