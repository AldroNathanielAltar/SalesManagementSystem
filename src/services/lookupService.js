import { supabase } from "../lib/supabaseClient";

// ─────────────────────────────────────────────────────────────────────────────
// ALL LOOKUP FUNCTIONS ARE READ-ONLY
// No add, edit, or delete operations — ever.
// These populate dropdowns and display enriched data only.
// ─────────────────────────────────────────────────────────────────────────────

// GET ALL CUSTOMERS
// Used to populate custNo dropdown on new/edit sales form
export async function getCustomers() {
  const { data, error } = await supabase
    .from("customer")
    .select("custno, custname, payterm")
    .order("custname", { ascending: true });

  if (error) throw error;
  return data;
}

// GET ALL EMPLOYEES
// Used to populate empNo dropdown on new/edit sales form
export async function getEmployees() {
  const { data, error } = await supabase
    .from("employee")
    .select("empno, lastname, firstname, gender, hiredate")
    .order("lastname", { ascending: true });

  if (error) throw error;
  return data;
}

// GET ALL PRODUCTS
// Used to populate prodCode dropdown on salesDetail form
export async function getProducts() {
  const { data, error } = await supabase
    .from("product")
    .select("prodCode, description, unit")
    .order("description", { ascending: true });

  if (error) throw error;
  return data;
}

// GET CURRENT PRICE FOR A PRODUCT
// Returns the priceHist row with MAX(effDate) for the given prodCode
// Used to auto-fill unit price when a product is selected on salesDetail form
export async function getCurrentPrice(prodCode) {
  const { data, error } = await supabase
    .from("pricehist")
    .select("prodCode, effDate, unitPrice")
    .eq("prodCode", prodCode)
    .order("effDate", { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  return data;
}

// GET ALL PRICE HISTORY
// Used to populate the PriceHistory lookup page (read-only display)
export async function getPriceHistory() {
  const { data, error } = await supabase
    .from("pricehist")
    .select("prodCode, effDate, unitPrice")
    .order("prodCode", { ascending: true });

  if (error) throw error;
  return data;
}
