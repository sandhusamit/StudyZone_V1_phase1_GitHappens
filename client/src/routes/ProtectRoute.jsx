import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectRoute({ children }) {
  const location = useLocation();
  const { isLoggedIn, isLoading } = useAuth();

  return isLoading ? (
    <p>Loading...</p>
  ) : isLoggedIn ? (
    <>{children}</>
  ) : (
    <>
      <Navigate to="/" state={{ from: location }} replace={true} />
    </>
  );
}
