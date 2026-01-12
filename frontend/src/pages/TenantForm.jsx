import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api, { extractData } from "../services/api";
import { useAuth } from "../auth/AuthContext";

export default function TenantForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { user } = useAuth();

  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    apartment: "",
    contract_start: "",
    contract_end: "",
    monthly_rent: "",
    payment_due_day: 5,
    deposit: "",
    notes: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch apartments
    api.get("apartments/")
      .then(res => setApartments(extractData(res.data)))
      .catch(err => console.error(err));

    // If editing, fetch tenant data
    if (isEdit) {
      api.get(`/tenants/${id}/`)
        .then(res => {
          const tenant = res.data;
          setFormData({
            full_name: tenant.full_name,
            phone: tenant.phone,
            email: tenant.email,
            apartment: tenant.apartment,
            contract_start: tenant.contract_start,
            contract_end: tenant.contract_end,
            monthly_rent: tenant.monthly_rent,
            payment_due_day: tenant.payment_due_day || 5,
            deposit: tenant.deposit,
            notes: tenant.notes
          });
          setLoading(false);
        })
        .catch(err => {
          setError(err.response?.data?.detail || "Αποτυχία φόρτωσης ενοικιαστή");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [id, isEdit]);

  // If apartment ID is in URL params, pre-select it
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const apartmentId = params.get("apartment");
    if (apartmentId) {
      setFormData(prev => ({ ...prev, apartment: apartmentId }));
    }
  }, []);

  if (user?.role === "accountant") {
    return <div className="page-content">Οι λογιστές έχουν μόνο ανάγνωση για τους ενοικιαστές.</div>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = "Απαιτείται όνομα ενοικιαστή";
    if (!formData.apartment) newErrors.apartment = "Απαιτείται επιλογή ακινήτου";
    if (!formData.contract_start) newErrors.contract_start = "Απαιτείται ημερομηνία έναρξης";
    if (!formData.monthly_rent) newErrors.monthly_rent = "Απαιτείται ποσό ενοικίου";
    if (parseFloat(formData.monthly_rent) <= 0) newErrors.monthly_rent = "Το ενοίκιο πρέπει να είναι θετικό";
    if (parseFloat(formData.deposit) < 0) newErrors.deposit = "Η εγγύηση δεν μπορεί να είναι αρνητική";

    // Check dates
    if (formData.contract_start && formData.contract_end) {
      if (new Date(formData.contract_start) > new Date(formData.contract_end)) {
        newErrors.contract_end = "Η ημερομηνία λήξης πρέπει να είναι μετά την ημερομηνία έναρξης";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        apartment: parseInt(formData.apartment),
        contract_start: formData.contract_start,
        contract_end: formData.contract_end || null,
        monthly_rent: parseFloat(formData.monthly_rent),
        deposit: parseFloat(formData.deposit) || 0,
        notes: formData.notes
      };

      if (isEdit) {
        await api.put(`/tenants/${id}/`, payload);
      } else {
        await api.post("/tenants/", payload);
      }
      navigate("/tenants");
    } catch (err) {
      setError(err.response?.data?.detail || "Αποτυχία αποθήκευσης ενοικιαστή");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Φόρτωση...</div>;

  return (
    <div className="form-page">
      <div className="page-header">
        <Link to="/tenants" className="back-link">← Πίσω</Link>
        <h1>{isEdit ? "Επεξεργασία Ενοικιαστή" : "Νέος Ενοικιαστής"}</h1>
      </div>

      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h2>Στοιχεία Ενοικιαστή</h2>

          <div className="field">
            <label>Ονοματεπώνυμο *</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="π.χ. Γιάννης Παπαδόπουλος"
            />
            {errors.full_name && <div className="error-text">{errors.full_name}</div>}
          </div>

          <div className="field">
            <label>Τηλέφωνο</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="π.χ. 6912345678"
            />
          </div>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="π.χ. giannis@example.com"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Ακίνητο & Συμβόλαιο</h2>

          <div className="field">
            <label>Ακίνητο *</label>
            <select
              name="apartment"
              value={formData.apartment}
              onChange={handleChange}
            >
              <option value="">-- Επιλέξτε ακίνητο --</option>
              {apartments.map(apt => (
                <option key={apt.id} value={apt.id}>
                  {apt.title || apt.address}
                </option>
              ))}
            </select>
            {errors.apartment && <div className="error-text">{errors.apartment}</div>}
          </div>

          <div className="form-row">
            <div className="field">
              <label>Ημ/νια Έναρξης *</label>
              <input
                type="date"
                name="contract_start"
                value={formData.contract_start}
                onChange={handleChange}
              />
              {errors.contract_start && <div className="error-text">{errors.contract_start}</div>}
            </div>

            <div className="field">
              <label>Ημ/νια Λήξης</label>
              <input
                type="date"
                name="contract_end"
                value={formData.contract_end}
                onChange={handleChange}
              />
              {errors.contract_end && <div className="error-text">{errors.contract_end}</div>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Οικονομικά</h2>

          <div className="form-row">
            <div className="field">
              <label>Μηνιαίο Ενοίκιο (€) *</label>
              <input
                type="number"
                name="monthly_rent"
                value={formData.monthly_rent}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.monthly_rent && <div className="error-text">{errors.monthly_rent}</div>}
            </div>

            <div className="field">
              <label>Προθεσμία Πληρωμής (μέρα του μήνα) *</label>
              <input
                type="number"
                name="payment_due_day"
                value={formData.payment_due_day}
                onChange={handleChange}
                placeholder="5"
                min="1"
                max="31"
              />
              <small style={{ color: "var(--text-secondary)" }}>π.χ. 5 = μέχρι τη 5η του μήνα</small>
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Εγγύηση (€)</label>
              <input
                type="number"
                name="deposit"
                value={formData.deposit}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.deposit && <div className="error-text">{errors.deposit}</div>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="field">
            <label>Σημειώσεις</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Επιπλέον πληροφορίες..."
              rows="4"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="button" onClick={() => navigate("/tenants")}>
            Ακύρωση
          </button>
          <button type="submit" className="button primary" disabled={submitting}>
            {submitting ? "Αποθήκευση..." : (isEdit ? "Ενημέρωση" : "Δημιουργία")}
          </button>
        </div>
      </form>
    </div>
  );
}
