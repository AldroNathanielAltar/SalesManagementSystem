# Hope, Inc. — Sales Management System

> BS Information Technology Capstone | New Era University — CCS | AY 2025–2026

## Live Demo

[https://sales-management-system-two-gold.vercel.app](https://sales-management-system-two-gold.vercel.app)

---

## Team

| Label | Name                     | Role                                |
| ----- | ------------------------ | ----------------------------------- |
| M1    | Aldro Nathaniel P. Altar | Project Lead / Full-Stack Developer |
| M2    | Josh D. Singson          | Frontend Developer (UI/UX)          |
| M3    | Cyden N. Centeno         | Backend / Database Engineer         |
| M4    | Thyrone P. Asuncion      | Rights & Auth Specialist            |
| M5    | Ven Angel C. Tagaro      | QA / Documentation                  |

---

## Tech Stack

| Layer           | Technology                                        |
| --------------- | ------------------------------------------------- |
| Frontend        | React 18 + Vite                                   |
| Styling         | Tailwind CSS                                      |
| Backend / DB    | Supabase (PostgreSQL)                             |
| Auth            | Supabase Auth — Email/Password + Google OAuth 2.0 |
| State           | React Context API                                 |
| Version Control | Git + GitHub                                      |
| Deployment      | Vercel                                            |
| Testing         | Vitest + React Testing Library                    |

---

## Project Overview

The Hope, Inc. SMS manages sales transactions and their line items from the HopeDB database. The `sales` and `salesDetail` tables support full CRUD with soft-delete. The `customer`, `employee`, `product`, and `priceHist` tables are read-only lookup references used to populate dropdowns and enrich displayed data — the application never writes to them.

### Core Rules

- **No hard deletes** — all removals set `record_status = 'INACTIVE'` on `sales` or `salesDetail`
- **INACTIVE records are invisible to USER accounts** in all views, lists, and lookups
- **Only ADMIN and SUPERADMIN** can see INACTIVE records and recover them
- **customer, employee, product, priceHist are LOOKUP-ONLY** — no add, edit, or delete through the app
- **ADMIN cannot modify SUPERADMIN accounts** — enforced at both UI and RLS level
- **Cascade soft-delete** — soft-deleting a `sales` row automatically sets all its `salesDetail` rows to INACTIVE; recovery restores both

---

## Database — 6 Tables

| Table         | Role                         | CRUD / Lookup | Seed Records |
| ------------- | ---------------------------- | ------------- | ------------ |
| `sales`       | Primary — transactions       | Full CRUD     | 124 rows     |
| `salesDetail` | Primary — line items         | Full CRUD     | ~310 rows    |
| `customer`    | Lookup — custNo dropdown     | SELECT only   | 82 rows      |
| `employee`    | Lookup — empNo dropdown      | SELECT only   | 31 rows      |
| `product`     | Lookup — prodCode dropdown   | SELECT only   | 52 rows      |
| `priceHist`   | Lookup — unit price autofill | SELECT only   | ~70 rows     |

---

## Role-Based Access Control

3 user types × 13 rights. New users are provisioned as USER / INACTIVE pending admin activation.

| Right        | SUPERADMIN | ADMIN | USER |
| ------------ | :--------: | :---: | :--: |
| SALES_VIEW   |     ✅     |  ✅   |  ✅  |
| SALES_ADD    |     ✅     |  ✅   |  ✅  |
| SALES_EDIT   |     ✅     |  ✅   |  ❌  |
| SALES_DEL    |     ✅     |  ❌   |  ❌  |
| SD_VIEW      |     ✅     |  ✅   |  ✅  |
| SD_ADD       |     ✅     |  ✅   |  ✅  |
| SD_EDIT      |     ✅     |  ✅   |  ❌  |
| SD_DEL       |     ✅     |  ❌   |  ❌  |
| CUST_LOOKUP  |     ✅     |  ✅   |  ✅  |
| EMP_LOOKUP   |     ✅     |  ✅   |  ✅  |
| PROD_LOOKUP  |     ✅     |  ✅   |  ✅  |
| PRICE_LOOKUP |     ✅     |  ✅   |  ✅  |
| ADM_USER     |     ✅     |  ✅   |  ❌  |

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/AldroNathanielAltar/SalesManagementSystem.git
cd SalesManagementSystem
git checkout dev
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Start the dev server

```bash
npm run dev
```

Open http://localhost:5173

### 5. Run tests

```bash
npm run test:run
```

Expected output: **158 tests passing across 3 test files.**

---

## Test Coverage

| Test File                         |  Tests  | Coverage                                                                                                                                                                |
| --------------------------------- | :-----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sprint1-auth-flows.test.jsx`     |    6    | Email auth, Google OAuth, login guard                                                                                                                                   |
| `sprint2-rights.test.jsx`         |   41    | 39-case RBAC matrix + DB integrity                                                                                                                                      |
| `sprint3-e2e-production.test.jsx` |   111   | Sales CRUD, SalesDetail CRUD, Lookups, Price auto-fill, Cascade soft-delete & recovery, Reports, Admin module, SUPERADMIN protection, No hard deletes, Stamp visibility |
| **Total**                         | **158** | **100% passing**                                                                                                                                                        |

---

## Git Branching Strategy

```
main    ← production releases only
dev     ← stable base — all work branches fork from here
feat/*  ← new features
fix/*   ← bug fixes
db/*    ← database changes
test/*  ← test files
docs/*  ← documentation
chore/* ← config, tooling, deployment
```

**Rules:**

- Never push directly to `main` or `dev`
- PRs require at least 1 approval
- Delete feature branches after merge
- Flow: `feature branch` → PR → `dev` → release PR → `main`

---

## Project Structure

```
src/
├── assets/
├── components/
├── context/
├── data/
├── layouts/
├── lib/
├── pages/
├── services/
├── test/
│   └── (sprint tests)
├── App.jsx
├── App.css
├── main.jsx
└── index.css
db/
└── migrations/
docs/
└── (sprint logs, ERD, user manual)
```

---

## Sprint Summary

| Sprint   | Theme                                                     | Duration              | Tests |
| -------- | --------------------------------------------------------- | --------------------- | :---: |
| Sprint 1 | Project setup, database, authentication                   | Mar 25 – Mar 31, 2026 |   6   |
| Sprint 2 | RBAC, Sales CRUD, lookup integration, cascade soft-delete | Apr 1 – Apr 7, 2026   |  47   |
| Sprint 3 | Reports, Admin module, deployment, final documentation    | Apr 8 – Apr 14, 2026  |  158  |
