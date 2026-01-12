import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api, { extractData } from "../services/api";

export default function TenantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/tenants/${id}/`)
      .then((res) => {
        setTenant(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Αποτυχία φόρτωσης ενοικιαστή");
        setLoading(false);
      });

    // Fetch payments for this tenant
    api.get("/payments/")
      .then((res) => {
        const tenantPayments = extractData(res.data).filter(p => p.tenant === parseInt(id));
        setPayments(tenantPayments);
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleDelete = () => {
    if (!confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον ενοικιαστή;")) return;
    
    api.delete(`/tenants/${id}/`)
      .then(() => {
        navigate("/tenants");
      })
      .catch((err) => {
        alert(err.response?.data?.detail || "Αποτυχία διαγραφής ενοικιαστή");
      });
  };

  if (loading) return <div className="loading">Φόρτωση...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!tenant) return <div className="error">Δεν βρέθηκε ενοικιαστής</div>;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("el-GR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("el-GR", {
      style: "currency",
      currency: "EUR"
    }).format(amount);
  };

  const getContractStatus = () => {
    const now = new Date();
    const start = new Date(tenant.contract_start);
    const end = new Date(tenant.contract_end);
    
    if (now < start) return { label: "Μελλοντικό", className: "status-future" };
    if (now > end) return { label: "Ληγμένο", className: "status-expired" };
    return { label: "Ενεργό", className: "status-active" };
  };

  const getDaysRemaining = () => {
    const now = new Date();
    const end = new Date(tenant.contract_end);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const status = getContractStatus();
  const daysRemaining = getDaysRemaining();

  return (
    <div className="tenant-detail-page">
      <div className="page-header">
        <div>
          <Link to="/tenants" className="back-link">← Πίσω</Link>
          <h1>{tenant.full_name}</h1>
        </div>
        <div className="actions">
          <Link to={`/tenants/${id}/edit`} className="button">Επεξεργασία</Link>
          <button onClick={handleDelete} className="button danger">Διαγραφή</button>
        </div>
      </div>

      <div className="detail-grid">
        <section className="card">
          <h2>Στοιχεία Επικοινωνίας</h2>
          <div className="info-group">
            <div className="info-row">
              <span className="label">Τηλέφωνο:</span>
              <span>{tenant.phone || "-"}</span>
            </div>
            <div className="info-row">
              <span className="label">Email:</span>
              <span>{tenant.email || "-"}</span>
            </div>
          </div>
        </section>

        <section className="card">
          <h2>Ακίνητο</h2>
          <div className="info-group">
            <div className="info-row">
              <span className="label">Τίτλος:</span>
              <span>{tenant.apartment_title || "-"}</span>
            </div>
            <div className="info-row">
              <span className="label">Διεύθυνση:</span>
              <span>{tenant.apartment_address}</span>
            </div>
            <Link to={`/apartments/${tenant.apartment}`} className="button" style={{ marginTop: "1rem" }}>
              Προβολή Ακινήτου
            </Link>
          </div>
        </section>

        <section className="card">
          <h2>Συμβόλαιο</h2>
          <div className="info-group">
            <div className="info-row">
              <span className="label">Κατάσταση:</span>
              <span className={`pill ${status.className}`}>{status.label}</span>
            </div>
            <div className="info-row">
              <span className="label">Έναρξη:</span>
              <span>{formatDate(tenant.contract_start)}</span>
            </div>
            <div className="info-row">
              <span className="label">Λήξη:</span>
              <span>{formatDate(tenant.contract_end)}</span>
            </div>
            {status.label === "Ενεργό" && (
              <div className="info-row">
                <span className="label">Ημέρες που απομένουν:</span>
                <span>{daysRemaining} ημέρες</span>
              </div>
            )}
          </div>
        </section>

        <section className="card">
          <h2>Οικονομικά</h2>
          <div className="info-group">
            <div className="info-row">
              <span className="label">Μηνιαίο Ενοίκιο:</span>
              <span className="highlight">{formatCurrency(tenant.monthly_rent)}</span>
            </div>
            <div className="info-row">
              <span className="label">Εγγύηση:</span>
              <span>{formatCurrency(tenant.deposit)}</span>
            </div>
          </div>
        </section>

        {tenant.notes && (
          <section className="card full-width">
            <h2>Σημειώσεις</h2>
            <p className="notes">{tenant.notes}</p>
          </section>
        )}

        <section className="card full-width">
          <h2>Ενοίκια ({payments.length})</h2>
          {payments.length === 0 ? (
            <div className="muted">Δεν υπάρχουν ενοίκια για αυτόν τον ενοικιαστή.</div>
          ) : (
            <div className="payments-list">
              {payments.map(payment => {
                const paidClass = payment.paid ? "paid" : "";
                const overdueClass = payment.is_overdue ? "overdue" : "";
                const dueDate = new Date(payment.due_date).toLocaleDateString("el-GR");
                const paidDate = payment.paid_date ? new Date(payment.paid_date).toLocaleDateString("el-GR") : null;

                return (
                  <div key={payment.id} className={`payment-item ${paidClass} ${overdueClass}`} style={{ paddingBottom: "12px", borderBottom: "1px solid var(--border)", marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ fontWeight: 600 }}>{payment.month}/{payment.year}</div>
                      <div>
                        {payment.paid ? (
                          <span className="pill" style={{ backgroundColor: "var(--success)", color: "white", borderColor: "transparent" }}>✓ Πληρώθηκε</span>
                        ) : payment.is_overdue ? (
                          <span className="pill status-expired">⚠ Ληξιπρόθεσμο</span>
                        ) : (
                          <span className="pill" style={{ backgroundColor: "var(--warning)", color: "white", borderColor: "transparent" }}>Αναμονή</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--text-secondary)" }}>
                      <div>
                        <div>Ποσό: {new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(payment.amount)}</div>
                        <div>Ημ. Λήξης: {dueDate}</div>
                        {paidDate && <div>Πληρώθηκε: {paidDate}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
