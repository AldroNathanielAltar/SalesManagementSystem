import { supabase } from '../lib/supabaseClient'

// ─────────────────────────────────────────────────────────────────────────────
// REPORT 1 — Sales by Date Range
// Returns all ACTIVE sales transactions within a given date range,
// joined with customer and employee info via the sales_with_lookup view.
// Used for: Date-filtered sales listing report.
// ─────────────────────────────────────────────────────────────────────────────
export async function getSalesByDateRange(startDate, endDate) {
  const { data, error } = await supabase
    .from('sales_with_lookup')
    .select('*')
    .eq('record_status', 'ACTIVE')
    .gte('salesDate', startDate)
    .lte('salesDate', endDate)
    .order('salesDate', { ascending: false })

  if (error) throw error
  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORT 2 — Sales by Customer
// Returns all ACTIVE sales for a specific customer,
// joined with employee info via the sales_with_lookup view.
// Used for: Per-customer sales history report.
// ─────────────────────────────────────────────────────────────────────────────
export async function getSalesByCustomer(custNo) {
  const { data, error } = await supabase
    .from('sales_with_lookup')
    .select('*')
    .eq('record_status', 'ACTIVE')
    .eq('custno', custNo)
    .order('salesDate', { ascending: false })

  if (error) throw error
  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORT 3 — Sales by Employee
// Returns all ACTIVE sales handled by a specific employee,
// joined with customer info via the sales_with_lookup view.
// Used for: Per-employee performance/sales report.
// ─────────────────────────────────────────────────────────────────────────────
export async function getSalesByEmployee(empNo) {
  const { data, error } = await supabase
    .from('sales_with_lookup')
    .select('*')
    .eq('record_status', 'ACTIVE')
    .eq('empno', empNo)
    .order('salesDate', { ascending: false })

  if (error) throw error
  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORT 4 — Revenue Summary by Date Range
// Returns ACTIVE salesdetail lines with product info and unit price
// filtered to transactions within the given date range.
// Caller computes revenue as: quantity × unitPrice per line.
// Used for: Revenue/earnings summary report.
// ─────────────────────────────────────────────────────────────────────────────
export async function getRevenueSummary(startDate, endDate) {
  // Step 1: get ACTIVE transNos within date range
  const { data: salesRows, error: salesError } = await supabase
    .from('sales_with_lookup')
    .select('transNo, salesDate, custname')
    .eq('record_status', 'ACTIVE')
    .gte('salesDate', startDate)
    .lte('salesDate', endDate)

  if (salesError) throw salesError
  if (!salesRows || salesRows.length === 0) return []

  const transNos = salesRows.map(s => s.transNo)

  // Step 2: get detail lines for those transactions
  const { data: detailRows, error: detailError } = await supabase
    .from('salesdetail_with_product')
    .select('transNo, prodCode, description, unit, quantity, unitPrice, effDate')
    .eq('record_status', 'ACTIVE')
    .in('transNo', transNos)

  if (detailError) throw detailError

  // Step 3: merge salesDate + custname into each detail line
  const salesMap = Object.fromEntries(salesRows.map(s => [s.transNo, s]))

  return (detailRows || []).map(line => ({
    ...line,
    salesDate: salesMap[line.transNo]?.salesDate ?? null,
    custname:  salesMap[line.transNo]?.custname  ?? null,
    lineTotal: parseFloat((line.quantity * line.unitPrice).toFixed(2)),
  }))
}