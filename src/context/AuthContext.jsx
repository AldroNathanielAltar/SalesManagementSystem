// src/context/AuthContext.jsx
// FIXED - Properly sets authLoading to false
// Handles user authentication, session management, and user status checking

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Create Auth Context for global authentication state
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // State for storing the current authenticated user
  const [currentUser, setCurrentUser] = useState(null);
  // Loading state - true while checking authentication status
  const [authLoading, setAuthLoading] = useState(true);
  // Error state for authentication failures
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    // Flag to prevent state updates if component unmounts
    let isMounted = true;

    /**
     * Checks the user's session and fetches user data from database
     * - Gets current session from Supabase
     * - Fetches corresponding user record from custom user table
     * - Validates if user is active
     * - Sets currentUser state with combined data
     */
    const checkUser = async () => {
      try {
        console.log("Checking user session...");

        // Get current session from Supabase Auth
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
        }

        // No active session - user is not logged in
        if (!session?.user) {
          console.log("No session found");
          if (isMounted) {
            setCurrentUser(null);
            setAuthLoading(false);
          }
          return;
        }

        console.log("Session found for user:", session.user.id);

        // Fetch user record from custom user table using userid
        const { data: userRow, error: userError } = await supabase
          .from("user")
          .select("*")
          .eq("userid", session.user.id)
          .maybeSingle();

        if (userError && userError.code !== "PGRST116") {
          console.error("User fetch error:", userError);
        }

        // Check if user account is inactive
        if (userRow?.record_status === "INACTIVE") {
          console.log("User is inactive");
          // Sign out inactive users
          await supabase.auth.signOut();
          if (isMounted) {
            setCurrentUser(null);
            setAuthError("Account is inactive. Please contact administrator.");
            setAuthLoading(false);
          }
        } else {
          // Merge Supabase Auth user data with custom user table data
          const userData = {
            id: session.user.id,
            userid: session.user.id,
            email: session.user.email,
            username:
              userRow?.username || session.user.email?.split("@")[0] || "user",
            user_type: userRow?.user_type || "USER",
            record_status: userRow?.record_status || "ACTIVE",
            firstname: userRow?.firstname || "",
            lastname: userRow?.lastname || "",
          };

          console.log(
            "User data set:",
            userData.username,
            "- Role:",
            userData.user_type,
          );
          if (isMounted) {
            setCurrentUser(userData);
            setAuthLoading(false);
          }
        }
      } catch (err) {
        console.error("Auth error:", err);
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    // Initial session check on component mount
    checkUser();

    // Listen for authentication state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event);

      // When user signs in, refresh user data
      if (event === "SIGNED_IN" && session) {
        checkUser();
      }
      // When user signs out, clear user state
      else if (event === "SIGNED_OUT") {
        if (isMounted) {
          setCurrentUser(null);
          setAuthLoading(false);
        }
      }
    });

    // Cleanup function - unsubscribe from auth changes and prevent memory leaks
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Signs out the current user
   * - Clears local user state
   * - Calls Supabase signOut
   */
  const signOut = async () => {
    setCurrentUser(null);
    await supabase.auth.signOut();
  };

  // Helper booleans for role-based access control
  const isSuperAdmin = currentUser?.user_type === "SUPERADMIN";
  const isAdmin =
    currentUser?.user_type === "ADMIN" ||
    currentUser?.user_type === "SUPERADMIN";

  // Provide authentication context to child components
  return (
    <AuthContext.Provider
      value={{
        currentUser, // Current user object with merged auth and database data
        authLoading, // Boolean indicating if auth is still loading
        authError, // Error message if authentication failed
        setAuthError, // Function to manually set auth error
        signOut, // Function to sign out user
        isSuperAdmin, // Boolean - true if user is SUPERADMIN
        isAdmin, // Boolean - true if user is ADMIN or SUPERADMIN
        userType: currentUser?.user_type || "USER", // User role type
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Export useAuth as a named export
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}

// Also export as default for flexibility
export default AuthProvider;
