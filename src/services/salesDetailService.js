import { supabase } from "../lib/supabaseClient";

// ─────────────────────────────────────────────────────────────────────────────
// GET DETAIL BY TRANSACTION
// USER sees ACTIVE only. ADMIN/SUPERADMIN see all.
// ─────────────────────────────────────────────────────────────────────────────
export async function getDetailByTrans(transNo, userType) {
  let query = supabase
    .from("salesdetail_with_product")
    .select("*")
    .eq("transNo", transNo);

  if (userType === "USER") {
    query = query.eq("record_status", "ACTIVE");
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD DETAIL LINE
// Requires SD_ADD = 1
// Note: composite PK (transNo, prodCode) — one product per transaction
// ─────────────────────────────────────────────────────────────────────────────
export async function addDetailLine({ transNo, prodCode, quantity, stamp }) {
  const { data, error } = await supabase
    .from("salesdetail")
    .insert([
      {
        transNo,
        prodCode,
        quantity,
        record_status: "ACTIVE",
        stamp,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE DETAIL LINE
// Requires SD_EDIT = 1
// Only quantity can be updated — transNo and prodCode are the composite PK
// ─────────────────────────────────────────────────────────────────────────────
export async function updateDetailLine(transNo, prodCode, { quantity, stamp }) {
  const { data, error } = await supabase
    .from("salesdetail")
    .update({ quantity, stamp })
    .eq("transNo", transNo)
    .eq("prodCode", prodCode)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// SOFT DELETE DETAIL LINE
// Sets record_status = INACTIVE on a single salesDetail row.
// Requires SD_DEL = 1 (SUPERADMIN only)
// ─────────────────────────────────────────────────────────────────────────────
export async function softDeleteDetailLine(transNo, prodCode, stamp) {
  const { data, error } = await supabase
    .from("salesdetail")
    .update({
      record_status: "INACTIVE",
      stamp,
    })
    .eq("transNo", transNo)
    .eq("prodCode", prodCode)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// RECOVER DETAIL LINE
// Sets record_status = ACTIVE on a single salesDetail row.
// Requires ADMIN or SUPERADMIN
// ─────────────────────────────────────────────────────────────────────────────
export async function recoverDetailLine(transNo, prodCode, stamp) {
  const { data, error } = await supabase
    .from("salesdetail")
    .update({
      record_status: "ACTIVE",
      stamp,
    })
    .eq("transNo", transNo)
    .eq("prodCode", prodCode)
    .select()
    .single();

  if (error) throw error;
  return data;
}
