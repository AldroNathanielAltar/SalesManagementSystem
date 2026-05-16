// src/services/authService.js
// Handles all authentication operations with Supabase

import { supabase } from "../lib/supabaseClient";

/**
 * Helper function to create a user record in the custom user table
 * @param {string} userId - The Supabase Auth user ID
 * @param {string} email - User's email address
 * @param {object} metadata - Additional user metadata (firstName, lastName, username)
 * @returns {object} The created user record
 */
async function createUserRecord(userId, email, metadata) {
  // Generate username from first name and last name, or use email prefix
  const firstName = metadata.firstName || "";
  const lastName = metadata.lastName || "";
  const username =
    metadata.username ||
    `${firstName}.${lastName}`.toLowerCase().replace(/[^a-z0-9.]/g, "") ||
    email.split("@")[0];

  // Insert into custom user table with INACTIVE status (requires admin approval)
  const { data, error } = await supabase
    .from("user")
    .insert({
      userid: userId,
      username: username,
      user_type: "USER",
      record_status: "INACTIVE", // Needs admin approval before login
      stamp: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating user record:", error);
    throw error;
  }

  return data;
}

/**
 * Helper function to ensure user exists in custom table
 * Used after Google login or any OAuth login
 */
async function ensureUserRecord(user, email, metadata) {
  // Check if user already exists in custom table
  const { data: existingUser } = await supabase
    .from("user")
    .select("*")
    .eq("userid", user.id)
    .maybeSingle();

  if (!existingUser) {
    // Create new user record
    await createUserRecord(user.id, email, metadata);
    return { exists: false, record_status: "INACTIVE" };
  }

  return { exists: true, record_status: existingUser.record_status };
}

/**
 * Registers a new user with email and password
 * - Creates user in Supabase Auth
 * - Creates corresponding record in custom user table
 * @param {string} email - User's email address
 * @param {string} password - User's password (min 8 characters)
 * @param {object} metadata - User metadata (firstName, lastName, username)
 * @returns {object} Supabase auth response
 */
export async function registerWithEmail(email, password, metadata = {}) {
  // Step 1: Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        firstName: metadata.firstName ?? "",
        lastName: metadata.lastName ?? "",
        username: metadata.username ?? "",
        full_name:
          metadata.full_name ?? `${metadata.firstName} ${metadata.lastName}`,
      },
    },
  });

  if (authError) throw authError;

  // Step 2: Create corresponding record in your user table
  if (authData.user) {
    try {
      await createUserRecord(authData.user.id, email, metadata);
    } catch (userError) {
      console.error(
        "Failed to create user record, but auth user was created:",
        userError,
      );
    }
  }

  return authData;
}

/**
 * Logs in a user with email and password
 * - Validates credentials with Supabase Auth
 * - Checks if user exists in custom table and is ACTIVE
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {object} Supabase auth response
 * @throws {Error} If account is inactive or pending approval
 */
export async function loginWithEmail(email, password) {
  // First, try to sign in with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  // Check if user exists in your user table and is ACTIVE
  if (data.user) {
    const { data: userData, error: userError } = await supabase
      .from("user")
      .select("record_status, user_type, username")
      .eq("userid", data.user.id)
      .maybeSingle();

    if (userError) {
      console.error("Error checking user status:", userError);
    }

    if (!userData) {
      // User record doesn't exist, create it
      const firstName = data.user.user_metadata?.firstName || "";
      const lastName = data.user.user_metadata?.lastName || "";
      await createUserRecord(data.user.id, email, {
        firstName,
        lastName,
      });
      // Sign out immediately since account is inactive
      await supabase.auth.signOut();
      throw new Error(
        "⚠️ Account pending admin approval. Please wait for an administrator to activate your account.",
      );
    }

    // Block login if account is not active
    if (userData.record_status !== "ACTIVE") {
      // Sign out immediately
      await supabase.auth.signOut();
      throw new Error(
        "⛔ Your account is INACTIVE. Please contact an administrator to activate your account.",
      );
    }
  }

  return data;
}

/**
 * Sends a password reset email to the user
 * @param {string} email - User's email address
 * @returns {Promise} Supabase response
 */
export async function resetPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
  return data;
}

/**
 * Updates user password after reset
 * @param {string} newPassword - New password to set
 * @returns {Promise} Supabase response
 */
export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  return data;
}

/**
 * Initiates Google OAuth login flow
 * After Google redirect, the user record needs to be checked/created
 */
export async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
}

/**
 * Handle Google OAuth callback - This should be called in your AuthCallbackPage
 * Checks if user exists in custom table, creates if not, and validates status
 */
export async function handleGoogleCallback() {
  // Get the current session after Google redirect
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (!session?.user) throw new Error("No user found after Google login");

  const user = session.user;
  const email = user.email;
  const metadata = user.user_metadata || {};

  // Get first name and last name from Google metadata
  const firstName =
    metadata.full_name?.split(" ")[0] || metadata.firstName || "";
  const lastName =
    metadata.full_name?.split(" ").slice(1).join(" ") ||
    metadata.lastName ||
    "";

  // Ensure user exists in custom table
  const { exists, record_status } = await ensureUserRecord(user, email, {
    firstName,
    lastName,
    username: email.split("@")[0],
  });

  // If user is inactive, sign them out immediately
  if (record_status !== "ACTIVE") {
    await supabase.auth.signOut();
    throw new Error(
      "⛔ Your account is INACTIVE. Please contact an administrator to activate your account.",
    );
  }

  return session;
}

/**
 * Logs out the current user
 * Clears the session in Supabase Auth
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Gets the current user with merged database status
 * Combines Supabase Auth user with custom user table data
 * @returns {object|null} Current user with database fields, or null if not logged in
 */
export async function getCurrentUserWithStatus() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return null;

  // Fetch additional user data from custom table
  const { data: userData } = await supabase
    .from("user")
    .select("*")
    .eq("userid", session.user.id)
    .maybeSingle();

  return {
    ...session.user,
    user_type: userData?.user_type || "USER",
    record_status: userData?.record_status || "INACTIVE",
    username: userData?.username || session.user.email?.split("@")[0],
  };
}
