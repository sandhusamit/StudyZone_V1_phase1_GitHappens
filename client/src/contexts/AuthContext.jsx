/*
  AuthContext to manage user authentication and quiz data.
  Provides functions for user registration, login, logout, and fetching quizzes.
  Allows storing and accessing authentication state across the app - no need to recall API on every page.
  Uses service functions to interact with backend API - where the fetch requests are stored and managed.
*/
import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  registerUser as registerUserService,
  getUserDataById as getUserDataByIdService,
} from '../services/user';
import { getAllQuizzes as fetchQuizzesService } from '../services/quiz.js';
import { loginUser as loginUserService } from '../services/auth';
import { getAllQuestions as fetchQuestionsService,
          createQuestion as createQuestionService
} from '../services/question.js';
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
    const token = localStorage.getItem('token');
    if (userId && token) {
      console.log("AuthContext: Found userId and token in localStorage.");
      setAuthUserId(userId);
      setJwtToken(token);
      setIsLoggedIn(true);
    } // else condition

    setIsAuthorized(true);
  }, [jwtToken, authUserId, isLoggedIn]);


  // User Management 

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
      console.log("AuthContext: Attempting to log in user:", userData.email);
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
  
  // Quiz Management
  const fetchQuizzes = async () => {
    const data = await fetchQuizzesService(jwtToken);
    if (data && data.hasError) {
      navigate('/error', { state: data });
      return [];
    }
    return (Array.isArray(data) ? data : data.quizzes || []);
}

// Question Management
const fetchQuestions = async () => {
  const data = await fetchQuestionsService(jwtToken); 
  if (data && data.hasError) {
    navigate('/error', { state: data });
    return [];
  }
  return (Array.isArray(data) ? data : data.questions || []);
}

const createQuestion = async (question) => {
  const data = await createQuestionService(question, jwtToken);
  if (data && data.hasError) {
    navigate('/error', { state: data });
    return null;
  } 
  return data;
}

  return (
    <AuthContext.Provider
      value={{
        authUserId,
        jwtToken,
        isLoggedIn,
        isAuthorized,
        registerUser,
        loginUser,
        logoutUser,
        getCurrentUserData,
        fetchQuizzes,
        fetchQuestions,
        createQuestion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
