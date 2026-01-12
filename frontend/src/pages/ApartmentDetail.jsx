import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { extractData } from "../services/api";

const ApartmentDetail = () => {
  const { id } = useParams();
  const [apartment, setApartment] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [formData, setFormData] = useState({
    payment_method: "",
    receipt_number: "",
    notes: ""
  });
  const [newPaymentForm, setNewPaymentForm] = useState({
    tenant: "",
    month: "",
    year: new Date().getFullYear(),
    amount: "",
    payment_method: "",
    receipt_number: "",
    notes: ""
  });

  useEffect(() => {
    if (!id) return;
    
    api.get(`apartments/${id}/`)
      .then(res => setApartment(res.data))
      .catch(err => console.error("Error loading apartment:", err));
    
    // Fetch tenants for this apartment
    api.get('/tenants/')
      .then(res => {
        const apartmentTenants = extractData(res.data).filter(t => t.apartment === parseInt(id));
        console.log("Apartment tenants:", apartmentTenants);
        setTenants(apartmentTenants);
        
        // Then fetch payments and filter by apartment tenants
        api.get('/payments/')
          .then(payRes => {
            const allPayments = extractData(payRes.data);
            console.log("All payments:", allPayments);
            const apartmentPayments = allPayments.filter(p => 
              apartmentTenants.some(t => t.id === p.tenant)
            );
            console.log("Filtered apartment payments:", apartmentPayments);
            setPayments(apartmentPayments);
          })
          .catch(err => console.error("Error loading payments:", err));
      })
      .catch(err => console.error("Error loading tenants:", err));
  }, [id]);

  if (!apartment) return <div className="muted">Φόρτωση...</div>;

  const markPaymentPaid = (payment) => {
    if (!formData.payment_method) {
      alert("Παρακαλώ επιλέξτε τρόπο πληρωμής");
      return;
    }

    api.post(`/payments/${payment.id}/mark_paid/`, formData)
      .then(() => {
        // Reload payments
        api.get('/payments/')
          .then(res => {
            const allPayments = extractData(res.data);
            const apartmentPayments = allPayments.filter(p => 
              tenants.some(t => t.id === p.tenant)
            );
            setPayments(apartmentPayments);
          });
        setShowPaymentModal(false);
        setFormData({ payment_method: "", receipt_number: "", notes: "" });
        setSelectedPayment(null);
      })
      .catch((err) => {
        alert(err.response?.data?.detail || "Αποτυχία ενημέρωσης πληρωμής");
      });
  };

  const openPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setFormData({
      payment_method: payment.payment_method || "",
      receipt_number: payment.receipt_number || "",
      notes: payment.notes || ""
    });
    setShowPaymentModal(true);
  };

  const createNewPayment = () => {
    if (!newPaymentForm.tenant) {
      alert("Παρακαλώ επιλέξτε ενοικιαστή");
      return;
    }
    if (!newPaymentForm.month || !newPaymentForm.year) {
      alert("Παρακαλώ επιλέξτε μήνα και χρόνο");
      return;
    }
    if (!newPaymentForm.amount || parseFloat(newPaymentForm.amount) <= 0) {
      alert("Παρακαλώ εισάγετε ένα έγκυρο ποσό");
      return;
    }
    if (!newPaymentForm.payment_method) {
      alert("Παρακαλώ επιλέξτε τρόπο πληρωμής");
      return;
    }

    // Calculate due_date - last day of the month
    const year = parseInt(newPaymentForm.year);
    const month = parseInt(newPaymentForm.month);
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const dueDate = new Date(year, month - 1, lastDayOfMonth);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const payload = {
      tenant: parseInt(newPaymentForm.tenant),
      month: parseInt(newPaymentForm.month),
      year: parseInt(newPaymentForm.year),
      amount: parseFloat(newPaymentForm.amount),
      payment_method: newPaymentForm.payment_method,
      receipt_number: newPaymentForm.receipt_number,
      notes: newPaymentForm.notes,
      paid: true,
      paid_date: new Date().toISOString().split('T')[0],
      due_date: dueDateStr
    };

    console.log("Sending payload:", payload);

    api.post('/payments/', payload)
      .then(() => {
        // Reload payments
        api.get('/payments/')
          .then(res => {
            const allPayments = extractData(res.data);
            const apartmentPayments = allPayments.filter(p => 
              tenants.some(t => t.id === p.tenant)
            );
            setPayments(apartmentPayments);
          });
        setShowAddPaymentModal(false);
        setNewPaymentForm({
          tenant: "",
          month: "",
          year: new Date().getFullYear(),
          amount: "",
          payment_method: "",
          receipt_number: "",
          notes: ""
        });
        alert("Η πληρωμή προστέθηκε επιτυχώς!");
      })
      .catch((err) => {
        console.error("Error details:", err.response?.data);
        alert(err.response?.data?.detail || JSON.stringify(err.response?.data) || "Αποτυχία δημιουργίας πληρωμής");
      });
  };


  const getMonthName = (month) => {
    const months = [
      "Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος",
      "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"
    ];
    return months[month - 1];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("el-GR", {
      style: "currency",
      currency: "EUR"
    }).format(amount);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{apartment.title || apartment.address}</h1>
          <div className="muted">{apartment.address}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link className="button" to="/apartments">← Επιστροφή</Link>
          <Link className="button primary" to={`/apartments/${id}/edit`}>Επεξεργασία</Link>
        </div>
      </div>

      <div className="detail-grid">
        <div className="section-card">
          <div className="muted">Τετραγωνικά</div>
          <div style={{ fontWeight: 700 }}>{apartment.square_meters} τ.μ.</div>
        </div>
        <div className="section-card">
          <div className="muted">Όροφος</div>
          <div style={{ fontWeight: 700 }}>{apartment.floor || "-"}</div>
        </div>
        <div className="section-card">
          <div className="muted">Έτος κατασκευής</div>
          <div style={{ fontWeight: 700 }}>{apartment.year_built || "-"}</div>
        </div>
        <div className="section-card">
          <div className="muted">Κατάσταση</div>
          <div style={{ fontWeight: 700 }}>{apartment.status}</div>
        </div>
      </div>

      <h2 className="section-title">Ενοικιαστής</h2>
      <div className="section-card">
        {tenants.length === 0 ? (
          <div>
            <div className="muted">Δεν υπάρχει τρέχων ενοικιαστής.</div>
            <Link to={`/tenants/new?apartment=${id}`} className="button primary" style={{ marginTop: "1rem" }}>
              + Προσθήκη Ενοικιαστή
            </Link>
          </div>
        ) : (
          tenants.map(tenant => {
            const now = new Date();
            const start = new Date(tenant.contract_start);
            const end = new Date(tenant.contract_end);
            const isActive = start <= now && now <= end;
            
            return (
              <div key={tenant.id} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{tenant.full_name}</strong>
                    {isActive && <span className="pill status-active" style={{ marginLeft: 8 }}>Ενεργό</span>}
                    {!isActive && now > end && <span className="pill status-expired" style={{ marginLeft: 8 }}>Ληγμένο</span>}
                  </div>
                  <Link to={`/tenants/${tenant.id}`} className="button">Προβολή</Link>
                </div>
                <div className="muted" style={{ marginTop: 8 }}>
                  <div>Ενοίκιο: {new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(tenant.monthly_rent)}</div>
                  <div>Διάρκεια: {new Date(tenant.contract_start).toLocaleDateString("el-GR")} - {new Date(tenant.contract_end).toLocaleDateString("el-GR")}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <h2 className="section-title">Φωτογραφίες</h2>
      <div className="photo-grid">
        {(apartment.photos || []).length === 0 && <div className="muted">Δεν υπάρχουν φωτογραφίες.</div>}
        {(apartment.photos || []).map((p) => (
          <div key={p.id} className="photo-tile">
            <img src={p.url} alt={p.caption || ""} />
            <div className="muted" style={{ fontSize: 12 }}>{p.date}</div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Timeline</h2>
      <div className="section-card">
        {(apartment.timeline || []).length === 0 ? (
          <div className="muted">Δεν υπάρχουν συμβάντα για το ακίνητο.</div>
        ) : (
          (apartment.timeline || []).map((t, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong>{t.year}</strong>: {t.note}
            </div>
          ))
        )}
      </div>

      <h2 className="section-title">Πληρωμές Ενοικίου</h2>
      <div style={{ marginBottom: "1rem" }}>
        <button className="button primary" onClick={() => setShowAddPaymentModal(true)}>
          ➕ Εισαγωγή Λήψης
        </button>
      </div>
      <div className="section-card">
        {payments.length === 0 ? (
          <div className="muted">Δεν υπάρχουν πληρωμές για εμφάνιση.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>Ενοικιαστής</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>Μήνας</th>
                  <th style={{ padding: "12px", textAlign: "right", fontWeight: 600 }}>Ποσό</th>
                  <th style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>Κατάσταση</th>
                  <th style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>Ενέργεια</th>
                </tr>
              </thead>
              <tbody>
                {payments
                  .sort((a, b) => {
                    const aDate = new Date(b.year, b.month - 1);
                    const bDate = new Date(a.year, a.month - 1);
                    return aDate - bDate;
                  })
                  .map(payment => (
                    <tr key={payment.id} style={{ borderBottom: "1px solid var(--border)", backgroundColor: payment.is_overdue ? "rgba(255, 0, 0, 0.05)" : "transparent" }}>
                      <td style={{ padding: "12px" }}>{payment.tenant_name}</td>
                      <td style={{ padding: "12px" }}>{getMonthName(payment.month)} {payment.year}</td>
                      <td style={{ padding: "12px", textAlign: "right", fontWeight: 600 }}>{formatCurrency(payment.amount)}</td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        {payment.paid ? (
                          <span style={{ color: "var(--success)", fontWeight: 600 }}>✓ Πληρώθηκε</span>
                        ) : (
                          <span style={{ color: "var(--warning)", fontWeight: 600 }}>⏳ Απλήρωτη</span>
                        )}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        {!payment.paid && (
                          <button
                            className="button primary"
                            style={{ fontSize: "12px", padding: "6px 12px" }}
                            onClick={() => openPaymentModal(payment)}
                          >
                            ✔️ Πληρώθηκε
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Εισαγωγή Λήψης Ενοικίου</h2>
              <button className="close-button" onClick={() => setShowPaymentModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="info-section">
                <h3>{selectedPayment.tenant_name}</h3>
                <p className="muted">{selectedPayment.apartment_title}</p>
                <div style={{ marginTop: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Μήνας:</span>
                    <strong>{getMonthName(selectedPayment.month)} {selectedPayment.year}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Ποσό:</span>
                    <strong>{formatCurrency(selectedPayment.amount)}</strong>
                  </div>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                markPaymentPaid(selectedPayment);
              }} className="form">
                <div className="form-group">
                  <label>Τρόπος Πληρωμής *</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    required
                  >
                    <option value="">Επιλέξτε τρόπο πληρωμής</option>
                    <option value="cash">Μετρητά</option>
                    <option value="bank_transfer">Τραπεζική Μεταφορά</option>
                    <option value="check">Επιταγή</option>
                    <option value="card">Κάρτα</option>
                    <option value="other">Άλλο</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Αριθμός Απόδειξης / Αναφορά</label>
                  <input
                    type="text"
                    value={formData.receipt_number}
                    onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                    placeholder="π.χ. Αρ. Απόδειξης, IBAN, κ.λπ."
                  />
                </div>

                <div className="form-group">
                  <label>Σημειώσεις</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Προσθέστε σημειώσεις εδώ..."
                    rows="3"
                  ></textarea>
                </div>

                <div className="modal-actions">
                  <button type="button" className="button ghost" onClick={() => setShowPaymentModal(false)}>
                    Ακύρωση
                  </button>
                  <button type="submit" className="button primary">
                    ✓ Επιβεβαίωση Λήψης
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showAddPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowAddPaymentModal(false)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Εισαγωγή Νέας Λήψης</h2>
              <button className="close-button" onClick={() => setShowAddPaymentModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                createNewPayment();
              }} className="form">
                <div className="form-group">
                  <label>Ενοικιαστής *</label>
                  <select
                    value={newPaymentForm.tenant}
                    onChange={(e) => setNewPaymentForm({ ...newPaymentForm, tenant: e.target.value })}
                    required
                  >
                    <option value="">Επιλέξτε ενοικιαστή</option>
                    {tenants.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Μήνας *</label>
                  <select
                    value={newPaymentForm.month}
                    onChange={(e) => setNewPaymentForm({ ...newPaymentForm, month: e.target.value })}
                    required
                  >
                    <option value="">Επιλέξτε μήνα</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                      <option key={month} value={month}>
                        {getMonthName(month)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Χρόνος *</label>
                  <select
                    value={newPaymentForm.year}
                    onChange={(e) => setNewPaymentForm({ ...newPaymentForm, year: e.target.value })}
                    required
                  >
                    {[2024, 2025, 2026, 2027].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Ποσό *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPaymentForm.amount}
                    onChange={(e) => setNewPaymentForm({ ...newPaymentForm, amount: e.target.value })}
                    placeholder="π.χ. 500.00"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Τρόπος Πληρωμής *</label>
                  <select
                    value={newPaymentForm.payment_method}
                    onChange={(e) => setNewPaymentForm({ ...newPaymentForm, payment_method: e.target.value })}
                    required
                  >
                    <option value="">Επιλέξτε τρόπο πληρωμής</option>
                    <option value="cash">Μετρητά</option>
                    <option value="bank_transfer">Τραπεζική Μεταφορά</option>
                    <option value="check">Επιταγή</option>
                    <option value="card">Κάρτα</option>
                    <option value="other">Άλλο</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Αριθμός Απόδειξης / Αναφορά</label>
                  <input
                    type="text"
                    value={newPaymentForm.receipt_number}
                    onChange={(e) => setNewPaymentForm({ ...newPaymentForm, receipt_number: e.target.value })}
                    placeholder="π.χ. Αρ. Απόδειξης, IBAN, κ.λπ."
                  />
                </div>

                <div className="form-group">
                  <label>Σημειώσεις</label>
                  <textarea
                    value={newPaymentForm.notes}
                    onChange={(e) => setNewPaymentForm({ ...newPaymentForm, notes: e.target.value })}
                    placeholder="Προσθέστε σημειώσεις εδώ..."
                    rows="3"
                  ></textarea>
                </div>

                <div className="modal-actions">
                  <button type="button" className="button ghost" onClick={() => setShowAddPaymentModal(false)}>
                    Ακύρωση
                  </button>
                  <button type="submit" className="button primary">
                    ✓ Δημιουργία Πληρωμής
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApartmentDetail;
