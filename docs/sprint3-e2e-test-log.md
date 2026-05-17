# Sprint 3 — End-to-End Production Test Log
**Tester:** Thyrone Asuncion (M4 – Rights & Auth Specialist)
**Production URL:** https://sales-management-system-two-gold.vercel.app
**Branch:** test/e2e-rights-production

---

## 1. Authentication Tests

### 1.1 Email Login
| Test | Expected | Result |
|------|----------|--------|
| Login with valid ACTIVE email account | Redirects to /sales | ✅ PASS |
| Login with invalid credentials | Error message shown | ✅ PASS |
| Login with INACTIVE account | Pending activation message | ✅ PASS |

### 1.2 Google OAuth
| Test | Expected | Result |
|------|----------|--------|
| Click Sign in with Google | Redirects to Google OAuth with loading state | ✅ PASS |
| Complete Google OAuth as ACTIVE user | Redirects to /sales | ✅ PASS |
| Complete Google OAuth as INACTIVE user | Redirects to /login?error=not_activated | ✅ PASS |

---

## 2. Rights Matrix — 3 User Types × 13 Rights

### 2.1 USER (Sales Agent)
| Right | Expected | Result |
|-------|----------|--------|
| SALES_VIEW | Can see Sales list | ✅ PASS |
| SALES_ADD | Add Transaction button NOT visible | ✅ PASS |
| SALES_EDIT | Edit button NOT visible | ✅ PASS |
| SALES_DEL | Delete button NOT visible | ✅ PASS |
| SD_VIEW | Can see Sales Detail page | ✅ PASS |
| SD_ADD | Add Line Item button NOT visible | ✅ PASS |
| SD_EDIT | Edit button NOT visible on line items | ✅ PASS |
| SD_DEL | Delete button NOT visible on line items | ✅ PASS |
| CUST_LOOKUP | Can access /lookups/customers | ✅ PASS |
| EMP_LOOKUP | Can access /lookups/employees | ✅ PASS |
| PROD_LOOKUP | Can access /lookups/products | ✅ PASS |
| PRICE_LOOKUP | Can access /lookups/prices | ✅ PASS |
| ADM_USER | Admin/Users link NOT visible in sidebar | ✅ PASS |

### 2.2 ADMIN (Sales Manager)
| Right | Expected | Result |
|-------|----------|--------|
| SALES_VIEW | Can see Sales list including INACTIVE rows | ✅ PASS |
| SALES_ADD | Add Transaction button visible | ✅ PASS |
| SALES_EDIT | Edit button visible on ACTIVE rows | ✅ PASS |
| SALES_DEL | Delete button NOT visible (SUPERADMIN only) | ✅ PASS |
| SD_VIEW | Can see Sales Detail page | ✅ PASS |
| SD_ADD | Add Line Item button visible | ✅ PASS |
| SD_EDIT | Edit button visible on line items | ✅ PASS |
| SD_DEL | Delete button NOT visible (SUPERADMIN only) | ✅ PASS |
| CUST_LOOKUP | Can access /lookups/customers | ✅ PASS |
| EMP_LOOKUP | Can access /lookups/employees | ✅ PASS |
| PROD_LOOKUP | Can access /lookups/products | ✅ PASS |
| PRICE_LOOKUP | Can access /lookups/prices | ✅ PASS |
| ADM_USER | User Management page restricted (SUPERADMIN only per rights matrix) | ✅ PASS |

### 2.3 SUPERADMIN
| Right | Expected | Result |
|-------|----------|--------|
| SALES_VIEW | Can see Sales list including INACTIVE rows | ✅ PASS |
| SALES_ADD | Add Transaction button visible | ✅ PASS |
| SALES_EDIT | Edit button visible on ACTIVE rows | ✅ PASS |
| SALES_DEL | Delete button visible — soft delete only | ✅ PASS |
| SD_VIEW | Can see Sales Detail page | ✅ PASS |
| SD_ADD | Add Line Item button visible | ✅ PASS |
| SD_EDIT | Edit button visible on line items | ✅ PASS |
| SD_DEL | Delete button visible on line items | ✅ PASS |
| CUST_LOOKUP | Can access /lookups/customers | ✅ PASS |
| EMP_LOOKUP | Can access /lookups/employees | ✅ PASS |
| PROD_LOOKUP | Can access /lookups/products | ✅ PASS |
| PRICE_LOOKUP | Can access /lookups/prices | ✅ PASS |
| ADM_USER | Users link visible in sidebar, page accessible | ✅ PASS |

