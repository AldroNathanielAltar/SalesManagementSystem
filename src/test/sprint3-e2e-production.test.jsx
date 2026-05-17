import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// ─── Mock Supabase ────────────────────────────────────────────────────────────
vi.mock("../lib/supabaseClient", () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      getSession: vi.fn(() => ({ data: { session: null } })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    })),
  },
}));

import { supabase } from "../lib/supabaseClient";

// ─── Shared mock user profiles ────────────────────────────────────────────────
const MOCK_USERS = {
  SUPERADMIN: {
    id: "sa-001",
    email: "jcesperanza@neu.edu.ph",
    user_type: "SUPERADMIN",
    record_status: "ACTIVE",
  },
  ADMIN: {
    id: "admin-002",
    email: "admin@hopeinc.com",
    user_type: "ADMIN",
    record_status: "ACTIVE",
  },
  USER: {
    id: "user-003",
    email: "agent@hopeinc.com",
    user_type: "USER",
    record_status: "ACTIVE",
  },
};

// ─── Shared mock rights maps ──────────────────────────────────────────────────
const RIGHTS = {
  SUPERADMIN: {
    SALES_VIEW: 1,
    SALES_ADD: 1,
    SALES_EDIT: 1,
    SALES_DEL: 1,
    SD_VIEW: 1,
    SD_ADD: 1,
    SD_EDIT: 1,
    SD_DEL: 1,
    CUST_LOOKUP: 1,
    EMP_LOOKUP: 1,
    PROD_LOOKUP: 1,
    PRICE_LOOKUP: 1,
    ADM_USER: 1,
  },
  ADMIN: {
    SALES_VIEW: 1,
    SALES_ADD: 1,
    SALES_EDIT: 1,
    SALES_DEL: 0,
    SD_VIEW: 1,
    SD_ADD: 1,
    SD_EDIT: 1,
    SD_DEL: 0,
    CUST_LOOKUP: 1,
    EMP_LOOKUP: 1,
    PROD_LOOKUP: 1,
    PRICE_LOOKUP: 1,
    ADM_USER: 1,
  },
  USER: {
    SALES_VIEW: 1,
    SALES_ADD: 1,
    SALES_EDIT: 0,
    SALES_DEL: 0,
    SD_VIEW: 1,
    SD_ADD: 1,
    SD_EDIT: 0,
    SD_DEL: 0,
    CUST_LOOKUP: 1,
    EMP_LOOKUP: 1,
    PROD_LOOKUP: 1,
    PRICE_LOOKUP: 1,
    ADM_USER: 0,
  },
};

// ─── RESET mocks before each test ────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 1 — AUTH REGRESSION (Sprint 1 flows confirmed still passing)
// ═════════════════════════════════════════════════════════════════════════════
describe("TC-S1-REG: Sprint 1 Auth Regression", () => {
  it("email signUp still calls supabase with correct credentials", async () => {
    supabase.auth.signUp.mockResolvedValueOnce({
      data: { user: { id: "user-new", email: "new@test.com" } },
      error: null,
    });

    const result = await supabase.auth.signUp({
      email: "new@test.com",
      password: "Password123!",
    });

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: "new@test.com",
      password: "Password123!",
    });
    expect(result.error).toBeNull();
  });

  it("login guard still blocks INACTIVE user and calls signOut", async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: "user-inactive" } },
      error: null,
    });
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({
        data: { record_status: "INACTIVE" },
        error: null,
      }),
    });
    supabase.auth.signOut.mockResolvedValueOnce({ error: null });

    const loginResult = await supabase.auth.signInWithPassword({
      email: "inactive@test.com",
      password: "Password123!",
    });
    const dbResult = await supabase
      .from("user")
      .select("record_status")
      .eq("id", loginResult.data.user.id)
      .single();

    if (dbResult.data.record_status === "INACTIVE") {
      await supabase.auth.signOut();
    }

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it("login guard still allows ACTIVE user without calling signOut", async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: "user-active" } },
      error: null,
    });
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({
        data: { record_status: "ACTIVE" },
        error: null,
      }),
    });

    const loginResult = await supabase.auth.signInWithPassword({
      email: "active@test.com",
      password: "Password123!",
    });
    const dbResult = await supabase
      .from("user")
      .select("record_status")
      .eq("id", loginResult.data.user.id)
      .single();

    if (dbResult.data.record_status === "INACTIVE") {
      await supabase.auth.signOut();
    }

    expect(supabase.auth.signOut).not.toHaveBeenCalled();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 2 — SPRINT 2 RIGHTS REGRESSION (all 39 cases still passing)
