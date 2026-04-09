import { useLocation } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function GuestRoute({ children }) {
const { isLoggedIn, isGuest, authLoading } = useAuth();  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const guestToken = searchParams.get("guestToken");


  if (isLoggedIn || isGuest || guestToken) {
    return children;
  }

  return <Navigate to="/" />;
}