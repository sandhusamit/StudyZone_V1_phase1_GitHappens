import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectRoute({ children }) {
  const location = useLocation();

  const {
    isLoggedIn,
    authLoading,
  } = useAuth();

  if (authLoading) {
    return <p>Loading...</p>;
  }

  if (isLoggedIn) {
    return <>{children}</>;
  }

  return <Navigate to="/" state={{ from: location }} replace />;
}