import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function GuestRoute({ children, allowGuestToken = false }) {
  const location = useLocation();

  const {
    isLoggedIn,
    isGuestLoggedIn,
    authLoading,
  } = useAuth();


  if (authLoading) {
    return <p>Loading...</p>;
  }

  if (isLoggedIn || isGuestLoggedIn) {
    return <>{children}</>;
  }


  return <Navigate to="/" state={{ from: location }} replace />
};