// src/App.jsx
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Apartments from "./pages/Apartments";
import ApartmentDetail from "./pages/ApartmentDetail";
import ApartmentForm from "./pages/ApartmentForm";
import Tenants from "./pages/Tenants";
import TenantDetail from "./pages/TenantDetail";
import TenantForm from "./pages/TenantForm";
import Payments from "./pages/Payments";
import Documents from "./pages/Documents";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import TenantHistory from "./pages/TenantHistory";
import PrivateRoute from "./auth/PrivateRoute";
import { AuthProvider } from "./auth/AuthContext";
import ThemeToggle from "./components/ThemeToggle";
import { AuthContext } from "./auth/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="page-content">Φόρτωση...</div>;
  }

  // If not logged in, show landing/auth pages
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  // If logged in, show app pages
  return (
    <Routes>
      <Route
            path="/"
            element={
              <AuthedLayout>
                <Dashboard />
              </AuthedLayout>
            }
          />
          <Route
            path="/apartments"
            element={
              <AuthedLayout>
                <Apartments />
              </AuthedLayout>
            }
          />
          <Route
            path="/apartments/:id"
            element={
              <AuthedLayout>
                <ApartmentDetail />
              </AuthedLayout>
            }
          />
          <Route
            path="/apartments/new"
            element={
              <AuthedLayout>
                <ApartmentForm />
              </AuthedLayout>
            }
          />
          <Route
            path="/apartments/:id/edit"
            element={
              <AuthedLayout>
                <ApartmentForm />
              </AuthedLayout>
            }
          />
          <Route
            path="/tenants"
            element={
              <AuthedLayout>
                <Tenants />
              </AuthedLayout>
            }
          />
          <Route
            path="/tenants/new"
            element={
              <AuthedLayout>
                <TenantForm />
              </AuthedLayout>
            }
          />
          <Route
            path="/tenants/:id"
            element={
              <AuthedLayout>
                <TenantDetail />
              </AuthedLayout>
            }
          />
          <Route
            path="/tenants/:id/edit"
            element={
              <AuthedLayout>
                <TenantForm />
              </AuthedLayout>
            }
          />
          <Route
            path="/payments"
            element={
              <AuthedLayout>
                <Payments />
              </AuthedLayout>
            }
          />
          <Route
            path="/documents"
            element={
              <AuthedLayout>
                <Documents />
              </AuthedLayout>
            }
          />
          <Route
            path="/notifications"
            element={
              <AuthedLayout>
                <Notifications />
              </AuthedLayout>
            }
          />
          <Route
            path="/reports"
            element={
              <AuthedLayout>
                <Reports />
              </AuthedLayout>
            }
          />
          <Route
            path="/tenant-history"
            element={
              <AuthedLayout>
                <TenantHistory />
              </AuthedLayout>
            }
          />
        </Routes>
    );
}

const AuthedLayout = ({ children }) => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link
  to="/"
  className="brand"
  style={{
    textDecoration: "none",
    color: "inherit",
    fontSize: "1.6rem",
    fontWeight: "700"
  }}
>
  SpitiIQ
</Link>

        <nav className="nav-links">
          {user?.role !== "accountant" && <Link to="/apartments">Ακίνητα</Link>}
          {user?.role !== "accountant" && <Link to="/tenants">Ενοικιαστές</Link>}
          <Link to="/payments">Ενοίκια</Link>
          <Link to="/documents">Έγγραφα</Link>
          <Link to="/reports">Αναφορές</Link>
          {user?.role !== "accountant" && <Link to="/tenant-history">Ιστορικό</Link>}
          {user?.role !== "accountant" && <Link to="/apartments/new" className="button primary">+ Νέο</Link>}
        </nav>
        <div className="topbar-actions">
          {user?.role && <span className="pill">{user.role}</span>}
          <Link to="/notifications" style={{ fontSize: "1.5rem", textDecoration: "none" }}>🔔</Link>
          <ThemeToggle />
          <button className="button" onClick={handleLogout}>Αποσύνδεση</button>
        </div>
      </header>
      <main className="page-content">{children}</main>
    </div>
  );
};
export default App;
