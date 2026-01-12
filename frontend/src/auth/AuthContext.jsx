// src/auth/AuthContext.jsx
import { createContext, useEffect, useState, useContext } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    setUser(null);
  };

  const fetchMe = async () => {
    try {
      const me = await api.get("users/me/");
      setUser(me.data);
      localStorage.setItem("username", me.data.username);
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("token/", { username, password });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      await fetchMe();
      return true;
    } catch (err) {
      const msg = err?.response?.data?.detail || "Αποτυχία σύνδεσης";
      setError(msg);
      setLoading(false);
      throw err;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

// Convenience hook to access auth context
export const useAuth = () => useContext(AuthContext);