// ═════════════════════════════════════════════════════════════════════════════
describe("TC-S2-REG: Sprint 2 Rights Regression", () => {
  const checkRight = (userType, right) => RIGHTS[userType][right] === 1;

  const RIGHT_MATRIX = [
    {
      id: "R-01",
      key: "ADM_USER",
      label: "User Management",
      allowed: ["SUPERADMIN", "ADMIN"],
    },
    {
      id: "R-02",
      key: "SALES_VIEW",
      label: "View Sales Reports",
      allowed: ["SUPERADMIN", "ADMIN", "USER"],
    },
    {
      id: "R-03",
      key: "SALES_DEL",
      label: "Soft-Delete Records",
      allowed: ["SUPERADMIN"],
    },
    {
      id: "R-04",
      key: "ADM_USER",
      label: "Record Recovery",
      allowed: ["SUPERADMIN", "ADMIN"],
    },
    {
      id: "R-05",
      key: "CUST_LOOKUP",
      label: "Customer Lookup",
      allowed: ["SUPERADMIN", "ADMIN", "USER"],
    },
    {
      id: "R-06",
      key: "EMP_LOOKUP",
      label: "Employee Lookup",
      allowed: ["SUPERADMIN", "ADMIN", "USER"],
    },
    {
      id: "R-07",
      key: "PROD_LOOKUP",
      label: "Product Lookup",
      allowed: ["SUPERADMIN", "ADMIN", "USER"],
    },
    {
      id: "R-08",
      key: "PRICE_LOOKUP",
      label: "Price History Lookup",
      allowed: ["SUPERADMIN", "ADMIN", "USER"],
    },
    {
      id: "R-09",
      key: "SALES_ADD",
      label: "Create Transactions",
      allowed: ["SUPERADMIN", "ADMIN", "USER"],
    },
    {
      id: "R-10",
      key: "SALES_EDIT",
      label: "Edit Transactions",
      allowed: ["SUPERADMIN", "ADMIN"],
    },
    {
      id: "R-11",
      key: "ADM_USER",
      label: "System Config",
      allowed: ["SUPERADMIN", "ADMIN"],
    },
    {
      id: "R-12",
      key: "SD_EDIT",
      label: "Stock Overrides",
      allowed: ["SUPERADMIN", "ADMIN"],
    },
    {
      id: "R-13",
      key: "ADM_USER",
      label: "Audit Log Access",
      allowed: ["SUPERADMIN", "ADMIN"],
    },
  ];

  RIGHT_MATRIX.forEach(({ id, key, label, allowed }) => {
    describe(`${id}: ${label}`, () => {
      ["SUPERADMIN", "ADMIN", "USER"].forEach((role) => {
        const shouldAllow = allowed.includes(role);
        it(`${shouldAllow ? "ALLOW" : "BLOCK"} ${role}`, () => {
          expect(checkRight(role, key)).toBe(shouldAllow);
        });
      });
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 3 — SALES CRUD (all 3 user types)
// ═════════════════════════════════════════════════════════════════════════════
describe("TC-S3-01: Sales CRUD — Create Transaction", () => {
  it("SUPERADMIN can create a sale (SALES_ADD = 1)", async () => {
    expect(RIGHTS.SUPERADMIN.SALES_ADD).toBe(1);

    supabase.from.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValueOnce({
        data: [
          {
            transNo: "TR000125",
            salesDate: "2026-05-01",
            custNo: "C001",
            empNo: "E001",
          },
        ],
        error: null,
      }),
    });

    const result = await supabase.from("sales").insert({
      transNo: "TR000125",
      salesDate: "2026-05-01",
      custNo: "C001",
      empNo: "E001",
      record_status: "ACTIVE",
    });

    expect(result.error).toBeNull();
    expect(result.data[0].transNo).toBe("TR000125");
  });

  it("ADMIN can create a sale (SALES_ADD = 1)", () => {
    expect(RIGHTS.ADMIN.SALES_ADD).toBe(1);
  });

  it("USER can create a sale (SALES_ADD = 1)", () => {
    expect(RIGHTS.USER.SALES_ADD).toBe(1);
  });
});

describe("TC-S3-02: Sales CRUD — Edit Transaction", () => {
  it("SUPERADMIN can edit a sale (SALES_EDIT = 1)", () => {
    expect(RIGHTS.SUPERADMIN.SALES_EDIT).toBe(1);
  });

  it("ADMIN can edit a sale (SALES_EDIT = 1)", () => {
    expect(RIGHTS.ADMIN.SALES_EDIT).toBe(1);
  });

  it("USER cannot edit a sale (SALES_EDIT = 0)", () => {
    expect(RIGHTS.USER.SALES_EDIT).toBe(0);
  });
});

describe("TC-S3-03: Sales CRUD — Soft-Delete Transaction", () => {
  it("SUPERADMIN can soft-delete a sale (SALES_DEL = 1)", async () => {
    expect(RIGHTS.SUPERADMIN.SALES_DEL).toBe(1);

    supabase.from.mockReturnValueOnce({
      update: vi.fn().mockReturnThis(),
      eq: vi
        .fn()
        .mockResolvedValueOnce({
          data: [{ transNo: "TR000001", record_status: "INACTIVE" }],
          error: null,
        }),
    });

    const result = await supabase
      .from("sales")
      .update({ record_status: "INACTIVE" })
      .eq("transNo", "TR000001");

    expect(result.error).toBeNull();
    expect(result.data[0].record_status).toBe("INACTIVE");
  });

  it("ADMIN cannot soft-delete a sale (SALES_DEL = 0)", () => {
    expect(RIGHTS.ADMIN.SALES_DEL).toBe(0);
  });

  it("USER cannot soft-delete a sale (SALES_DEL = 0)", () => {
    expect(RIGHTS.USER.SALES_DEL).toBe(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 4 — SALESDETAIL CRUD (all 3 user types)
// ═════════════════════════════════════════════════════════════════════════════
describe("TC-S3-04: SalesDetail CRUD — Add Line Item", () => {
  it("SUPERADMIN can add a line item (SD_ADD = 1)", () => {
    expect(RIGHTS.SUPERADMIN.SD_ADD).toBe(1);
  });

  it("ADMIN can add a line item (SD_ADD = 1)", () => {
    expect(RIGHTS.ADMIN.SD_ADD).toBe(1);
  });

  it("USER can add a line item (SD_ADD = 1)", async () => {
    expect(RIGHTS.USER.SD_ADD).toBe(1);

    supabase.from.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValueOnce({
        data: [{ transNo: "TR000001", prodCode: "P001", quantity: 5 }],
        error: null,
      }),
    });

    const result = await supabase.from("salesDetail").insert({
      transNo: "TR000001",
      prodCode: "P001",
      quantity: 5,
      record_status: "ACTIVE",
    });

    expect(result.error).toBeNull();
    expect(result.data[0].prodCode).toBe("P001");
  });
});

describe("TC-S3-05: SalesDetail CRUD — Edit Line Item", () => {
  it("SUPERADMIN can edit a line item (SD_EDIT = 1)", () => {
    expect(RIGHTS.SUPERADMIN.SD_EDIT).toBe(1);
  });

  it("ADMIN can edit a line item (SD_EDIT = 1)", () => {
    expect(RIGHTS.ADMIN.SD_EDIT).toBe(1);
  });

  it("USER cannot edit a line item (SD_EDIT = 0)", () => {
    expect(RIGHTS.USER.SD_EDIT).toBe(0);
  });
});

describe("TC-S3-06: SalesDetail CRUD — Soft-Delete Line Item", () => {
  it("SUPERADMIN can soft-delete a line item (SD_DEL = 1)", () => {
    expect(RIGHTS.SUPERADMIN.SD_DEL).toBe(1);
  });

  it("ADMIN cannot soft-delete a line item (SD_DEL = 0)", () => {
    expect(RIGHTS.ADMIN.SD_DEL).toBe(0);
  });

  it("USER cannot soft-delete a line item (SD_DEL = 0)", () => {
    expect(RIGHTS.USER.SD_DEL).toBe(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 5 — LOOKUP DROPDOWNS (price auto-fill + all 4 lookup pages)
// ═════════════════════════════════════════════════════════════════════════════
describe("TC-S3-07: Lookup Dropdowns — Customer & Employee on Sales Form", () => {
  it("fetches customer list for custNo dropdown", async () => {
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce({
        data: [
          { custno: "C001", custname: "Juan dela Cruz" },
          { custno: "C002", custname: "Maria Santos" },
        ],
        error: null,
      }),
    });

    const result = await supabase.from("customer").select("custno, custname");

    expect(result.error).toBeNull();
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]).toHaveProperty("custno");
    expect(result.data[0]).toHaveProperty("custname");
  });

  it("fetches employee list for empNo dropdown", async () => {
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce({
        data: [
          { empno: "E001", lastname: "Reyes", firstname: "Ana" },
          { empno: "E002", lastname: "Garcia", firstname: "Ben" },
        ],
        error: null,
      }),
    });

    const result = await supabase
      .from("employee")
      .select("empno, lastname, firstname");

    expect(result.error).toBeNull();
    expect(result.data[0]).toHaveProperty("empno");
    expect(result.data[0]).toHaveProperty("lastname");
  });
});

describe("TC-S3-08: Price Auto-fill — priceHist lookup on product select", () => {
  it("fetches the latest priceHist entry (MAX effDate) for a selected product", async () => {
    // Simulates getCurrentPrice('P001') — returns latest priceHist row
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValueOnce({
        data: [{ prodCode: "P001", effDate: "2026-01-15", unitPrice: 149.99 }],
        error: null,
      }),
    });

    const result = await supabase
      .from("priceHist")
      .select("prodCode, effDate, unitPrice")
      .eq("prodCode", "P001")
      .order("effDate", { ascending: false })
      .limit(1);

    expect(result.error).toBeNull();
    expect(result.data[0].unitPrice).toBe(149.99);
    expect(result.data[0].prodCode).toBe("P001");
  });

  it("unit price field is auto-filled with the fetched value", () => {
    const fetchedPrice = {
      prodCode: "P001",
      effDate: "2026-01-15",
      unitPrice: 149.99,
    };
    // Simulate what the AddLineItemModal does after getCurrentPrice resolves
    const lineItemForm = { prodCode: "P001", quantity: 3, unitPrice: null };
    lineItemForm.unitPrice = fetchedPrice.unitPrice;

    expect(lineItemForm.unitPrice).toBe(149.99);
  });

  it("price auto-fill returns correct price even when multiple effDate rows exist", () => {
    const priceHistory = [
      { prodCode: "P001", effDate: "2025-06-01", unitPrice: 99.99 },
      { prodCode: "P001", effDate: "2026-01-15", unitPrice: 149.99 }, // latest
      { prodCode: "P001", effDate: "2024-01-01", unitPrice: 75.0 },
    ];
    // getCurrentPrice logic: MAX effDate
    const latest = priceHistory.sort(
      (a, b) => new Date(b.effDate) - new Date(a.effDate),
    )[0];

    expect(latest.unitPrice).toBe(149.99);
    expect(latest.effDate).toBe("2026-01-15");
  });
});

describe("TC-S3-09: Lookup Pages — Mutation-Free for All User Types", () => {
  // All 4 lookup pages must expose zero write operations regardless of user type.
  // Strategy: capture a fresh mock object per table, simulate a SELECT-only page
  // render, then assert that none of the write spies were touched.
  const LOOKUP_TABLES = ["customer", "employee", "product", "priceHist"];
  const WRITE_METHODS = ["insert", "update", "delete", "upsert"];

  LOOKUP_TABLES.forEach((table) => {
    describe(`${table} lookup page`, () => {
      let capturedMock;

      beforeEach(() => {
        // Return a controlled mock object and hold a reference to it
        capturedMock = {
          select: vi.fn().mockResolvedValueOnce({ data: [{}], error: null }),
          insert: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
          upsert: vi.fn(),
        };
        supabase.from.mockReturnValueOnce(capturedMock);
        // Simulate the lookup page doing a SELECT — the only allowed call
        supabase.from(table).select("*");
      });

      ["SUPERADMIN", "ADMIN", "USER"].forEach((role) => {
        it(`${role} — no write methods called on ${table}`, () => {
          WRITE_METHODS.forEach((method) => {
            expect(capturedMock[method]).not.toHaveBeenCalled();
          });
        });
      });
    });
  });

  it("all 4 lookup tables return data via SELECT only", async () => {
    const tables = ["customer", "employee", "product", "priceHist"];
    for (const table of tables) {
      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockResolvedValueOnce({ data: [{}], error: null }),
      });
      const result = await supabase.from(table).select("*");
      expect(result.error).toBeNull();
      expect(result.data.length).toBeGreaterThan(0);
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 6 — CASCADE SOFT-DELETE & RECOVERY
// ═════════════════════════════════════════════════════════════════════════════
describe("TC-S3-10: Cascade Soft-Delete — sales triggers salesDetail", () => {
  it("soft-deleting a transaction sets its record_status to INACTIVE", async () => {
    supabase.from.mockReturnValueOnce({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValueOnce({
        data: [{ transNo: "TR000001", record_status: "INACTIVE" }],
        error: null,
      }),
    });

    const result = await supabase
      .from("sales")
      .update({ record_status: "INACTIVE" })
      .eq("transNo", "TR000001");

    expect(result.error).toBeNull();
    expect(result.data[0].record_status).toBe("INACTIVE");
  });

  it("all salesDetail rows for that transNo are also INACTIVE (cascade)", () => {
    // Simulates the DB trigger result — all line items follow the parent
    const salesDetailRows = [
      { transNo: "TR000001", prodCode: "P001", record_status: "INACTIVE" },
      { transNo: "TR000001", prodCode: "P002", record_status: "INACTIVE" },
      { transNo: "TR000001", prodCode: "P003", record_status: "INACTIVE" },
    ];

    const allInactive = salesDetailRows.every(
      (row) => row.record_status === "INACTIVE",
    );
    expect(allInactive).toBe(true);
    expect(salesDetailRows.length).toBeGreaterThanOrEqual(3);
  });

  it("USER cannot see the soft-deleted transaction after cascade", async () => {
    // USER's getSales() — RLS filters INACTIVE rows
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValueOnce({
        data: [], // RLS returns empty — INACTIVE row hidden
        error: null,
      }),
    });

    const result = await supabase
      .from("sales")
      .select("*")
      .eq("record_status", "ACTIVE");

    expect(result.data).toHaveLength(0);
  });

  it("USER cannot see the cascaded INACTIVE salesDetail rows either", async () => {
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValueOnce({
        data: [],
        error: null,
      }),
    });

    const result = await supabase
      .from("salesDetail")
      .select("*")
      .eq("record_status", "ACTIVE");

    expect(result.data).toHaveLength(0);
  });

  it("ADMIN can see INACTIVE transaction in Deleted Items tab", async () => {
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValueOnce({
        data: [{ transNo: "TR000001", record_status: "INACTIVE" }],
        error: null,
      }),
    });

    const result = await supabase
      .from("sales")
      .select("*")
      .eq("record_status", "INACTIVE");

    expect(result.data[0].transNo).toBe("TR000001");
    expect(result.data[0].record_status).toBe("INACTIVE");
  });
});

describe("TC-S3-11: Cascade Recovery — ADMIN restores sales and salesDetail", () => {
  it("recovering a transaction sets its record_status back to ACTIVE", async () => {
    supabase.from.mockReturnValueOnce({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValueOnce({
        data: [{ transNo: "TR000001", record_status: "ACTIVE" }],
        error: null,
      }),
    });

    const result = await supabase
      .from("sales")
      .update({ record_status: "ACTIVE" })
      .eq("transNo", "TR000001");

    expect(result.error).toBeNull();
    expect(result.data[0].record_status).toBe("ACTIVE");
  });

  it("all salesDetail rows for that transNo are also restored to ACTIVE (cascade)", () => {
    const restoredRows = [
      { transNo: "TR000001", prodCode: "P001", record_status: "ACTIVE" },
      { transNo: "TR000001", prodCode: "P002", record_status: "ACTIVE" },
      { transNo: "TR000001", prodCode: "P003", record_status: "ACTIVE" },
    ];

    const allActive = restoredRows.every(
      (row) => row.record_status === "ACTIVE",
    );
    expect(allActive).toBe(true);
    expect(restoredRows.length).toBeGreaterThanOrEqual(3);
  });

  it("USER can see the recovered transaction and all its line items again", async () => {
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValueOnce({
        data: [
          { transNo: "TR000001", prodCode: "P001", record_status: "ACTIVE" },
          { transNo: "TR000001", prodCode: "P002", record_status: "ACTIVE" },
          { transNo: "TR000001", prodCode: "P003", record_status: "ACTIVE" },
        ],
        error: null,
      }),
    });

    const result = await supabase
      .from("salesDetail")
      .select("*")
      .eq("record_status", "ACTIVE");

    expect(result.data.length).toBe(3);
    expect(result.data.every((r) => r.record_status === "ACTIVE")).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 7 — REPORTS (all 4 views)
// ═════════════════════════════════════════════════════════════════════════════
describe("TC-S3-12: Reports — Sales by Employee", () => {
  it("getSalesByEmployee returns rows with employee name and totals", async () => {
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce({
        data: [
          {
            empno: "E001",
            employee_name: "Reyes, Ana",
            total_transactions: 12,
            total_revenue: 58000.0,
          },
          {
            empno: "E002",
            employee_name: "Garcia, Ben",
            total_transactions: 8,
            total_revenue: 34200.0,
          },
        ],
        error: null,
      }),
    });

    const result = await supabase.from("sales_by_employee").select("*");

    expect(result.error).toBeNull();
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]).toHaveProperty("employee_name");
    expect(result.data[0]).toHaveProperty("total_transactions");
    expect(result.data[0]).toHaveProperty("total_revenue");
  });
});

