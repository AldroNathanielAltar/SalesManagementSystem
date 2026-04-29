// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }        from "./context/AuthContext";
import { AppProvider }         from "./context/AppContext";
import { UserRightsProvider }  from "./context/UserRightsContext";
import Layout                  from "./components/layout/Layout";
import ProtectedRoute          from "./components/ui/ProtectedRoute";

// Responsive fixes (PR-06)
import "./pages/Responsive.css";

// Auth pages
import LoginPage       from "./pages/LoginPage";
import RegisterPage    from "./pages/RegisterPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";

// Sprint 2 pages
import SalesListPage    from "./pages/SalesListPage";
import SalesDetailPage  from "./pages/SalesDetailPage";
import DeletedItemsPage from "./pages/DeletedItemsPage";
import Reports from "./pages/ReportsPage";
import Users from "./pages/UserManagementPage";
import { AdminPage } from "./pages/PlaceholderPages";

// PR-04 — read-only lookup pages
import {
  CustomerLookupPage,
  EmployeeLookupPage,
  ProductLookupPage,
  PriceHistoryPage,
} from "./pages/LookupPages";

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <UserRightsProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/login"          element={<LoginPage />} />
              <Route path="/register"       element={<RegisterPage />} />
              <Route path="/auth/callback"  element={<AuthCallbackPage />} />

              {/* Protected */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route
                          index
                          element={<Navigate to="/sales" replace />}
                        />

                        {/* PR-01 + PR-02 + PR-03 — Sales */}
                        <Route path="sales" element={<SalesListPage />} />
                        <Route
                          path="sales/:transNo"
                          element={<SalesDetailPage />}
                        />

                        {/* PR-04 — Read-only Lookups */}
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

                        {/* PR-05 — Deleted Items */}
                        <Route
                          path="deleted-items"
                          element={<DeletedItemsPage />}
                        />

                        {/* Reports & Admin */}
                        <Route path="reports" element={<Reports />} />
                        <Route path="admin"   element={<AdminPage />} />

                        {/* Sprint 3 — User Management (ADM_USER gated) */}
                        <Route path="users" element={<UserManagementPage />} />

                        <Route
                          path="*"
                          element={<Navigate to="/sales" replace />}
                        />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </UserRightsProvider>
      </AppProvider>
    </AuthProvider>
  );
}
