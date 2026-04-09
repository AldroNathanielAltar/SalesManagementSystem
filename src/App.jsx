import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AppProvider } from './context/AppContext.jsx'
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { RightsProvider } from "./context/RightsContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ui/ProtectedRoute";

// Responsive fixes (PR-06)
import "./pages/Responsive.css";

// Auth pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";

// Sprint 2 pages
import SalesListPage from "./pages/SalesListPage";
import SalesDetailPage from "./pages/SalesDetailPage";
import DeletedItemsPage from "./pages/DeletedItemsPage";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
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
              {/* ── Public ── */}
        <RightsProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />

              {/* ── Protected (AppShell wraps all inner pages) ── */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="prices" element={<PricesPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="deleted-items" element={<DeletedItemsPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </UserRightsProvider>
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
                        <Route path="admin" element={<AdminPage />} />
                        <Route path="users" element={<Users />} />

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
        </RightsProvider>
      </AppProvider>
    </AuthProvider>
  );
}
