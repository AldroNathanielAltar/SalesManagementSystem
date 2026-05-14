import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { RightsProvider } from "./context/RightsContext";
import { UserRightsProvider } from "./context/UserRightsContext"; // ← Add this import
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ui/ProtectedRoute";

import "./pages/Responsive.css";

// Auth
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";

// Sprint 2 — Sales
import SalesListPage from "./pages/SalesListPage";
import SalesDetailPage from "./pages/SalesDetailPage";
import DeletedItemsPage from "./pages/DeletedItemsPage";

// Sprint 2 — Lookups
import {
  CustomerLookupPage,
  EmployeeLookupPage,
  ProductLookupPage,
  PriceHistoryPage,
} from "./pages/LookupPages";

// Sprint 3 — Reports (4 named exports)
import {
  SalesByEmployeePage,
  SalesByCustomerPage,
  TopProductsPage,
  MonthlySalesTrendPage,
} from "./pages/ReportsPage";

// Sprint 3 — Admin
import UserManagementPage from "./pages/UserManagementPage";

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <RightsProvider>
          <UserRightsProvider>
            {" "}
            {/* ← Wrap with UserRightsProvider */}
            <BrowserRouter>
              <Routes>
                {/* Public */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />

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

                          {/* Sales */}
                          <Route path="sales" element={<SalesListPage />} />
                          <Route
                            path="sales/:transNo"
                            element={<SalesDetailPage />}
                          />

                          {/* Lookups */}
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

                          {/* Deleted Items */}
                          <Route
                            path="deleted-items"
                            element={<DeletedItemsPage />}
                          />

                          {/* Reports */}
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
                            element={
                              <Navigate to="/reports/by-employee" replace />
                            }
                          />

                          {/* Admin */}
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
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </UserRightsProvider>
        </RightsProvider>
      </AppProvider>
    </AuthProvider>
  );
}
