import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Wrap this around components that require authorization.
export default function AuthRoutes({ children }) {
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  return isLoggedIn ? (
    <>{children}</>
  ) : (
    <>
      <Navigate to="/" state={{ from: location }} replace />
    </>
  );
}
