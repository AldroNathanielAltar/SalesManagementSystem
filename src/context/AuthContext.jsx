// src/context/AuthContext.jsx
// fix: add window focus handler to prevent loading stuck on tab switch

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const resolvedRef = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        if (!resolvedRef.current) {
          resolveUser(session).finally(() => setAuthLoading(false));
        } else {
          setAuthLoading(false);
        }
      } else {
        setAuthLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session && !resolvedRef.current) {
        setAuthLoading(true);
        await resolveUser(session);
        setAuthLoading(false);
      }
      if (event === "TOKEN_REFRESHED" && session) {
        // Token refreshed silently — don't re-render or re-fetch
        return;
      }
      if (event === "SIGNED_OUT") {
        resolvedRef.current = false;
        setCurrentUser(null);
        setAuthLoading(false);
      }
    });

    // Fix: when user returns to tab, stop loading if already resolved
    const handleFocus = () => {
      if (resolvedRef.current) {
        setAuthLoading(false);
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  async function resolveUser(session) {
    setAuthError("");

    const { data: userRow, error } = await supabase
      .from("user")
      .select("userid, username, user_type, record_status")
      .eq("userid", session.user.id)
      .single();

    if (!userRow || error) {
      setCurrentUser({
        id: session.user.id,
        userid: session.user.id,
        userId: session.user.id,
        email: session.user.email,
        username:
          session.user.user_metadata?.username ||
          session.user.user_metadata?.full_name ||
          session.user.email?.split("@")[0],
        user_type: "USER",
        record_status: "ACTIVE",
      });
      resolvedRef.current = true;
      return;
    }

    if (userRow.record_status === "INACTIVE") {
      await supabase.auth.signOut();
      setAuthError("Your account is pending activation.");
      setCurrentUser(null);
      resolvedRef.current = false;
      return;
    }

    setCurrentUser({
      ...session.user,
      userid: userRow.userid,
      userId: userRow.userid,
      username: userRow.username,
      user_type: userRow.user_type || "USER",
      record_status: userRow.record_status || "ACTIVE",
    });
    resolvedRef.current = true;
  }

  async function signOut() {
    resolvedRef.current = false;
    setCurrentUser(null);
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
