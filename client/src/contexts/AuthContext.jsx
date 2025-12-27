/*
  AuthContext
  - Cookie-based JWT auth (httpOnly)
  - No localStorage
  - No token state
  - Auth state resolved via /api/me
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
} from '../services/quiz';

import { loginUser as loginUserService,
  logoutUser as logoutService,
 } from '../services/auth';

import {
  getAllQuestions as fetchQuestionsService,
  createQuestion as createQuestionService,
  updateQuestion as updateQuestionService,
} from '../services/question';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [authUserId, setAuthUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /* =========================
     AUTH CHECK ON APP LOAD
     ========================= */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/me', {
          credentials: 'include',
        });

        if (!res.ok) {
          setIsLoggedIn(false);
          return;
        }

        const data = await res.json();
        setAuthUserId(data.user._id);
        setIsLoggedIn(true);
      } catch (err) {
        console.error('AuthContext: auth check failed', err);
        setIsLoggedIn(false);
      } finally {
        setIsAuthorized(true);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  /* =========================
     USER AUTH ACTIONS
     ========================= */

  const registerUser = async (userData) => {
    try {
      const data = await registerUserService(userData);

      if (data?.status === 409) {
        alert('Email already in use.');
        navigate('/login');
        return data;
      }

      if (data?.hasError) {
        navigate('/error', { state: data });
        return;
      }

      alert('Registration successful!');
      return data;
    } catch (err) {
      navigate('/error', {
        state: 'Registration failed.',
      });
    }
  };



  const loginUser = async (userData) => {
    try {
      const data = await loginUserService(userData);

      if (data?.hasError) {
        navigate('/error', { state: data });
        return;
      }

      // Cookie is set by backend
      setAuthUserId(data.user._id);
      return data.user;
    } catch (err) {
      console.error('AuthContext: login failed', err);
    }
  };

  const verifyOTP = async (email, otpCode) => {
    try {
      const res = await fetch("/api/verify-2fa-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: otpCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Invalid OTP");
        return;
      }

      alert("Login successful.");
      setIsLoggedIn(true);
      navigate("/");

    } catch (err) {
      alert("Failed to verify OTP");
    }
  };


  const logoutUser = async () => {
    try {
      const res = logoutService();
    } catch (err) {
      console.error('Logout failed', err);
    }

    setAuthUserId(null);
    setIsLoggedIn(false);
    navigate('/');
  };

  const getCurrentUserData = async () => {
    try {
      const data = await getUserDataByIdService(authUserId);
      if (data?.hasError) {
        navigate('/error', { state: data });
        return;
      }
      return data.user;
    } catch {
      navigate('/error', { state: 'Failed to load user.' });
    }
  };

  /* =========================
     QUIZ ACTIONS
     ========================= */

  const fetchQuizzes = async () => {
    if (!isLoggedIn) return [];

    const data = await fetchQuizzesService();
    if (data?.hasError) {
      navigate('/error', { state: data });
      return [];
    }
    return Array.isArray(data) ? data : data.quizzes || [];
  };

  const newQuiz = async (quiz) => {
    const data = await createQuizService(quiz);
    if (data?.hasError) {
      navigate('/error', { state: data });
      return;
    }
    navigate('/quizlist');
    return data;
  };

  const removeQuiz = async (quizId) => {
    const data = await deleteQuizService(quizId);
    if (data?.hasError) {
      navigate('/error', { state: data });
      return;
    }
    return data;
  };

  const updateQuiz = async (quizId, updatedQuiz) => {
    const data = await updateQuizService(quizId, updatedQuiz);
    if (data?.hasError) {
      navigate('/error', { state: data });
      return;
    }
    return data;
  };

  /* =========================
     QUESTION ACTIONS
     ========================= */

  const fetchQuestions = async () => {
    const data = await fetchQuestionsService();
    if (data?.hasError) {
      navigate('/error', { state: data });
      return [];
    }
    return Array.isArray(data) ? data : data.questions || [];
  };

  const createQuestion = async (question) => {
    const data = await createQuestionService(question);
    if (data?.hasError) {
      navigate('/error', { state: data });
      return;
    }
    return data;
  };

  const updateQuestion = async (questionId, updatedQuestion) => {
    const data = await updateQuestionService(questionId, updatedQuestion);
    if (data?.hasError) {
      navigate('/error', { state: data });
      return;
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        authUserId,
        isLoggedIn,
        isAuthorized,
        isLoading,
        registerUser,
        loginUser,
        logoutUser,
        getCurrentUserData,
        fetchQuizzes,
        newQuiz,
        removeQuiz,
        updateQuiz,
        fetchQuestions,
        createQuestion,
        updateQuestion,
        verifyOTP
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
