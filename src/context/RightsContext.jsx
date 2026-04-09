import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { USER_RIGHTS_MAP } from '../data/mockData';

const RightsContext = createContext(null);

export function RightsProvider({ children }) {
  const { currentUser, session } = useAuth();
  const [rights,       setRights]       = useState({});
  const [loadingRights, setLoadingRights] = useState(false);

  useEffect(() => {
    if (!currentUser || !session) { setRights({}); return; }
    loadRights(currentUser.userid || currentUser.id);
  }, [currentUser?.userid, currentUser?.id, session]);

  async function loadRights(userid) {
    setLoadingRights(true);
    try {
      const { data, error } = await supabase
        .from('UserModule_Rights')
        .select('rightvalue, rights ( rightname )')
        .eq('userid', userid);

      if (error || !data || data.length === 0) {
        // Fallback: use user_type-based rights map
        const type = currentUser?.user_type || 'USER';
        setRights(USER_RIGHTS_MAP[type] || USER_RIGHTS_MAP['USER']);
        return;
      }

      // Build flat rights map: { SALES_VIEW: 1, SALES_ADD: 0, ... }
      const map = {};
      data.forEach(row => {
        const name = row.rights?.rightname;
        if (name !== undefined) map[name] = row.rightvalue;
      });
      setRights(map);
    } catch {
      // Network error — use fallback
      const type = currentUser?.user_type || 'USER';
      setRights(USER_RIGHTS_MAP[type] || USER_RIGHTS_MAP['USER']);
    } finally {
      setLoadingRights(false);
    }
  }

  function can(right) {
    return rights[right] === 1;
  }

  return (
    <RightsContext.Provider value={{ rights, can, loadingRights }}>
      {children}
    </RightsContext.Provider>
  );
}

export function useRights() {
  const ctx = useContext(RightsContext);
  if (!ctx) throw new Error('useRights must be used inside RightsProvider');
  return ctx;
}