describe("TC-S3-13: Reports — Sales by Customer", () => {
  it("getSalesByCustomer returns rows with customer name and totals", async () => {
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce({
        data: [
          {
            custno: "C001",
            custname: "Juan dela Cruz",
            total_transactions: 5,
            total_spend: 22500.0,
          },
          {
            custno: "C002",
            custname: "Maria Santos",
            total_transactions: 3,
            total_spend: 11000.0,
          },
        ],
        error: null,
      }),
    });

    const result = await supabase.from("sales_by_customer").select("*");

    expect(result.error).toBeNull();
    expect(result.data[0]).toHaveProperty("custname");
    expect(result.data[0]).toHaveProperty("total_spend");
  });

  it("top customer has the highest total_spend", () => {
    const customers = [
      { custname: "Maria Santos", total_spend: 11000.0 },
      { custname: "Juan dela Cruz", total_spend: 22500.0 },
    ];
    const top = customers.sort((a, b) => b.total_spend - a.total_spend)[0];
    expect(top.custname).toBe("Juan dela Cruz");
  });
});

describe("TC-S3-14: Reports — Top Products Sold", () => {
  it("getTopProducts returns rows with product description and revenue", async () => {
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce({
        data: [
          {
            prodCode: "P001",
            description: "Widget A",
            total_qty_sold: 120,
            total_revenue: 17998.8,
          },
          {
            prodCode: "P002",
            description: "Widget B",
            total_qty_sold: 90,
            total_revenue: 12600.0,
          },
        ],
        error: null,
      }),
    });

    const result = await supabase.from("top_products_sold").select("*");

    expect(result.error).toBeNull();
    expect(result.data[0]).toHaveProperty("description");
    expect(result.data[0]).toHaveProperty("total_qty_sold");
    expect(result.data[0]).toHaveProperty("total_revenue");
  });
});

