import { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";
import { USER_RIGHTS_MAP } from "../data/mockData";

const RightsContext = createContext(null);

export function RightsProvider({ children }) {
  const { currentUser } = useAuth();
  const [rights, setRights] = useState({});
  const [loadingRights, setLoadingRights] = useState(false);
  const lastUserType = useRef(null);

  useEffect(() => {
    if (!currentUser) {
      setRights({});
      lastUserType.current = null;
      return;
    }

    // Always re-load rights if user_type changed (e.g. promoted to ADMIN)
    const uid = currentUser.userid || currentUser.userId || currentUser.id;
    const userType = currentUser.user_type || "USER";

    if (uid) loadRights(uid, userType);
    lastUserType.current = userType;
  }, [currentUser?.userid, currentUser?.userId, currentUser?.user_type]);

  async function loadRights(userid, userType) {
    setLoadingRights(true);
    try {
      const { data, error } = await supabase
        .from("usermodule_rights")
        .select("rightid, right_value")
        .eq("userid", userid);

      if (error || !data || data.length === 0) {
        // Use role-based fallback map
        setRights(USER_RIGHTS_MAP[userType] || USER_RIGHTS_MAP["USER"]);
        return;
      }

      const map = {};
      data.forEach((row) => {
        const key = row.rightid?.toUpperCase();
        if (key) map[key] = row.right_value ?? 0;
      });

      // If map is empty after parsing, use fallback
      if (Object.keys(map).length === 0) {
        setRights(USER_RIGHTS_MAP[userType] || USER_RIGHTS_MAP["USER"]);
      } else {
        setRights(map);
      }
    } catch {
      setRights(USER_RIGHTS_MAP[userType] || USER_RIGHTS_MAP["USER"]);
    } finally {
      setLoadingRights(false);
    }
  }

  // can() checks the rights map — falls back to user_type if map empty
  function can(right) {
    if (Object.keys(rights).length === 0) {
      // No rights loaded yet — derive from user_type directly
      const userType = currentUser?.user_type || "USER";
      return (
        (USER_RIGHTS_MAP[userType] || USER_RIGHTS_MAP["USER"])[right] === 1
      );
    }
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
