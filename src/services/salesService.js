import { supabase } from '../lib/supabaseClient'

// ─────────────────────────────────────────────────────────────────────────────
// GET SALES
// USER sees ACTIVE only. ADMIN/SUPERADMIN see all.
// ─────────────────────────────────────────────────────────────────────────────
export async function getSales(userType) {
  let query = supabase
    .from('sales_with_lookup')
    .select('*')
    .order('salesDate', { ascending: false })

  if (userType === 'USER') {
    query = query.eq('record_status', 'ACTIVE')
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// GET SINGLE SALE
// ─────────────────────────────────────────────────────────────────────────────
export async function getSaleByTransNo(transNo) {
  const { data, error } = await supabase
    .from('sales_with_lookup')
    .select('*')
    .eq('transNo', transNo)
    .single()

  if (error) throw error
  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE SALE
// Requires SALES_ADD = 1
// ─────────────────────────────────────────────────────────────────────────────
export async function createSale({ salesDate, custNo, empNo, stamp }) {
  const { data, error } = await supabase
    .from('sales')
    .insert([{
      salesDate,
      custNo,
      empNo,
      record_status: 'ACTIVE',
      stamp
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE SALE
// Requires SALES_EDIT = 1
// ─────────────────────────────────────────────────────────────────────────────
export async function updateSale(transNo, { salesDate, custNo, empNo, stamp }) {
  const { data, error } = await supabase
    .from('sales')
    .update({ salesDate, custNo, empNo, stamp })
    .eq('transNo', transNo)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// SOFT DELETE SALE
// Sets record_status = INACTIVE on sales row.
// Cascade trigger automatically sets all salesDetail rows to INACTIVE.
// Requires SALES_DEL = 1 (SUPERADMIN only)
// ─────────────────────────────────────────────────────────────────────────────
export async function softDeleteSale(transNo, stamp) {
  const { data, error } = await supabase
    .from('sales')
    .update({
      record_status: 'INACTIVE',
      stamp
    })
    .eq('transNo', transNo)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// RECOVER SALE
// Sets record_status = ACTIVE on sales row.
// Cascade trigger automatically restores all salesDetail rows to ACTIVE.
// Requires ADMIN or SUPERADMIN
// ─────────────────────────────────────────────────────────────────────────────
export async function recoverSale(transNo, stamp) {
  const { data, error } = await supabase
    .from('sales')
    .update({
      record_status: 'ACTIVE',
      stamp
    })
    .eq('transNo', transNo)
    .select()
    .single()

  if (error) throw error
  return data
}