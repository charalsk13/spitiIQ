// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { extractData } from "../services/api";

const Dashboard = () => {
  const [apartments, setApartments] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    api.get("apartments/")
      .then(res => setApartments(extractData(res.data)))
      .catch(err => console.error(err));
    
    api.get("/payments/")
      .then(res => setPayments(extractData(res.data)))
      .catch(err => console.error(err));
  }, []);

  const total = apartments.length;
  const rented = apartments.filter(a => a.status === 'rented' || a.status === 'ενοικιασμένο').length;

  // Calculate income stats
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const monthlyIncome = payments
    .filter(p => p.paid && p.month === currentMonth && p.year === currentYear)
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const yearlyIncome = payments
    .filter(p => p.paid && p.year === currentYear)
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const overduePayments = payments.filter(p => p.is_overdue).length;

  const overduePaidList = payments.filter(p => p.is_overdue && !p.paid);

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
          <h1>Πίνακας Ελέγχου</h1>
          <div className="muted">Σύνοψη ακινήτων & εσόδων</div>
        </div>
        <Link className="button primary" to="/apartments">Δείτε όλα τα ακίνητα</Link>
      </div>

      <div className="stat-grid">
        <div className="card">
          <div className="stat-card-title">Σύνολο ακινήτων</div>
          <div className="stat-card-value">{total}</div>
        </div>
        <div className="card">
          <div className="stat-card-title">Ενοικιασμένα</div>
          <div className="stat-card-value">{rented}</div>
        </div>
        <div className="card">
          <div className="stat-card-title">Έσοδα Μήνα</div>
          <div className="stat-card-value" style={{ color: "var(--accent-strong)" }}>
            {formatCurrency(monthlyIncome)}
          </div>
        </div>
        <div className="card">
          <div className="stat-card-title">Έσοδα Έτους</div>
          <div className="stat-card-value" style={{ color: "var(--accent-strong)" }}>
            {formatCurrency(yearlyIncome)}
          </div>
        </div>
        {overduePayments > 0 && (
          <div className="card">
            <div className="stat-card-title">Ληξιπρόθεσμα</div>
            <div className="stat-card-value" style={{ color: "#ef4444" }}>
              {overduePayments}
            </div>
          </div>
        )}
      </div>

      {overduePaidList.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>⚠️ Ληξιπρόθεσμα Ενοίκια</h2>
          <div className="card" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>Ενοικιαστής</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>Ακίνητο</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>Περίοδος</th>
                  <th style={{ padding: "12px", textAlign: "right", fontWeight: 600 }}>Ποσό</th>
                </tr>
              </thead>
              <tbody>
                {overduePaidList.map(payment => (
                  <tr key={payment.id} style={{ borderBottom: "1px solid var(--border)", backgroundColor: "rgba(239, 68, 68, 0.1)" }}>
                    <td style={{ padding: "12px" }}>{payment.tenant_name}</td>
                    <td style={{ padding: "12px" }}>{payment.apartment_title}</td>
                    <td style={{ padding: "12px" }}>{getMonthName(payment.month)} {payment.year}</td>
                    <td style={{ padding: "12px", textAlign: "right", fontWeight: 600, color: "#ef4444" }}>
                      {formatCurrency(payment.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
