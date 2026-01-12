import { Navigate } from "react-router-dom";

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload?.exp) return true;
    return payload.exp * 1000 > Date.now();
  } catch (e) {
    return false;
  }
};

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("access");
  const valid = isTokenValid(token);
  if (!valid) {
    localStorage.removeItem("access");
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default PrivateRoute;