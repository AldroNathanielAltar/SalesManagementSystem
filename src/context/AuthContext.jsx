import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        resolveUser(session);
      } else {
        setAuthLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) await resolveUser(session);
      if (event === "SIGNED_OUT") {
        setCurrentUser(null);
        setAuthLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function resolveUser(session) {
    setAuthLoading(true);
    setAuthError("");

    const { data: userRow, error } = await supabase
      .from("user")
      .select("userId, username, user_type, record_status")
      .eq("userId", session.user.id)
      .single();

    if (error || !userRow) {
      setAuthError("Unable to verify your account. Please try again.");
      await supabase.auth.signOut();
      setAuthLoading(false);
      return;
    }

    if (userRow.record_status !== "ACTIVE") {
      await supabase.auth.signOut();
      setAuthError("Your account is pending activation by a Sales Manager.");
      setAuthLoading(false);
      return;
    }

    setCurrentUser({ ...session.user, ...userRow });
    setAuthLoading(false);
  }

  async function signOut() {
    setAuthLoading(true);
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, authLoading, authError, setAuthError, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
