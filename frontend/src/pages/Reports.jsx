import { useState, useEffect } from "react";
import api, { extractData } from "../services/api";

export default function Reports() {
  const [apartments, setApartments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [apartsRes, paymentsRes] = await Promise.all([
        api.get("apartments/"),
        api.get("payments/"),
      ]);
      setApartments(extractData(apartsRes.data));
      setPayments(extractData(paymentsRes.data));
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const generatePaymentsSummary = () => {
    let filtered = payments;

    if (selectedApartment) {
      filtered = filtered.filter(
        (p) => p.apartment_title === selectedApartment
      );
    }

    const [startYear, startMonth] = dateRange.startDate.split("-").map(Number);
    const [endYear, endMonth] = dateRange.endDate.split("-").map(Number);

    filtered = filtered.filter((p) => {
      const payDate = new Date(p.due_date);
      return (
        payDate >= new Date(startYear, startMonth - 1) &&
        payDate <= new Date(endYear, endMonth)
      );
    });

    const summary = {
      totalAmount: 0,
      paidAmount: 0,
      unpaidAmount: 0,
      paymentsCount: filtered.length,
      paidCount: 0,
      unpaidCount: 0,
      payments: filtered,
    };

    filtered.forEach((p) => {
      summary.totalAmount += parseFloat(p.amount);
      if (p.paid) {
        summary.paidAmount += parseFloat(p.amount);
        summary.paidCount++;
      } else {
        summary.unpaidAmount += parseFloat(p.amount);
        summary.unpaidCount++;
      }
    });

    return summary;
  };

  const calculateYearlyIncome = () => {
    const year = new Date().getFullYear();
    const yearPayments = payments.filter((p) => p.year === year && p.paid);
    
    const monthlyIncome = {};
    for (let i = 1; i <= 12; i++) {
      monthlyIncome[i] = yearPayments
        .filter((p) => p.month === i)
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    }
    return monthlyIncome;
  };

  const exportToCSV = (summary) => {
    let csv =
      "Αρ/Μο,Τενάντης,Ποσό,Κατάσταση,Ημ/νια Λήξης\n";
    summary.payments.forEach((p) => {
      csv += `"${p.month}/${p.year}","${p.tenant_name}",${p.amount},"${
        p.paid ? "Πληρώθηκε" : "Ληξιπρόθεσμο"
      }","${p.due_date}"\n`;
    });

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
    );
    element.setAttribute("download", `payments_report_${new Date().getTime()}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const summary = generatePaymentsSummary();
  const yearlyIncome = calculateYearlyIncome();
  const monthNames = [
    "Ιαν",
    "Φεβ",
    "Μαρ",
    "Απρ",
    "Μάι",
    "Ιουν",
    "Ιουλ",
    "Αυγ",
    "Σεπ",
    "Οκτ",
    "Νοε",
    "Δεκ",
  ];

  if (loading) return <div className="page">Φόρτωση...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>📊 Αναφορές & Εξαγωγή</h1>
      </div>

      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2>Φίλτρα Αναφοράς</h2>
        <div className="form-row">
          <div className="form-section">
            <label>Ακίνητο</label>
            <select
              value={selectedApartment || ""}
              onChange={(e) => setSelectedApartment(e.target.value || null)}
            >
              <option value="">Όλα τα Ακίνητα</option>
              {apartments.map((a) => (
                <option key={a.id} value={a.title}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <label>Από Ημερομηνία</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
            />
          </div>

          <div className="form-section">
            <label>Έως Ημερομηνία</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card card">
          <h3>Σύνολο Ποσού</h3>
          <p style={{ fontSize: "2rem", color: "var(--accent)", margin: "0.5rem 0" }}>
            €{summary.totalAmount.toFixed(2)}
          </p>
          <p className="muted">{summary.paymentsCount} Πληρωμές</p>
        </div>

        <div className="stat-card card">
          <h3>Πληρωμένο</h3>
          <p style={{ fontSize: "2rem", color: "var(--success)", margin: "0.5rem 0" }}>
            €{summary.paidAmount.toFixed(2)}
          </p>
          <p className="muted">{summary.paidCount} Πληρωμές</p>
        </div>

        <div className="stat-card card">
          <h3>Ληξιπρόθεσμο</h3>
          <p style={{ fontSize: "2rem", color: "var(--danger)", margin: "0.5rem 0" }}>
            €{summary.unpaidAmount.toFixed(2)}
          </p>
          <p className="muted">{summary.unpaidCount} Πληρωμές</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2>Ετήσιο Εισόδημα {new Date().getFullYear()}</h2>
        <div className="income-chart">
          {monthNames.map((month, idx) => (
            <div key={idx} className="month-bar">
              <div
                className="bar"
                style={{
                  height: `${Math.min((yearlyIncome[idx + 1] / Math.max(...Object.values(yearlyIncome)) || 1) * 100, 100)}%`,
                  backgroundColor: "var(--accent)",
                }}
              ></div>
              <p className="month-label">{month}</p>
              <p className="month-value">€{yearlyIncome[idx + 1].toFixed(0)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2>Κατάλογος Πληρωμών</h2>
        <button
          className="button primary"
          onClick={() => exportToCSV(summary)}
          style={{ marginBottom: "1rem" }}
        >
          ⬇️ Εξαγωγή σε CSV
        </button>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Περίοδος</th>
                <th>Ενοικιαστής</th>
                <th>Ποσό</th>
                <th>Κατάσταση</th>
                <th>Ημ/νια Λήξης</th>
              </tr>
            </thead>
            <tbody>
              {summary.payments.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>
                    Δεν υπάρχουν πληρωμές
                  </td>
                </tr>
              ) : (
                summary.payments.map((p, idx) => (
                  <tr key={idx}>
                    <td>
                      {p.month}/{p.year}
                    </td>
                    <td>{p.tenant_name}</td>
                    <td>€{parseFloat(p.amount).toFixed(2)}</td>
                    <td>
                      <span
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.85rem",
                          backgroundColor: p.paid
                            ? "rgba(16, 185, 129, 0.2)"
                            : "rgba(239, 68, 68, 0.2)",
                          color: p.paid
                            ? "var(--success)"
                            : "var(--danger)",
                        }}
                      >
                        {p.paid ? "✓ Πληρώθηκε" : "⚠ Ληξιπρόθεσμο"}
                      </span>
                    </td>
                    <td>{p.due_date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