---

## 3. Page Access Restrictions

| Test | Expected | Result |
|------|----------|--------|
| USER visits /deleted-items directly | Redirects to /sales | ✅ PASS |
| USER visits /admin/users directly | Access Restricted message shown | ✅ PASS |
| Unauthenticated user visits /sales | Redirects to /login | ✅ PASS |

---

## 4. Stamp Visibility

| Test | Expected | Result |
|------|----------|--------|
| USER — SalesListPage | Stamp/Last Modified column NOT visible | ✅ PASS |
| USER — SalesDetailPage | Stamp field NOT visible | ✅ PASS |
| ADMIN — SalesListPage | Stamp/Last Modified column visible | ✅ PASS |
| ADMIN — SalesDetailPage | Stamp field visible | ✅ PASS |
| SUPERADMIN — SalesListPage | Stamp/Last Modified column visible | ✅ PASS |
| SUPERADMIN — SalesDetailPage | Stamp field visible | ✅ PASS |

---

## 5. Sidebar Gating

| Test | Expected | Result |
|------|----------|--------|
| USER — Admin group | NOT visible in sidebar | ✅ PASS |
| USER — Deleted Items link | NOT visible in sidebar | ✅ PASS |
| ADMIN with ADM_USER=1 — Users link | Visible in sidebar | ✅ PASS |
| ADMIN with ADM_USER=0 — Users link | Visible in sidebar but page restricted | ✅ PASS |
| SUPERADMIN — Users link | Visible in sidebar | ✅ PASS |

---

## 6. SUPERADMIN Protection

| Test | Expected | Result |
|------|----------|--------|
| Visit /admin/users — SUPERADMIN rows | Greyed out + 🔒 Protected label | ✅ PASS |
| Hover over SUPERADMIN row | Tooltip appears | ✅ PASS |
| ADMIN attempts to activate/deactivate SUPERADMIN | Buttons not shown | ✅ PASS |

---

## 7. Lookup Pages — Mutation-Free

| Test | Expected | Result |
|------|----------|--------|
| USER — /lookups/customers | Zero add/edit/delete buttons | ✅ PASS |
| USER — /lookups/employees | Zero add/edit/delete buttons | ✅ PASS |
| USER — /lookups/products | Zero add/edit/delete buttons | ✅ PASS |
| USER — /lookups/prices | Zero add/edit/delete buttons | ✅ PASS |
| ADMIN — all 4 lookup pages | Zero add/edit/delete buttons | ✅ PASS |
| SUPERADMIN — all 4 lookup pages | Zero add/edit/delete buttons | ✅ PASS |

---

## 8. Summary

| Category | Total Tests | Passed | Failed |
|----------|-------------|--------|--------|
| Authentication | 6 | 6 | 0 |
| Rights Matrix (39 cases) | 39 | 39 | 0 |
| Page Access | 3 | 3 | 0 |
| Stamp Visibility | 6 | 6 | 0 |
| Sidebar Gating | 5 | 5 | 0 |
| SUPERADMIN Protection | 3 | 3 | 0 |
| Lookup Pages | 6 | 6 | 0 |
| **TOTAL** | **68** | **68** | **0** |

---

## 9. Notes

- Rights enforcement uses a dual system — `user_type` for page-level access and `can()` for button-level gating. This is by design per sprint requirements.
- Email confirmation toggle must be OFF in Supabase for email registration flow to work correctly in current implementation.
- `usermodule_rights` must be manually updated when `user_type` changes — no automatic trigger for type changes, only for new registrations via `provision_new_user()`.
- Google OAuth tested in production with real Google account — working correctly.
- Cascade soft-delete and recovery verified in production — salesDetail rows follow parent sales row in both directions.
