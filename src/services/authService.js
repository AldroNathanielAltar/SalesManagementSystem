import { supabase } from '../lib/supabaseClient';

// ===== EMAIL AUTH =====
export async function registerWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function loginWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

// ===== GOOGLE AUTH =====
export async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
}

// ===== LOGOUT =====
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
