import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const { data: userRow } = await supabase
            .from('user')
            .select('record_status, user_type, username')
            .eq('userId', session.user.id)
            .single();

          if (userRow?.record_status !== 'ACTIVE') {
            await supabase.auth.signOut();
            setError('Your account is pending activation by a Sales Manager.');
            setCurrentUser(null);
          } else {
            setCurrentUser({ ...session.user, ...userRow });
            setError(null);
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
