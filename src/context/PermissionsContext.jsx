import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";

const PermissionsContext = createContext(null);

// Permission definitions based on the Rights Matrix
const PERMISSIONS = {
  // Sales permissions
  SALES_VIEW: {
    SUPERADMIN: true,
    ADMIN: true,
    USER: true,
    description: "View Transactions",
  },
  SALES_ADD: {
    SUPERADMIN: true,
    ADMIN: true,
    USER: false,
    description: "Create Transaction",
  },
  SALES_EDIT: {
    SUPERADMIN: true,
    ADMIN: true,
    USER: false,
    description: "Edit Transaction",
  },
  SALES_DEL: {
    SUPERADMIN: true,
    ADMIN: false,
    USER: false,
    description: "Soft Delete Transaction",
  },

  // Sales Detail permissions
  SD_VIEW: {
    SUPERADMIN: true,
    ADMIN: true,
    USER: true,
    description: "View Sales Details",
  },
  SD_ADD: {
    SUPERADMIN: true,
    ADMIN: true,
    USER: false,
    description: "Add Line Item",
  },
  SD_EDIT: {
    SUPERADMIN: true,
    ADMIN: true,
    USER: false,
    description: "Edit Line Item",
  },

  // Lookup permissions (all roles can view)
  CUST_LOOKUP: {
    SUPERADMIN: "LOOKUP",
    ADMIN: "LOOKUP",
    USER: "LOOKUP",
    description: "Look Up Customers",
  },
  EMP_LOOKUP: {
    SUPERADMIN: "LOOKUP",
    ADMIN: "LOOKUP",
    USER: "LOOKUP",
    description: "Look Up Employees",
  },
  PROD_LOOKUP: {
    SUPERADMIN: "LOOKUP",
    ADMIN: "LOOKUP",
    USER: "LOOKUP",
    description: "Look Up Products",
  },
  PRICE_LOOKUP: {
    SUPERADMIN: "LOOKUP",
    ADMIN: "LOOKUP",
    USER: "LOOKUP",
    description: "Look Up Price History",
  },

  // Admin permissions
  ADM_USER: {
    SUPERADMIN: true,
    ADMIN: false,
    USER: false,
    description: "Activate/Manage Users",
  },
};

export function PermissionsProvider({ children }) {
  const { currentUser } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setUserRole(currentUser.user_type);
    } else {
      setUserRole(null);
    }
    setLoading(false);
  }, [currentUser]);

  // Check if user has a specific permission
  const hasPermission = useCallback(
    (permissionName) => {
      if (!userRole) return false;

      const permission = PERMISSIONS[permissionName];
      if (!permission) return false;

      const roleKey = userRole;
      const hasAccess = permission[roleKey];

      return hasAccess === true || hasAccess === "LOOKUP";
    },
    [userRole],
  );

  // Check if user has any of the specified permissions
  const hasAnyPermission = useCallback(
    (permissionNames) => {
      return permissionNames.some((name) => hasPermission(name));
    },
    [hasPermission],
  );

  // Check if user has all specified permissions
  const hasAllPermissions = useCallback(
    (permissionNames) => {
      return permissionNames.every((name) => hasPermission(name));
    },
    [hasPermission],
  );

  // Get user role display name
  const getRoleDisplay = useCallback(() => {
    switch (userRole) {
      case "SUPERADMIN":
        return "Super Admin";
      case "ADMIN":
        return "Admin";
      case "USER":
        return "User";
      default:
        return "Unknown";
    }
  }, [userRole]);

  // Check if user can edit (for forms)
  const canEdit = useCallback(() => {
    return hasPermission("SALES_EDIT");
  }, [hasPermission]);

  // Check if user can delete (soft delete)
  const canDelete = useCallback(() => {
    return hasPermission("SALES_DEL");
  }, [hasPermission]);

  // Check if user can add
  const canAdd = useCallback(() => {
    return hasPermission("SALES_ADD");
  }, [hasPermission]);

  // Check if user can view (always true for authenticated users)
  const canView = useCallback(() => {
    return hasPermission("SALES_VIEW");
  }, [hasPermission]);

  // Check if user is admin (has user management)
  const isAdmin = useCallback(() => {
    return hasPermission("ADM_USER");
  }, [hasPermission]);

  // Check if user is super admin
  const isSuperAdmin = useCallback(() => {
    return userRole === "SUPERADMIN";
  }, [userRole]);

  return (
    <PermissionsContext.Provider
      value={{
        userRole,
        loading,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        getRoleDisplay,
        canEdit,
        canDelete,
        canAdd,
        canView,
        isAdmin,
        isSuperAdmin,
        PERMISSIONS,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used inside PermissionsProvider");
  }
  return context;
}
