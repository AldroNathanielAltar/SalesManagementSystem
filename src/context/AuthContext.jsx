import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);
const USERID_COLS = ["userid", "userId", "user_id"];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const resolvedRef = useRef(false);
  const currentUidRef = useRef(null); // track which user is resolved

  useEffect(() => {
    const timeout = setTimeout(() => setAuthLoading(false), 5000);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(timeout);
      if (session) {
        // Only skip if SAME user already resolved
        if (resolvedRef.current && currentUidRef.current === session.user.id) {
          setAuthLoading(false);
          return;
        }
        await resolveUser(session);
      }
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Always resolve on SIGNED_IN — user just logged in
        if (currentUidRef.current !== session.user.id) {
          resolvedRef.current = false; // new user — force re-resolve
        }
        if (!resolvedRef.current) {
          setAuthLoading(true);
          await resolveUser(session);
          setAuthLoading(false);
        }
      }
      if (event === "TOKEN_REFRESHED") return; // silent
      if (event === "SIGNED_OUT") {
        resolvedRef.current = false;
        currentUidRef.current = null;
        setCurrentUser(null);
        setAuthLoading(false);
        setAuthError("");
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function resolveUser(session) {
    setAuthError("");
    let userRow = null;

    for (const col of USERID_COLS) {
      const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq(col, session.user.id)
        .single();
      if (!error && data) {
        userRow = data;
        break;
      }
    }

    if (!userRow) {
      // No row yet — allow in with basic profile
      const meta = session.user.user_metadata || {};
      setCurrentUser({
        id: session.user.id,
        userid: session.user.id,
        userId: session.user.id,
        email: session.user.email,
        username:
          meta.username || meta.full_name || session.user.email?.split("@")[0],
        user_type: "USER",
        record_status: "ACTIVE",
        user_metadata: meta,
      });
      resolvedRef.current = true;
      currentUidRef.current = session.user.id;
      return;
    }

    if (userRow.record_status === "INACTIVE") {
      await supabase.auth.signOut();
      setAuthError("INACTIVE");
      setCurrentUser(null);
      resolvedRef.current = false;
      currentUidRef.current = null;
      return;
    }

    const meta = session.user.user_metadata || {};
    setCurrentUser({
      ...session.user,
      userid:
        userRow.userid || userRow.userId || userRow.user_id || session.user.id,
      userId:
        userRow.userid || userRow.userId || userRow.user_id || session.user.id,
      username: userRow.username || userRow.user_name,
      user_type: userRow.user_type || "USER",
      record_status: userRow.record_status || "ACTIVE",
      user_metadata: meta,
    });
    resolvedRef.current = true;
    currentUidRef.current = session.user.id;
  }

  async function signOut() {
    resolvedRef.current = false;
    currentUidRef.current = null;
    setCurrentUser(null);
    setAuthError("");
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
