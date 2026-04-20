# Sprint 2 Audit Plan: Rights & Data Integrity

**Lead Auditor:** Ven Angel Tagaro (M5)

## 1. Role-Based Access Control (RBAC)

We are testing 13 system rights across 3 roles (Admin, Manager, Employee).
**Total Scenarios:** 39

| ID  | System Right        | Admin | Manager | Employee |
| :-- | :------------------ | :---: | :-----: | :------: |
| R01 | User Management     |  ✅   |   ❌    |    ❌    |
| R02 | View Reports        |  ✅   |   ✅    |    ✅    |
| R03 | Soft-Delete Records |  ✅   |   ✅    |    ❌    |
| R04 | Record Recovery     |  ✅   |   ❌    |    ❌    |
| R05 | Category Lookup     |  ✅   |   ✅    |    ✅    |
| R06 | Unit Lookup         |  ✅   |   ✅    |    ✅    |
| R07 | Product Lookup      |  ✅   |   ✅    |    ✅    |
| R08 | Customer Lookup     |  ✅   |   ✅    |    ✅    |
| R09 | Create Transactions |  ✅   |   ✅    |    ✅    |
| R10 | Edit Transactions   |  ✅   |   ✅    |    ❌    |
| R11 | System Config       |  ✅   |   ❌    |    ❌    |
| R12 | Stock Overrides     |  ✅   |   ✅    |    ❌    |
| R13 | Audit Log Access    |  ✅   |   ❌    |    ❌    |

## 2. Database Integrity Audit

- **Soft-Delete:** Verify `is_deleted` flag is toggled instead of row removal.
- **Auto-fill:** Verify Price field correctly fetches from Product table on selection.