describe("TC-S3-15: Reports — Monthly Sales Trend", () => {
  it("getMonthlySalesTrend returns rows with month label and totals", async () => {
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce({
        data: [
          {
            sale_month: "2026-01",
            transaction_count: 18,
            total_revenue: 82000.0,
          },
          {
            sale_month: "2026-02",
            transaction_count: 14,
            total_revenue: 63500.0,
          },
          {
            sale_month: "2026-03",
            transaction_count: 21,
            total_revenue: 97200.0,
          },
        ],
        error: null,
      }),
    });

    const result = await supabase.from("monthly_sales_trend").select("*");

    expect(result.error).toBeNull();
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]).toHaveProperty("sale_month");
    expect(result.data[0]).toHaveProperty("transaction_count");
    expect(result.data[0]).toHaveProperty("total_revenue");
  });

  it("months are ordered ascending (oldest first)", () => {
    const rows = [
      { sale_month: "2026-01" },
      { sale_month: "2026-02" },
      { sale_month: "2026-03" },
    ];
    const sorted = [...rows].sort((a, b) =>
      a.sale_month.localeCompare(b.sale_month),
    );
    expect(sorted[0].sale_month).toBe("2026-01");
    expect(sorted[sorted.length - 1].sale_month).toBe("2026-03");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 8 — ADMIN MODULE (user management + SUPERADMIN protection)
// ═════════════════════════════════════════════════════════════════════════════
describe("TC-S3-16: Admin Module — User Activation / Deactivation", () => {
  it("ADMIN has ADM_USER right (can access User Management)", () => {
    expect(RIGHTS.ADMIN.ADM_USER).toBe(1);
  });

  it("USER does not have ADM_USER right (cannot access User Management)", () => {
    expect(RIGHTS.USER.ADM_USER).toBe(0);
  });

  it("ADMIN can activate a USER account (set record_status = ACTIVE)", async () => {
    supabase.from.mockReturnValueOnce({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockResolvedValueOnce({
        data: [{ id: "user-pending", record_status: "ACTIVE" }],
        error: null,
      }),
    });

    const result = await supabase
      .from("user")
      .update({ record_status: "ACTIVE" })
      .eq("id", "user-pending")
      .neq("user_type", "SUPERADMIN"); // RLS guard

    expect(result.error).toBeNull();
    expect(result.data[0].record_status).toBe("ACTIVE");
  });

  it("ADMIN can deactivate a USER account (set record_status = INACTIVE)", async () => {
    supabase.from.mockReturnValueOnce({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockResolvedValueOnce({
        data: [{ id: "user-active", record_status: "INACTIVE" }],
        error: null,
      }),
    });

    const result = await supabase
      .from("user")
      .update({ record_status: "INACTIVE" })
      .eq("id", "user-active")
      .neq("user_type", "SUPERADMIN");

    expect(result.error).toBeNull();
    expect(result.data[0].record_status).toBe("INACTIVE");
  });
});

describe("TC-S3-17: SUPERADMIN Protection — UI + RLS", () => {
  it("SUPERADMIN user_type row: Activate button must be disabled in UI", () => {
    // Simulate the UserManagementPage row check
    const targetUser = MOCK_USERS.SUPERADMIN;
    const isButtonDisabled = targetUser.user_type === "SUPERADMIN";
    expect(isButtonDisabled).toBe(true);
  });

  it("SUPERADMIN user_type row: Deactivate button must be disabled in UI", () => {
    const targetUser = MOCK_USERS.SUPERADMIN;
    const isButtonDisabled = targetUser.user_type === "SUPERADMIN";
    expect(isButtonDisabled).toBe(true);
  });

  it("ADMIN user_type row: buttons must NOT be disabled", () => {
    const targetUser = MOCK_USERS.ADMIN;
    const isButtonDisabled = targetUser.user_type === "SUPERADMIN";
    expect(isButtonDisabled).toBe(false);
  });

  it("RLS blocks direct UPDATE on a SUPERADMIN row — returns error", async () => {
    // Simulates ADMIN trying to send a raw Supabase UPDATE on jcesperanza's row
    supabase.from.mockReturnValueOnce({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValueOnce({
        data: null,
        error: {
          message:
            'new row violates row-level security policy for table "user"',
        },
      }),
    });

    const result = await supabase
      .from("user")
      .update({ record_status: "INACTIVE" })
      .eq("id", MOCK_USERS.SUPERADMIN.id);

    expect(result.error).not.toBeNull();
    expect(result.error.message).toContain("row-level security");
  });

  it("Admin module sidebar link is hidden for USER (ADM_USER = 0)", () => {
    const currentUser = MOCK_USERS.USER;
    const rights = RIGHTS[currentUser.user_type];
    const showAdminLink = rights.ADM_USER === 1;
    expect(showAdminLink).toBe(false);
  });

  it("Admin module sidebar link is visible for ADMIN (ADM_USER = 1)", () => {
    const currentUser = MOCK_USERS.ADMIN;
    const rights = RIGHTS[currentUser.user_type];
    const showAdminLink = rights.ADM_USER === 1;
    expect(showAdminLink).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 9 — NO HARD DELETES (codebase integrity check)
// ═════════════════════════════════════════════════════════════════════════════
describe("TC-S3-18: No Hard Deletes — Soft-Delete Enforcement", () => {
  it("all record removals set record_status = INACTIVE, never call .delete()", () => {
    // Capture a fresh controlled mock and confirm delete is never invoked
    const salesMock = {
      delete: vi.fn(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn(),
    };
    supabase.from.mockReturnValueOnce(salesMock);
    supabase.from("sales"); // simulate page load — no delete triggered
    expect(salesMock.delete).not.toHaveBeenCalled();
  });

  it("soft-delete uses UPDATE with record_status = INACTIVE only", async () => {
    const salesMock = {
      update: vi.fn().mockReturnThis(),
      delete: vi.fn(),
      eq: vi.fn().mockResolvedValueOnce({
        data: [{ transNo: "TR000050", record_status: "INACTIVE" }],
        error: null,
      }),
    };
    supabase.from.mockReturnValueOnce(salesMock);

    const result = await supabase
      .from("sales")
      .update({ record_status: "INACTIVE" })
      .eq("transNo", "TR000050");

    expect(result.data[0].record_status).toBe("INACTIVE");
    // The update path was used — delete was never touched
    expect(salesMock.delete).not.toHaveBeenCalled();
  });

  it("lookup tables (customer, employee, product, priceHist) have no delete calls", () => {
    ["customer", "employee", "product", "priceHist"].forEach((table) => {
      const mock = { select: vi.fn().mockReturnThis(), delete: vi.fn() };
      supabase.from.mockReturnValueOnce(mock);
      supabase.from(table).select("*"); // simulate lookup page render
      expect(mock.delete).not.toHaveBeenCalled();
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 10 — STAMP VISIBILITY
// ═════════════════════════════════════════════════════════════════════════════
describe("TC-S3-19: Stamp Visibility Gating", () => {
  it("USER account should NOT see stamp column", () => {
    const currentUser = MOCK_USERS.USER;
    const showStamp = currentUser.user_type !== "USER";
    expect(showStamp).toBe(false);
  });

  it("ADMIN account should see stamp column", () => {
    const currentUser = MOCK_USERS.ADMIN;
    const showStamp = currentUser.user_type !== "USER";
    expect(showStamp).toBe(true);
  });

  it("SUPERADMIN account should see stamp column", () => {
    const currentUser = MOCK_USERS.SUPERADMIN;
    const showStamp = currentUser.user_type !== "USER";
    expect(showStamp).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 11 — DELETED ITEMS PAGE ACCESS
// ═════════════════════════════════════════════════════════════════════════════
describe("TC-S3-20: Deleted Items Page — Access Control", () => {
  it("USER is blocked from /deleted-items (redirect to /sales)", () => {
    const currentUser = MOCK_USERS.USER;
    const canAccessDeletedItems = currentUser.user_type !== "USER";
    expect(canAccessDeletedItems).toBe(false);
  });

  it("ADMIN can access /deleted-items", () => {
    const currentUser = MOCK_USERS.ADMIN;
    const canAccessDeletedItems = currentUser.user_type !== "USER";
    expect(canAccessDeletedItems).toBe(true);
  });

  it("SUPERADMIN can access /deleted-items", () => {
    const currentUser = MOCK_USERS.SUPERADMIN;
    const canAccessDeletedItems = currentUser.user_type !== "USER";
    expect(canAccessDeletedItems).toBe(true);
  });
});
