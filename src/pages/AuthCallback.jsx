import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Check if user is ACTIVE before allowing access
          const { data: userRow } = await supabase
            .from('user')
            .select('record_status')
            .eq('userId', session.user.id)
            .single();

          if (userRow?.record_status === 'ACTIVE') {
            navigate('/sales');
          } else {
            await supabase.auth.signOut();
            navigate('/login?error=not_activated');
          }
        } else if (event === 'SIGNED_OUT') {
          navigate('/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-gray-500 text-lg">Signing you in, please wait...</p>
        <div className="mt-4 w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}
