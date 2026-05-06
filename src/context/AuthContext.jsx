<<<<<<< HEAD
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
=======
// src/context/AuthContext.jsx
// fix: userid casing + TOKEN_REFRESHED handler to prevent tab switch reload

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
>>>>>>> fa23da17dd859fa7ece89261cdc5042075e715a2

const AuthContext = createContext(null);

const USERID_COLS = ['userid', 'userId', 'user_id', 'id'];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
<<<<<<< HEAD
  const [authError,   setAuthError]   = useState('');
  const resolvedRef = useRef(false); // prevent re-resolving on tab switch
=======
  const [authError, setAuthError] = useState("");
  const currentUserRef = useRef(null);
>>>>>>> fa23da17dd859fa7ece89261cdc5042075e715a2

  useEffect(() => {
    // If already resolved once, skip — don't re-fetch on tab focus
    supabase.auth.getSession().then(({ data: { session } }) => {
<<<<<<< HEAD
      if (session) {
        if (!resolvedRef.current) {
          resolveUser(session).finally(() => setAuthLoading(false));
        } else {
          setAuthLoading(false); // already have user, just stop spinner
        }
      } else {
=======
      if (session) resolveUser(session);
      else setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) await resolveUser(session);
      if (event === "TOKEN_REFRESHED" && session) {
        // Only re-resolve if no currentUser yet — prevent unnecessary re-fetch on tab switch
        if (!currentUserRef.current) await resolveUser(session);
      }
      if (event === "SIGNED_OUT") {
        setCurrentUser(null);
        currentUserRef.current = null;
>>>>>>> fa23da17dd859fa7ece89261cdc5042075e715a2
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session && !resolvedRef.current) {
          setAuthLoading(true);
          await resolveUser(session);
          setAuthLoading(false);
        }
        if (event === 'TOKEN_REFRESHED' && session) {
          // Token refreshed silently — don't re-render or re-fetch
          return;
        }
        if (event === 'SIGNED_OUT') {
          resolvedRef.current = false;
          setCurrentUser(null);
          setAuthLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function resolveUser(session) {
    setAuthError('');

<<<<<<< HEAD
    let userRow = null;
    for (const col of USERID_COLS) {
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq(col, session.user.id)
        .single();
      if (!error && data) { userRow = data; break; }
    }
=======
    const { data: userRow, error } = await supabase
      .from("user")
      .select("userid, username, user_type, record_status")  // ← lowercase
      .eq("userid", session.user.id)                         // ← lowercase
      .single();
>>>>>>> fa23da17dd859fa7ece89261cdc5042075e715a2

    if (!userRow) {
      // No user row — fallback to auth metadata
      setCurrentUser({
        id:            session.user.id,
        userid:        session.user.id,
        userId:        session.user.id,
        email:         session.user.email,
        username:      session.user.user_metadata?.username
                    || session.user.user_metadata?.full_name
                    || session.user.email?.split('@')[0],
        user_type:     'USER',
        record_status: 'ACTIVE',
      });
      resolvedRef.current = true;
      return;
    }

    if (userRow.record_status === 'INACTIVE') {
      await supabase.auth.signOut();
      setAuthError('Your account is pending activation.');
      setCurrentUser(null);
      resolvedRef.current = false;
      return;
    }

    setCurrentUser({
      ...session.user,
      userid:        userRow.userid        || userRow.userId    || userRow.user_id,
      userId:        userRow.userid        || userRow.userId    || userRow.user_id,
      username:      userRow.username      || userRow.user_name || userRow.name,
      user_type:     userRow.user_type     || userRow.userType  || 'USER',
      record_status: userRow.record_status || 'ACTIVE',
    });
    resolvedRef.current = true; // mark as resolved — skip on next tab switch
  }

  async function signOut() {
    resolvedRef.current = false;
    setCurrentUser(null);
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ currentUser, authLoading, authError, setAuthError, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}