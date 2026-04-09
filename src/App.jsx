import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// PR-01
import LoginPage from "./pages/LoginPage.jsx";
// PR-02
import RegisterPage from "./pages/RegisterPage.jsx";
// PR-03
import AppShell from "./layouts/AppShell.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
// PR-04
import AuthCallbackPage from "./pages/AuthCallbackPage.jsx";
// Placeholder pages for every sidebar link
import {
  TransactionsPage,
  CustomersPage,
  EmployeesPage,
  ProductsPage,
  PricesPage,
  ReportsPage,
  AdminPage,
  DeletedItemsPage,
} from "./pages/PlaceholderPages.jsx";

export default function App() {
  return (
    <AuthProvider>
      <UserRightsProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public ── */}
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
    </AuthProvider>
  );
}
