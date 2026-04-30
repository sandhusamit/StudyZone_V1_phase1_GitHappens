/*
  AuthContext
  - Cookie-based JWT auth
  - No localStorage
  - No token state
  - Auth state resolved via /api/me
*/

import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  registerUser as registerUserService,
  getUserDataById as getUserDataByIdService,
} from "../services/user";

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
} from "../services/quiz";

import {
  loginUser as loginUserService,
  logoutUser as logoutService,
  loginGuest as loginGuestService,
} from "../services/auth";

import {
  getAllQuestions as fetchQuestionsService,
  createQuestion as createQuestionService,
  updateQuestion as updateQuestionService,
  getQuestionById as fetchQuestionByIdService,
  createMatrixQuestion as createMatrixQuestionService,
} from "../services/question";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [authUserId, setAuthUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuestLoggedIn, setIsGuestLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [authLoading, setAuthLoading] = useState(true);
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/me", {
          credentials: "include",
        });

        if (!res.ok) {
          setAuthUserId(null);
          setIsLoggedIn(false);
          setIsGuest(false);
          setIsGuestLoggedIn(false);
          return;
        }

        const data = await res.json();
        const user = data.user;

        setAuthUserId(user?._id || user?.guestId || null);

        if (user?.role === "guest") {
          setIsGuest(true);
          setIsGuestLoggedIn(true);
          setIsLoggedIn(false);
        } else {
          setIsGuest(false);
          setIsGuestLoggedIn(false);
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error("AuthContext: auth check failed", err);
        setAuthUserId(null);
        setIsLoggedIn(false);
        setIsGuest(false);
        setIsGuestLoggedIn(false);
      } finally {
        setIsAuthorized(true);
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  const registerUser = useCallback(
    async (userData) => {
      try {
        const data = await registerUserService(userData);

        if (data?.status === 409) {
          alert("Email already in use.");
          navigate("/login");
          return data;
        }

        if (data?.hasError) {
          navigate("/error", { state: data });
          return data;
        }

        alert("Registration successful!");
        return data;
      } catch (err) {
        navigate("/error", { state: "Registration failed." });
        return { hasError: true, message: "Registration failed." };
      }
    },
    [navigate]
  );

  const loginUser = useCallback(
    async (userData) => {
      try {
        const data = await loginUserService(userData);

        if (data?.hasError) {
          return data;
        }

        const user = data.user;

        setAuthUserId(user?._id || null);
        setIsGuest(false);
        setIsGuestLoggedIn(false);

        if (!user?.is2FAEnabled) {
          setIsLoggedIn(true);
        }

        return user;
      } catch (err) {
        console.error("AuthContext: login failed", err);
        return { hasError: true, message: "Login failed." };
      }
    },
    []
  );

  const loginGuest = useCallback(async ({ name }) => {
    try {
      const data = await loginGuestService({ name });

      if (data?.hasError) {
        return data;
      }

      const guest = data.user;

      setAuthUserId(guest?._id || guest?.guestId || null);
      setIsLoggedIn(false);
      setIsGuestLoggedIn(true);
      setIsGuest(true);

      return guest;
    } catch (err) {
      console.error("AuthContext: guest login failed", err);
      return { hasError: true, message: "Guest login failed." };
    }
  }, []);

  const verifyOTP = useCallback(async (email, otpCode) => {
    try {
      const res = await fetch("/api/verify-2fa-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, token: otpCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          hasError: true,
          message: data.message || "Invalid OTP",
        };
      }

      setAuthUserId(data.user?._id || null);
      setIsLoggedIn(true);
      setIsGuest(false);
      setIsGuestLoggedIn(false);

      return data.user;
    } catch (err) {
      console.error("AuthContext: OTP failed", err);
      return { hasError: true, message: "Failed to verify OTP." };
    }
  }, []);

  const logoutUser = useCallback(
    async () => {
      try {
        await logoutService();
      } catch (err) {
        console.error("Logout failed", err);
      }

      setAuthUserId(null);
      setIsGuest(false);
      setIsGuestLoggedIn(false);
      setIsLoggedIn(false);
      navigate("/");
    },
    [navigate]
  );

  const getCurrentUserData = useCallback(async () => {
    try {
      if (!authUserId || isGuest) return null;

      const data = await getUserDataByIdService(authUserId);

      if (data?.hasError) {
        navigate("/error", { state: data });
        return null;
      }

      return data.user;
    } catch {
      navigate("/error", { state: "Failed to load user." });
      return null;
    }
  }, [authUserId, isGuest, navigate]);

  const fetchQuizzes = useCallback(
    async () => {
      if (!isLoggedIn) return [];

      const data = await fetchQuizzesService();

      if (data?.hasError) {
        navigate("/error", { state: data });
        return [];
      }

      return Array.isArray(data) ? data : data.quizzes || [];
    },
    [isLoggedIn, navigate]
  );

  const fetchQuizzesByUser = useCallback(
    async () => {
      if (!isLoggedIn || !authUserId) return [];

      const data = await fetchUserQuizzesService(authUserId);

      if (data?.hasError) {
        navigate("/error", { state: data });
        return [];
      }

      return Array.isArray(data) ? data : data.quizzes || [];
    },
    [isLoggedIn, authUserId, navigate]
  );

  const fetchPublicQuizzes = useCallback(
    async () => {
      const data = await fetchPublicQuizzesService();

      if (data?.hasError) {
        navigate("/error", { state: data });
        return [];
      }

      return Array.isArray(data) ? data : data.quizzes || [];
    },
    [navigate]
  );

  const fetchQuiz = useCallback(
    async (quizId) => {
      const data = await fetchQuizByIdService(quizId);

      if (data?.hasError) {
        navigate("/error", { state: data });
        return null;
      }

      return data?.quiz ?? data ?? null;
    },
    [navigate]
  );

  const fetchGuestQuiz = useCallback(
    async (quizId, guestToken) => {
      const data = await fetchGuestQuizByIdService(quizId, guestToken);

      if (data?.hasError) {
        console.log("Error fetching guest quiz:", data.message);
        navigate("/error", { state: data });
        return null;
      }

      setIsGuest(true);
      setIsGuestLoggedIn(true);

      return data?.quiz ?? data ?? null;
    },
    [navigate]
  );

  const newQuiz = useCallback(
    async (quiz) => {
      const payload = {
        ...quiz,
        author: authUserId,
      };

      return await createQuizService(payload);
    },
    [authUserId]
  );

  const removeQuiz = useCallback(
    async (quizId) => {
      const data = await deleteQuizService(quizId);

      if (data?.hasError) {
        navigate("/error", { state: data });
        return null;
      }

      return data;
    },
    [navigate]
  );

  const updateQuiz = useCallback(
    async (quizId, updatedQuiz) => {
      const data = await updateQuizService(quizId, updatedQuiz);

      if (data?.hasError) {
        navigate("/error", { state: data });
        return null;
      }

      return data;
    },
    [navigate]
  );

  const createBulkQuiz = useCallback(
    async (quizData) => {
      const payload = {
        ...quizData,
        author: authUserId,
      };

      const data = await createBulkQuizService(payload);

      if (data?.hasError) {
        return {
          error: true,
          message: data.message || "A problem occurred while adding quiz.",
        };
      }

      return {
        error: false,
        message: "Quiz created successfully.",
        data,
      };
    },
    [authUserId]
  );

  const shareQuiz = useCallback(async (quizId, email) => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to share quiz");
      }

      return data;
    } catch (error) {
      console.error("Error sharing quiz:", error);
      throw error;
    }
  }, []);

  const generateGuestToken = useCallback(async (quizId) => {
    try {
      const res = await fetch("/api/quizzes/guesttoken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quizId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to generate guest token");
      }

      return data.token;
    } catch (error) {
      console.error("Error generating guest token:", error);
      throw error;
    }
  }, []);

  const fetchQuestions = useCallback(
    async () => {
      const data = await fetchQuestionsService();

      if (data?.hasError) {
        navigate("/error", { state: data });
        return [];
      }

      return Array.isArray(data) ? data : data.questions || [];
    },
    [navigate]
  );

  const createQuestion = useCallback(
    async (question) => {
      const data = await createQuestionService(question);

      if (data?.hasError) {
        navigate("/error", { state: data });
        return null;
      }

      return data;
    },
    [navigate]
  );

  const createMatrixQuestion = useCallback(
    async (question) => {
      const data = await createMatrixQuestionService(question);

      if (data?.hasError) {
        navigate("/error", { state: data });
        return null;
      }

      return data;
    },
    [navigate]
  );

  const updateQuestion = useCallback(
    async (questionId, updatedQuestion) => {
      const data = await updateQuestionService(questionId, updatedQuestion);

      if (data?.hasError) {
        navigate("/error", { state: data });
        return null;
      }

      return data;
    },
    [navigate]
  );

  const fetchQuestionById = useCallback(
    async (questionId) => {
      const data = await fetchQuestionByIdService(questionId);

      if (data?.hasError) {
        navigate("/error", { state: data });
        return null;
      }

      return data;
    },
    [navigate]
  );

  return (
    <AuthContext.Provider
      value={{
        authUserId,
        isLoggedIn,
        isGuestLoggedIn,
        isGuest,
        isAuthorized,

        authLoading,
        quizLoading,
        setQuizLoading,

        registerUser,
        loginUser,
        logoutUser,
        getCurrentUserData,
        loginGuest,

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
        createMatrixQuestion,

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