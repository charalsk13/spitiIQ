// src/pages/Login.jsx
import { useState, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const { login, loading } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Λάθος στοιχεία.";
      setError(msg);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card card">
        <h2 style={{ marginBottom: "8px" }}>Σύνδεση</h2>
      
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
            <label>Κωδικός</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="button primary" type="submit" disabled={loading}>
            {loading ? "Σύνδεση..." : "Σύνδεση"}
          </button>
        </form>
        <div className="muted" style={{ marginTop: 12 }}>
          Δεν έχεις λογαριασμό; <Link to="/register">Εγγραφή</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
