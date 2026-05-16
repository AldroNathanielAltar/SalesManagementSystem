import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { RightsProvider } from "./context/RightsContext";
import { UserRightsProvider } from "./context/UserRightsContext";
import { PermissionsProvider } from "./context/PermissionsContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ui/ProtectedRoute";

import "./pages/Responsive.css";

// Lazy load pages for better performance
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallbackPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage")); // ADD THIS
const SalesListPage = lazy(() => import("./pages/SalesListPage"));
const SalesDetailPage = lazy(() => import("./pages/SalesDetailPage"));
const DeletedItemsPage = lazy(() => import("./pages/DeletedItemsPage"));
const UserManagementPage = lazy(() => import("./pages/UserManagementPage"));
const CustomerLookupPage = lazy(() =>
  import("./pages/LookupPages").then((m) => ({
    default: m.CustomerLookupPage,
  })),
);
const EmployeeLookupPage = lazy(() =>
  import("./pages/LookupPages").then((m) => ({
    default: m.EmployeeLookupPage,
  })),
);
const ProductLookupPage = lazy(() =>
  import("./pages/LookupPages").then((m) => ({ default: m.ProductLookupPage })),
);
const PriceHistoryPage = lazy(() =>
  import("./pages/LookupPages").then((m) => ({ default: m.PriceHistoryPage })),
);
const SalesByEmployeePage = lazy(() =>
  import("./pages/ReportsPage").then((m) => ({
    default: m.SalesByEmployeePage,
  })),
);
const SalesByCustomerPage = lazy(() =>
  import("./pages/ReportsPage").then((m) => ({
    default: m.SalesByCustomerPage,
  })),
);
const TopProductsPage = lazy(() =>
  import("./pages/ReportsPage").then((m) => ({ default: m.TopProductsPage })),
);
const MonthlySalesTrendPage = lazy(() =>
  import("./pages/ReportsPage").then((m) => ({
    default: m.MonthlySalesTrendPage,
  })),
);

// Simple loader component
function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f0c29 0%, #1a0533 40%, #0d1b3e 100%)",
        color: "white",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            border: "3px solid rgba(255,255,255,0.2)",
            borderTop: "3px solid #7c3aed",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <p>Loading...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

// Separate component to use auth hook
function AppRoutes() {
  const { authLoading, currentUser } = useAuth();

  if (authLoading) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />{" "}
        {/* ADD THIS ROUTE */}
        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route index element={<Navigate to="/sales" replace />} />
                    <Route path="sales" element={<SalesListPage />} />
                    <Route
                      path="sales/:transNo"
                      element={<SalesDetailPage />}
                    />
                    <Route
                      path="lookups/customers"
                      element={<CustomerLookupPage />}
                    />
                    <Route
                      path="lookups/employees"
                      element={<EmployeeLookupPage />}
                    />
                    <Route
                      path="lookups/products"
                      element={<ProductLookupPage />}
                    />
                    <Route
                      path="lookups/prices"
                      element={<PriceHistoryPage />}
                    />
                    <Route
                      path="deleted-items"
                      element={<DeletedItemsPage />}
                    />
                    <Route
                      path="reports/by-employee"
                      element={<SalesByEmployeePage />}
                    />
                    <Route
                      path="reports/by-customer"
                      element={<SalesByCustomerPage />}
                    />
                    <Route
                      path="reports/top-products"
                      element={<TopProductsPage />}
                    />
                    <Route
                      path="reports/monthly"
                      element={<MonthlySalesTrendPage />}
                    />
                    <Route
                      path="reports"
                      element={<Navigate to="/reports/by-employee" replace />}
                    />
                    <Route
                      path="admin/users"
                      element={<UserManagementPage />}
                    />
                    <Route
                      path="admin"
                      element={<Navigate to="/admin/users" replace />}
                    />
                    <Route
                      path="*"
                      element={<Navigate to="/sales" replace />}
                    />
                  </Routes>
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

// Main App component
export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <RightsProvider>
          <UserRightsProvider>
            <PermissionsProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </PermissionsProvider>
          </UserRightsProvider>
        </RightsProvider>
      </AppProvider>
    </AuthProvider>
  );
}
