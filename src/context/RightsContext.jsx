import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";
import { USER_RIGHTS_MAP } from "../data/mockData";

const RightsContext = createContext(null);

export function RightsProvider({ children }) {
  const { currentUser } = useAuth();
  const [rights, setRights] = useState({});
  const [loadingRights, setLoadingRights] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setRights({});
      return;
    }
    const uid = currentUser.userid || currentUser.userId || currentUser.id;
    if (uid) loadRights(uid);
  }, [currentUser?.userid, currentUser?.userId]);

  async function loadRights(userid) {
    setLoadingRights(true);
    try {
      const { data, error } = await supabase
        .from("usermodule_rights")
        .select("rightid, right_value")
        .eq("userid", userid);

      if (error || !data || data.length === 0) {
        useFallback();
        return;
      }
      const map = {};
      data.forEach((row) => {
        const key = row.rightid?.toUpperCase();
        if (key) map[key] = row.right_value ?? 0;
      });
      setRights(map);
    } catch {
      useFallback();
    } finally {
      setLoadingRights(false);
    }
  }

  function useFallback() {
    const type = currentUser?.user_type || "USER";
    setRights(USER_RIGHTS_MAP[type] || USER_RIGHTS_MAP["USER"]);
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
  if (!ctx) throw new Error("useRights must be used inside RightsProvider");
  return ctx;
}
