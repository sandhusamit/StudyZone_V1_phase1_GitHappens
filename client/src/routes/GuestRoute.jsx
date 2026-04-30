import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function GuestRoute({ children, allowGuestToken = false }) {
  const location = useLocation();

  const {
    isLoggedIn,
    isGuestLoggedIn,
    authLoading,
  } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const guestToken = searchParams.get("guestToken");

  if (authLoading) {
    return <p>Loading...</p>;
  }

  if (isLoggedIn || isGuestLoggedIn) {
    return <>{children}</>;
  }

  if (allowGuestToken && guestToken) {
    return <>{children}</>;
  }

  return <Navigate to="/" state={{ from: location }} replace />;
}