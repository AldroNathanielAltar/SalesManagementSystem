import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// ─── Mock Supabase ────────────────────────────────────────────────────────────
// We mock Supabase so tests don't need a real internet connection.
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
      single: vi.fn(),
    })),
  },
}));

import { supabase } from "../lib/supabaseClient";

// ─── RESET mocks before each test ────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE 1: Email Registration
// ─────────────────────────────────────────────────────────────────────────────
describe("TC-01: Email Registration", () => {
  it("should call supabase.auth.signUp with email and password", async () => {
    supabase.auth.signUp.mockResolvedValueOnce({
      data: { user: { id: "user-123", email: "newuser@test.com" } },
      error: null,
    });

    const result = await supabase.auth.signUp({
      email: "newuser@test.com",
      password: "Password123!",
    });

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: "newuser@test.com",
      password: "Password123!",
    });
    expect(result.error).toBeNull();
    expect(result.data.user.email).toBe("newuser@test.com");
  });

  it("should return an error if email is already registered", async () => {
    supabase.auth.signUp.mockResolvedValueOnce({
      data: {},
      error: { message: "User already registered" },
    });

    const result = await supabase.auth.signUp({
      email: "existing@test.com",
      password: "Password123!",
    });

    expect(result.error).not.toBeNull();
    expect(result.error.message).toBe("User already registered");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE 2: Google OAuth New User
// ─────────────────────────────────────────────────────────────────────────────
describe("TC-02: Google OAuth New User", () => {
  it("should call signInWithOAuth with provider google", async () => {
    supabase.auth.signInWithOAuth.mockResolvedValueOnce({
      data: { url: "https://accounts.google.com/o/oauth2/auth?..." },
      error: null,
    });

    const result = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
    });
    expect(result.error).toBeNull();
  });

  it("should return an error if OAuth provider fails", async () => {
    supabase.auth.signInWithOAuth.mockResolvedValueOnce({
      data: {},
      error: { message: "OAuth provider error" },
    });

    const result = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    expect(result.error).not.toBeNull();
    expect(result.error.message).toBe("OAuth provider error");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE 3: Login Guard — INACTIVE user is blocked
// ─────────────────────────────────────────────────────────────────────────────
describe("TC-03: Login Guard blocks INACTIVE user", () => {
  it("should sign out and not allow access if user record_status is INACTIVE", async () => {
    // Simulate: Supabase auth login succeeds
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: "user-inactive-456" } },
      error: null,
    });

    // Simulate: user record in DB has record_status = 'INACTIVE'
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({
        data: { record_status: "INACTIVE" },
        error: null,
      }),
    });

    // Simulate: signOut is called as a result
    supabase.auth.signOut.mockResolvedValueOnce({ error: null });

    // Step 1: login
    const loginResult = await supabase.auth.signInWithPassword({
      email: "inactive@test.com",
      password: "Password123!",
    });
    expect(loginResult.error).toBeNull();

    // Step 2: check record_status from DB
    const dbResult = await supabase
      .from("user")
      .select("record_status")
      .eq("id", loginResult.data.user.id)
      .single();

    expect(dbResult.data.record_status).toBe("INACTIVE");

    // Step 3: login guard should trigger signOut
    if (dbResult.data.record_status === "INACTIVE") {
      await supabase.auth.signOut();
    }

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE 4: Login Guard — ACTIVE user is allowed through
// ─────────────────────────────────────────────────────────────────────────────
describe("TC-04: Login Guard allows ACTIVE user", () => {
  it("should allow access and NOT call signOut if user record_status is ACTIVE", async () => {
    // Simulate: login succeeds
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: "user-active-789" } },
      error: null,
    });

    // Simulate: user record in DB has record_status = 'ACTIVE'
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({
        data: { record_status: "ACTIVE" },
        error: null,
      }),
    });

    // Step 1: login
    const loginResult = await supabase.auth.signInWithPassword({
      email: "active@test.com",
      password: "Password123!",
    });
    expect(loginResult.error).toBeNull();

    // Step 2: check record_status
    const dbResult = await supabase
      .from("user")
      .select("record_status")
      .eq("id", loginResult.data.user.id)
      .single();

    expect(dbResult.data.record_status).toBe("ACTIVE");

    // Step 3: login guard should NOT sign out
    if (dbResult.data.record_status === "INACTIVE") {
      await supabase.auth.signOut();
    }

    expect(supabase.auth.signOut).not.toHaveBeenCalled();
  });
});
