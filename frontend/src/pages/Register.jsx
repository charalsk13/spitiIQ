// src/pages/Register.jsx
import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("owner");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("users/register/", {
        username,
        password,
        email,
        full_name: fullName,
        role,
      });
      navigate("/login");
    } catch (err) {
      const data = err?.response?.data;
      if (data) {
        const message = Object.values(data).flat().join(" ") || "Αποτυχία εγγραφής";
        setError(message);
      } else {
        setError("Αποτυχία εγγραφής");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card card">
        <h2 style={{ marginBottom: "8px" }}>Εγγραφή</h2>
       
        {error && <div className="alert error" style={{ marginTop: 12 }}>{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label>Όνομα χρήστη</label>
            <input
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Ονοματεπώνυμο</label>
            <input
              name="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Κωδικός</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Ρόλος</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="owner">Ιδιοκτήτης</option>
              <option value="admin">Διαχειριστής</option>
              <option value="accountant">Λογιστής (μόνο ανάγνωση)</option>
            </select>
          </div>
          <button className="button primary" type="submit" disabled={loading}>
            {loading ? "Εγγραφή..." : "Εγγραφή"}
          </button>
        </form>
        <div className="muted" style={{ marginTop: 12 }}>
          Έχεις ήδη λογαριασμό; <Link to="/login">Σύνδεση</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
