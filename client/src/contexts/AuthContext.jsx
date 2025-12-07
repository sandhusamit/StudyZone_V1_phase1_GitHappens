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
import {
  getAllQuizzes as fetchQuizzesService,
  createQuiz as createQuizService,
  removeQuiz as deleteQuizService,
  updateQuiz as updateQuizService,
} from '../services/quiz.js';
import { loginUser as loginUserService } from '../services/auth';
import {
  getAllQuestions as fetchQuestionsService,
  createQuestion as createQuestionService,
  updateQuestion as updateQuestionService,
} from '../services/question.js';

export const AuthContext = createContext();

// Checks local storage for user and auth data every time the app loads.
export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [authUserId, setAuthUserId] = useState('');
  const [jwtToken, setJwtToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  

  useEffect(() => {
    const runOnLoad = () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (token) console.log('AuthContext: Found token in localStorage:', token);

      if (userId && token) {
        console.log('AuthContext: Found userId and token in localStorage.');
        setAuthUserId(userId);
        console.log('AuthContext: Setting authUserId to:', userId);
        setJwtToken(token);
        console.log('AuthContext: Setting jwtToken to:', token);
        setIsLoggedIn(true);
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    runOnLoad();
  }, [authUserId, jwtToken, isLoggedIn]);

  // User Management

  const registerUser = async (userData) => {
    try {
      const data = await registerUserService(userData);
      console.log('AuthContext: registerUser response data:', data.status );
      if (data?.status === 409) {
        alert("Email already in use. Please use a different email.");
        navigate('/login');
        return data;
    }
    
      if (data && data.hasError) navigate('/error', { state: { message: data } });
      if (data && !data.hasError) alert('Registration successful! 2FA ...');
        //navigate('/login');
    } catch (error) {
      navigate('/error', {
        state: 'A serious error occurred while registering.\nPlease try again.',
      });
    }
  };

  const loginUser = async (userData) => {
    try {
      console.log('AuthContext: Attempting to log in user:', userData.email);
      const data = await loginUserService(userData); // null check for data?
      if (data && data.hasError) navigate('/error', { state: data });
      if (data && !data.hasError) {
        const { token, user } = data; // Should we perform null checks for token and user?
        localStorage.setItem('userId', user._id);
        localStorage.setItem('token', token);
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
    localStorage.removeItem('token');
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
    if (isLoading || !isLoggedIn) return;

    if (!jwtToken) {
      const jwtTkn = localStorage.getItem('token');
      setJwtToken(jwtTkn);
    }

    console.log('AuthContext: Fetching quizzes with token:', jwtToken);
    const data = await fetchQuizzesService(jwtToken);
    if (data && data.hasError) {
      navigate('/error', { state: data });
      return [];
    }
    return Array.isArray(data) ? data : data.quizzes || [];
  };

  const newQuiz = async (quiz) => {
    const data = await createQuizService(quiz);
    if (data && data.hasError) {
      navigate('/error', { state: data });
      return null;
    }
    navigate('/quizlist');
    return data;
  };

  const removeQuiz = async (quizId) => {
    // Implement quiz deletion logic here, similar to other service calls
    console.log('AuthContext: Attempting to delete quiz with ID:', quizId);
    const data = await deleteQuizService(quizId, jwtToken);
    if (data && data.hasError) {
      navigate('/error', { state: data });
      return null;
    }
    return data;
  };

  //update quiz
  const updateQuiz = async (quizId, updatedQuiz) => {
    // Implement quiz update logic here, similar to other service calls
    console.log('AuthContext: Attempting to update quiz with ID:', quizId);
    const data = await updateQuizService(quizId, updatedQuiz, jwtToken);
    if (data && data.hasError) {
      navigate('/error', { state: data });
      return null;
    }
    return data;
    return null; // Placeholder return
  };

  // Question Management
  const fetchQuestions = async () => {
    const data = await fetchQuestionsService(jwtToken);
    if (data && data.hasError) {
      navigate('/error', { state: data });
      return [];
    }
    return Array.isArray(data) ? data : data.questions || [];
  };

  const createQuestion = async (question) => {
    const data = await createQuestionService(question, jwtToken);
    if (data && data.hasError) {
      navigate('/error', { state: data });
      return null;
    }
    return data;
  };

  const updateQuestion = async (questionId, updatedQuestion) => {
    // Implement question update logic here, similar to other service calls
    console.log('AuthContext: Attempting to update question with ID:', questionId);
    const data = await updateQuestionService(questionId, updatedQuestion, jwtToken);
    if (data && data.hasError) {
      navigate('/error', { state: data });
      return null;
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        authUserId,
        jwtToken,
        isLoggedIn,
        isAuthorized,
        isLoading,
        registerUser,
        loginUser,
        logoutUser,
        getCurrentUserData,
        fetchQuizzes,
        removeQuiz,
        fetchQuestions,
        createQuestion,
        updateQuestion,
        newQuiz,
        updateQuiz,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
