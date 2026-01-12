import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, paid, unpaid, overdue
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [formData, setFormData] = useState({
    payment_method: "",
    receipt_number: "",
    notes: ""
  });

  const loadPayments = () => {
    api.get("/payments/")
      .then((res) => {
        // Handle both direct array and paginated response
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        console.log("Payments loaded:", data);
        setPayments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading payments:", err);
        setError(err.response?.data?.detail || "Αποτυχία φόρτωσης πληρωμών");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const markPaid = (paymentId) => {
    if (!formData.payment_method) {
      alert("Παρακαλώ επιλέξτε τρόπο πληρωμής");
      return;
    }
    api.post(`/payments/${paymentId}/mark_paid/`, formData)
      .then(() => {
        loadPayments();
        setShowModal(false);
        setFormData({ payment_method: "", receipt_number: "", notes: "" });
      })
      .catch((err) => {
        alert(err.response?.data?.detail || "Αποτυχία ενημέρωσης πληρωμής");
      });
  };

  const markUnpaid = (paymentId) => {
    api.post(`/payments/${paymentId}/mark_unpaid/`)
      .then(() => {
        loadPayments();
      })
      .catch((err) => {
        alert(err.response?.data?.detail || "Αποτυχία ενημέρωσης πληρωμής");
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPayment) return;

    const updateData = {
      payment_method: formData.payment_method,
      receipt_number: formData.receipt_number,
      notes: formData.notes,
      paid: true
    };

    api.patch(`/payments/${selectedPayment.id}/`, updateData)
      .then(() => {
        loadPayments();
        setShowModal(false);
        setFormData({ payment_method: "", receipt_number: "", notes: "" });
        setSelectedPayment(null);
      })
      .catch((err) => {
        alert(err.response?.data?.detail || "Αποτυχία ενημέρωσης πληρωμής");
      });
  };

  const openModal = (payment) => {
    setSelectedPayment(payment);
    setFormData({
      payment_method: payment.payment_method || "",
      receipt_number: payment.receipt_number || "",
      notes: payment.notes || ""
    });
    setShowModal(true);
  };

  if (loading) return <div className="loading">Φόρτωση...</div>;
  if (error) return <div className="error">{error}</div>;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("el-GR", {
      style: "currency",
      currency: "EUR"
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("el-GR");
  };

  const getMonthName = (month) => {
    const months = [
      "Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος",
      "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"
    ];
    return months[month - 1];
  };

  // Filter payments
  const filteredPayments = payments.filter(p => {
    if (filter === "paid") return p.paid;
    if (filter === "unpaid") return !p.paid;
    if (filter === "overdue") return p.is_overdue;
    return true;
  });

  // Group by year and month
  const groupedPayments = filteredPayments.reduce((acc, payment) => {
    const key = `${payment.year}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(payment);
    return acc;
  }, {});

  // Sort years descending
  const sortedYears = Object.keys(groupedPayments).sort((a, b) => b - a);

  // Calculate stats
  const totalPaid = payments.filter(p => p.paid).reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const totalUnpaid = payments.filter(p => !p.paid).reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const overdueCount = payments.filter(p => p.is_overdue).length;

  return (
    <div className="payments-page">
      <div className="page-header">
        <h1>Ενοίκια & Πληρωμές</h1>
      </div>

      <div className="payment-stats">
        <div className="stat-card card">
          <div className="stat-card-title">Πληρωμένα</div>
          <div className="stat-card-value" style={{ color: "var(--success)" }}>
            {formatCurrency(totalPaid)}
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-card-title">Απλήρωτα</div>
          <div className="stat-card-value" style={{ color: "var(--warning)" }}>
            {formatCurrency(totalUnpaid)}
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-card-title">Ληξιπρόθεσμα</div>
          <div className="stat-card-value" style={{ color: "var(--danger)" }}>
            {overdueCount}
          </div>
        </div>
      </div>

      <div className="payment-filters">
        <button
          className={`button ${filter === "all" ? "primary" : ""}`}
          onClick={() => setFilter("all")}
        >
          Όλα ({payments.length})
        </button>
        <button
          className={`button ${filter === "paid" ? "primary" : ""}`}
          onClick={() => setFilter("paid")}
        >
          Πληρωμένα ({payments.filter(p => p.paid).length})
        </button>
        <button
          className={`button ${filter === "unpaid" ? "primary" : ""}`}
          onClick={() => setFilter("unpaid")}
        >
          Απλήρωτα ({payments.filter(p => !p.paid).length})
        </button>
        <button
          className={`button ${filter === "overdue" ? "primary" : ""}`}
          onClick={() => setFilter("overdue")}
        >
          Ληξιπρόθεσμα ({overdueCount})
        </button>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="empty-state">
          <p>Δεν υπάρχουν πληρωμές για εμφάνιση.</p>
        </div>
      ) : (
        sortedYears.map(year => (
          <section key={year} className="year-section">
            <h2>{year}</h2>
            <div className="payments-grid">
              {groupedPayments[year]
                .sort((a, b) => b.month - a.month)
                .map(payment => (
                  <div
                    key={payment.id}
                    className={`payment-card card ${payment.is_overdue ? "overdue" : ""} ${payment.paid ? "paid" : ""}`}
                  >
                    <div className="payment-header">
                      <div>
                        <div className="payment-month">{getMonthName(payment.month)}</div>
                        <div className="payment-tenant">{payment.tenant_name}</div>
                        <div className="muted">{payment.apartment_title || payment.apartment_address}</div>
                      </div>
                      <div className="payment-amount">{formatCurrency(payment.amount)}</div>
                    </div>
                    
                    <div className="payment-details">
                      <div className="info-row">
                        <span className="label">Προθεσμία:</span>
                        <span className={payment.is_overdue ? "overdue-text" : ""}>
                          {formatDate(payment.due_date)}
                        </span>
                      </div>
                      {payment.paid && payment.paid_date && (
                        <div className="info-row">
                          <span className="label">Πληρώθηκε:</span>
                          <span>{formatDate(payment.paid_date)}</span>
                        </div>
                      )}
                    </div>

                    <div className="payment-actions">
                      {payment.paid ? (
                        <>
                          <span className="pill status-active">✓ Πληρώθηκε</span>
                          <button
                            className="button ghost"
                            onClick={() => markUnpaid(payment.id)}
                          >
                            Ακύρωση
                          </button>
                        </>
                      ) : (
                        <button
                          className="button primary"
                          onClick={() => openModal(payment)}
                        >
                          ✔️ Εισαγωγή Λήψης
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        ))
      )}

      {/* Modal Εισαγωγής Ενοικίου */}
      {showModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Εισαγωγή Λήψης Ενοικίου</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="info-section">
                <h3>{selectedPayment.tenant_name}</h3>
                <p className="muted">{selectedPayment.apartment_title}</p>
                <p className="muted">{selectedPayment.apartment_address}</p>
                <div className="info-row" style={{ marginTop: "1rem" }}>
                  <span className="label">Μήνας:</span>
                  <span>{getMonthName(selectedPayment.month)} {selectedPayment.year}</span>
                </div>
                <div className="info-row">
                  <span className="label">Ποσό:</span>
                  <span style={{ fontWeight: "bold" }}>{formatCurrency(selectedPayment.amount)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Προθεσμία:</span>
                  <span>{formatDate(selectedPayment.due_date)}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="form">
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
                    rows="4"
                  ></textarea>
                </div>

                <div className="modal-actions">
                  <button type="button" className="button ghost" onClick={() => setShowModal(false)}>
                    Ακύρωση
                  </button>
                  <button type="button" className="button primary" onClick={() => markPaid(selectedPayment.id)}>
                    ✓ Επιβεβαίωση Λήψης
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
