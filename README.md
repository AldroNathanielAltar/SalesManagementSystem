# Hope, Inc. — Sales Management System

> BS Information Technology Capstone | New Era University — CCS | AY 2025–2026

---

## Team

| Label | Role |
|-------|------|
| M1 | Project Lead / Full-Stack Developer |
| M2 | Frontend Developer (UI/UX) |
| M3 | Backend / Database Engineer |
| M4 | Rights & Auth Specialist |
| M5 | QA / Documentation |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth — Email/Password + Google OAuth 2.0 |
| State | React Context API |
| Version Control | Git + GitHub |
| Deployment | Vercel / Netlify |
| Testing | Vitest + React Testing Library |

---

## Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/aldro13-tech/SalesManagementSystem.git
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

---

## Git Branching Strategy
```
main   ← production releases only
dev    ← stable base — all work branches fork from here
feat/* ← new features
fix/*  ← bug fixes
db/*   ← database changes
test/* ← test files
docs/* ← documentation
chore/*← config, tooling, deployment
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
├── lib/
│   └── supabaseClient.js
├── context/
│   └── AuthContext.jsx
├── components/
│   └── ProtectedRoute.jsx
├── pages/
│   └── (all page components)
├── test/
│   └── setup.js
├── App.jsx
├── main.jsx
└── index.css
```

---

## Core Rules

- No hard deletes — all removals set `record_status = 'INACTIVE'`
- INACTIVE records are invisible to USER accounts
- customer, employee, product, priceHist are LOOKUP-ONLY
- ADMIN cannot modify SUPERADMIN accounts