import { supabase } from '../lib/supabaseClient'

// ─────────────────────────────────────────────────────────────────────────────
// GET USERS
// Returns all users except SUPERADMIN.
// ADMIN sees USER + ADMIN rows only (cannot see or touch SUPERADMIN).
// SUPERADMIN sees everyone (USER + ADMIN).
// Ordered by username ascending.
// ─────────────────────────────────────────────────────────────────────────────
export async function getUsers(callerType) {
  let query = supabase
    .from('user')
    .select('userId, username, user_type, record_status, stamp')
    .order('username', { ascending: true })

  if (callerType === 'ADMIN') {
    // ADMIN cannot see or modify SUPERADMIN accounts
    query = query.neq('user_type', 'SUPERADMIN')
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVATE USER
// Sets record_status = 'ACTIVE' on the target user row.
// Requires ADM_USER = 1 (ADMIN or SUPERADMIN).
// ADMIN cannot activate a SUPERADMIN — caller must verify before calling.
// ─────────────────────────────────────────────────────────────────────────────
export async function activateUser(userId, stamp) {
  const { data, error } = await supabase
    .from('user')
    .update({
      record_status: 'ACTIVE',
      stamp
    })
    .eq('userId', userId)
    .neq('user_type', 'SUPERADMIN')   // safety: never activate via SUPERADMIN row
    .select()
    .single()

  if (error) throw error
  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// DEACTIVATE USER
// Sets record_status = 'INACTIVE' on the target user row.
// Requires ADM_USER = 1 (ADMIN or SUPERADMIN).
// ADMIN cannot deactivate a SUPERADMIN — caller must verify before calling.
// ─────────────────────────────────────────────────────────────────────────────
export async function deactivateUser(userId, stamp) {
  const { data, error } = await supabase
    .from('user')
    .update({
      record_status: 'INACTIVE',
      stamp
    })
    .eq('userId', userId)
    .neq('user_type', 'SUPERADMIN')   // safety: never deactivate a SUPERADMIN row
    .select()
    .single()

  if (error) throw error
  return data
}