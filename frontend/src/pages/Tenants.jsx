
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api, { extractData } from "../services/api";
import { useAuth } from "../auth/AuthContext";

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    api.get("/tenants/")
      .then((res) => {
        setTenants(extractData(res.data));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Αποτυχία φόρτωσης ενοικιαστών");
        setLoading(false);
      });
  }, []);

  if (user?.role === "accountant") return <div className="page-content">Πρόσβαση μόνο ανάγνωσης: δεν εμφανίζονται ενοικιαστές για λογιστές.</div>;
  if (loading) return <div className="loading">Φόρτωση...</div>;
  if (error) return <div className="error">{error}</div>;

  const activeContracts = tenants.filter(t => {
    const now = new Date();
    const start = new Date(t.contract_start);
    const end = new Date(t.contract_end);
    return start <= now && now <= end;
  });

  const expiredContracts = tenants.filter(t => {
    const now = new Date();
    const end = new Date(t.contract_end);
    return now > end;
  });

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("el-GR");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("el-GR", {
      style: "currency",
      currency: "EUR"
    }).format(amount);
  };

  const getContractStatus = (tenant) => {
    const now = new Date();
    const start = new Date(tenant.contract_start);
    const end = new Date(tenant.contract_end);
    
    if (now < start) return { label: "Μελλοντικό", className: "status-future" };
    if (now > end) return { label: "Ληγμένο", className: "status-expired" };
    return { label: "Ενεργό", className: "status-active" };
  };

  const renderTenantCard = (tenant) => {
    const status = getContractStatus(tenant);
    
    return (
      <Link to={`/tenants/${tenant.id}`} key={tenant.id} className="tenant-card card">
        <div className="tenant-header">
          <h3>{tenant.full_name}</h3>
          <span className={`pill ${status.className}`}>{status.label}</span>
        </div>
        <div className="tenant-info">
          <p><strong>Ακίνητο:</strong> {tenant.apartment_title || tenant.apartment_address}</p>
          <p><strong>Τηλέφωνο:</strong> {tenant.phone || "-"}</p>
          <p><strong>Email:</strong> {tenant.email || "-"}</p>
          <p><strong>Ενοίκιο:</strong> {formatCurrency(tenant.monthly_rent)}</p>
          <p><strong>Διάρκεια:</strong> {formatDate(tenant.contract_start)} - {formatDate(tenant.contract_end)}</p>
        </div>
      </Link>
    );
  };

  return (
    <div className="tenants-page">
      <div className="page-header">
        <h1>Ενοικιαστές & Συμβόλαια</h1>
        {user?.role !== "accountant" && <Link to="/tenants/new" className="button primary">+ Νέος Ενοικιαστής</Link>}
      </div>

      {tenants.length === 0 ? (
        <div className="empty-state">
          <p>Δεν υπάρχουν ενοικιαστές ακόμα.</p>
          {user?.role !== "accountant" && <Link to="/tenants/new" className="button primary">Προσθήκη Ενοικιαστή</Link>}
        </div>
      ) : (
        <>
          {activeContracts.length > 0 && (
            <section className="tenants-section">
              <h2>Ενεργά Συμβόλαια ({activeContracts.length})</h2>
              <div className="tenants-grid">
                {activeContracts.map(renderTenantCard)}
              </div>
            </section>
          )}

          {expiredContracts.length > 0 && (
            <section className="tenants-section">
              <h2>Ληγμένα Συμβόλαια ({expiredContracts.length})</h2>
              <div className="tenants-grid">
                {expiredContracts.map(renderTenantCard)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
