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
  getQuizzesByAuthorID as fetchUserQuizzesService,
  getPublicQuizzes as fetchPublicQuizzesService,
  createBulkQuiz as createBulkQuizService,
  fetchQuizById as fetchQuizByIdService,
  fetchQuizByIdGuest as fetchGuestQuizByIdService,
} from '../services/quiz';

import {
  loginUser as loginUserService,
  logoutUser as logoutService,
} from '../services/auth';

import {
  getAllQuestions as fetchQuestionsService,
  createQuestion as createQuestionService,
  updateQuestion as updateQuestionService,
  getQuestionById as fetchQuestionByIdService,
} from '../services/question';
import { set } from 'mongoose';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [authUserId, setAuthUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // 🔥 FIX: split loading states
  const [authLoading, setAuthLoading] = useState(true);
  const [quizLoading, setQuizLoading] = useState(false);

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
        setAuthLoading(false); // ✅ FIXED
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

      if (data.hasError) {
        console.log(data.message || 'Login failed.');
        return data;
      }

      setAuthUserId(data.user._id);

      if (!data.user.is2FAEnabled) {
        setIsLoggedIn(true);
        navigate('/');
      }

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
      logoutService();
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

  const fetchQuizzesByUser = async () => {
    if (!isLoggedIn) return [];

    const data = await fetchUserQuizzesService(authUserId);

    if (data?.hasError) {
      navigate('/error', { state: data });
      return [];
    }

    return Array.isArray(data) ? data : data.quizzes || [];
  };

  const fetchPublicQuizzes = async () => {
    const data = await fetchPublicQuizzesService();

    if (data?.hasError) {
      navigate('/error', { state: data });
      return [];
    }

    return Array.isArray(data) ? data : data.quizzes || [];
  };

  const fetchQuiz = async (quizId) => {
    const data = await fetchQuizByIdService(quizId);

    if (data?.hasError) {
      navigate('/error', { state: data });
      return null;
    }

    return data.quiz || null;
  };

  const fetchGuestQuiz = async (quizId, guestToken) => {
    
    const res = await fetchGuestQuizByIdService(quizId, guestToken);

  
    console.log("fetchGuestQuiz response:", res);
    if (res?.hasError) {
      console.log("Error fetching guest quiz:", res.message);
      navigate('/error', { state: res });
      return null;
    }


  
    setIsGuest(true);
    return res
  };

  const newQuiz = async (quiz) => {
    const payload = {
      ...quiz,
      author: authUserId,
    };

    return await createQuizService(payload);
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

  const createBulkQuiz = async (quizData) => {
    quizData.author = authUserId;

    const res = await createBulkQuizService(quizData);

    if (res?.hasError) {
      return { error: false, message: 'Quiz created successfully.', data: await res.json() };
    }

    return { error: true, message: res.message || 'A problem occurred while adding quiz.' };
  };

  const shareQuiz = async (quizId, email) => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to share quiz');
      }

      return data;
    } catch (error) {
      console.error('Error sharing quiz:', error);
      throw error;
    }
  };

  const generateGuestToken = async (quizId) => {
    try {
      const res = await fetch('/api/quizzes/guesttoken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quizId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to generate guest token');
      }

      return data.token;
    } catch (error) {
      console.error('Error generating guest token:', error);
      throw error;
    }
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

  const fetchQuestionById = async (questionId) => {
    const data = await fetchQuestionByIdService(questionId);

    if (data?.hasError) {
      navigate('/error', { state: data });
      return null;
    }

    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        authUserId,
        isLoggedIn,
        isAuthorized,

        // 🔥 split loading states
        authLoading,
        quizLoading,

        registerUser,
        loginUser,
        logoutUser,
        getCurrentUserData,

        fetchQuizzes,
        newQuiz,
        fetchQuiz,
        fetchGuestQuiz,
        createBulkQuiz,
        removeQuiz,
        updateQuiz,

        fetchQuestions,
        createQuestion,
        updateQuestion,
        fetchQuestionById,

        verifyOTP,
        fetchQuizzesByUser,
        fetchPublicQuizzes,
        shareQuiz,
        generateGuestToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}