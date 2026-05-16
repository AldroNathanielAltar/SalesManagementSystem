# Sprint 2 Log — HopeINC Sales Management System

**Sprint Duration:** April 1, 2026 – April 7, 2026
**Theme:** Role-Based Access Control (RBAC) & Database Integration
**Prepared by:** Ven Angel Tagaro (M5 – QA / Documentation)

---

## Team Members

| Member | Name              | Role                                |
| ------ | ----------------- | ----------------------------------- |
| M1     | Aldro Altar       | Project Lead / Full-Stack Developer |
| M2     | Thyrone Ascunsion | Frontend Developer (UI/UX)          |
| M3     | Josh Singson      | Backend / Database Engineer         |
| M4     | Cyden Centeno     | Rights & Authentication Specialist  |
| M5     | Ven Angel Tagaro  | QA / Documentation Specialist       |

---

## Tasks Completed

### M5 — Ven Angel Tagaro

- ✅ **Pre-Implementation Audit:** Defined 39-point Rights Matrix via Vitest.
- ✅ **Database Integration Testing:** Validated Soft-Delete and Price Auto-fill logic.
- ✅ **Regression Testing:** Confirmed Sprint 1 Auth flows remain functional (47/47 Total Tests Passing).
- ✅ **Sprint 2 Documentation:** Sprint 2 test plan and log completed.

---

## Test Results

| Test File                     | Total Tests |     Status     |
| :---------------------------- | :---------: | :------------: |
| `sprint1-auth-flows.test.jsx` |      6      |    ✅ PASS     |
| `sprint2-rights.test.jsx`     |     41      |    ✅ PASS     |
| **Total Coverage**            |   **47**    | **100% Green** |

---

## Blockers

| Blocker                             | Affected Member | Status                                  |
| :---------------------------------- | :-------------- | :-------------------------------------- |
| Integration with real `AuthContext` | M5              | ✅ Resolved — M4 merged before Sprint 3 |

---

## Goals for Sprint 3

- Transition tests from mocked logic to real Context providers.
- Full E2E production test suite covering Sales CRUD, SalesDetail CRUD, Lookups, Reports, Admin Module, SUPERADMIN protection, cascade soft-delete and recovery.
- Complete final documentation (User Manual, Presentation Slides, Sprint 3 Log).
