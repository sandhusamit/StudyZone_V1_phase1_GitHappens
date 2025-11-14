import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  registerUser as registerUserService,
  getUserDataById as getUserDataByIdService,
} from '../services/user';
import { loginUser as loginUserService } from '../services/auth';

const AuthContext = createContext();

// Checks local storage for user and auth data every time the app loads.
export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [authUserId, setAuthUserId] = useState('');
  const [jwtToken, setJwtToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('bearer_token');
    if (userId && token) {
      setAuthUserId(userId);
      setJwtToken(token);
      setIsLoggedIn(true);
    } // else condition

    setIsAuthorized(true);
  }, [jwtToken, authUserId, isLoggedIn]);

  const registerUser = async (userData) => {
    try {
      const data = await registerUserService(userData);
      if (data && data.hasError) navigate('/error', { state: { message: data } });
      if (data && !data.hasError) navigate('/login');
    } catch (error) {
      navigate('/error', {
        state: 'A serious error occurred while registering.\nPlease try again.',
      });
    }
  };

  const loginUser = async (userData) => {
    try {
      const data = await loginUserService(userData); // null check for data?
      if (data && data.hasError) navigate('/error', { state: data });
      if (data && !data.hasError) {
        const { token, user } = data; // Should we perform null checks for token and user?
        localStorage.setItem('userId', user._id);
        localStorage.setItem('bearer_token', token);
        setAuthUserId(user._id);
        setJwtToken(token);
        setIsLoggedIn(true);
        navigate('/');
      }
    } catch (error) {
      navigate('/error', {
        state: 'A serious error occurred while logging in.\nPlease try again.',
      });
    }
  };

  const logoutUser = async () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('bearer_token');
    setAuthUserId('');
    setJwtToken('');
    setIsLoggedIn(false);
    navigate('/');
  };

  const getCurrentUserData = async () => {
    try {
      const data = await getUserDataByIdService(authUserId, jwtToken); // null check for data?
      if (data && data.hasError) navigate('/error', { state: data });
      if (data && !data.hasError) {
        return data.user;
      }
    } catch (error) {
      navigate('/error', {
        state: 'A serious error occurred.',
      });
    }
  };

  return (
    <AuthContext
      value={{
        authUserId,
        jwtToken,
        isLoggedIn,
        isAuthorized,
        registerUser,
        loginUser,
        logoutUser,
        getCurrentUserData,
      }}
    >
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
