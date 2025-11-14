import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser as registerUserService } from '../services/user';
import { loginUser as loginUserService } from '../services/auth';

const AuthContext = createContext();

// Checks local storage for user and auth data every time the app loads.
export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [authUser, setAuthUser] = useState(null);
  const [jwtToken, setJwtToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('bearer_token');
    if (user && token) {
      setAuthUser(JSON.parse(user));
      setJwtToken(JSON.parse(token));
    }

    setIsAuthorized(true);
  }, []);

  const registerUser = async (user) => {
    try {
      const data = await registerUserService(user);
      if (data && data.hasError) navigate('/error', { state: data.message });
      if (data && !data.hasError) navigate('/login');
    } catch (error) {
      navigate('/error', {
        state: 'A serious error occurred while registering.\nPlease try again.',
      });
    }
  };

  const loginUser = async (user) => {
    try {
      const data = await loginUserService(user); // null check for data?
      console.log('LoGGED IN');
      console.table(data);
      if (data && data.hasError) navigate('/error', { state: data.message });
      if (data && !data.hasError) {
        const { token, user } = data; // Should we perform null checks for token and user?
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('bearer_token', token);
        setAuthUser(user);
        setJwtToken(token);
        setIsLoggedIn(true);
      }
    } catch (error) {
      navigate('/error', {
        state: 'A serious error occurred while logging in.\nPlease try again.',
      });
    }
  };

  const logoutUser = async () => {
    localStorage.remove('user');
    localStorage.remove('bearer_token');
    setAuthUser(null);
    setJwtToken('');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <AuthContext
      value={{
        authUser,
        jwtToken,
        isLoggedIn,
        isAuthorized,
        // setAuthUser,
        // setJwtToken,
        // setIsLoggedIn,
        // setIsAuthorized,
        registerUser,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
