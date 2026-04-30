import express from "express";

import {
  getUserById,
  getAllUsers,
  createUser,
  updateUserById,
  deleteUserById,
  deleteAllUsers,
  loginUser,
  setup2FA,
  verify2FA,
  verifyOTP,
  getCurrentUser,
  logoutUser,
  sendEmailOTP,
  verifyEmailOTP,
  checkEmailExists,
  getUserByUsername,
  loginGuest,
} from "../controller/user.js";

import {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getAllQuizzesByAuthorId,
  getAllPublicQuizzes,
  createQuizWithQuestions,
  migrateQuizQuestionsToRefPath,
  shareQuiz,
} from "../controller/quiz.js";

import generateGuestToken from "../utils/guestJwt.js";

import {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getMatrixQuestionById,
  createMatrixQuestion,
} from "../controller/question.js";

import {
  createAnswer,
  getAllAnswers,
  getAnswerById,
  updateAnswer,
  deleteAnswer,
} from "../controller/answer.js";

import authMiddleware from "../middleware/auth.js";
import guestMiddleware from "../middleware/authGuest.js";
import authSelf from "../middleware/authSelf.js";

const router = express.Router();

/* ================= USER ROUTES ================= */

router.get("/api/me", authMiddleware, getCurrentUser);

router.get("/api/users", authMiddleware, getAllUsers);
router.get("/api/users/:id", authMiddleware, getUserById);
router.post("/api/users", createUser);
router.post("/api/auth/check-email", checkEmailExists);
router.post("/api/users/username", getUserByUsername);

router.put("/api/users/:id", authMiddleware, authSelf, updateUserById);
router.delete("/api/users/:id", authMiddleware, authSelf, deleteUserById);
router.delete("/api/users", authMiddleware, deleteAllUsers);

router.post("/api/login", loginUser);
router.post("/api/login-guest", loginGuest);
router.post("/api/logout", logoutUser);

/* ================= 2FA ROUTES ================= */

router.post("/api/setup-2fa", setup2FA);
router.post("/api/verify-2fa", verify2FA);
router.post("/api/verify-2fa-login", verifyOTP);

/* ================= EMAIL OTP ROUTES ================= */

router.post("/api/otp-email", sendEmailOTP);
router.post("/api/verify-otp-email", verifyEmailOTP);

/* ================= QUIZ ROUTES ================= */

router.get("/api/public/quizzes", getAllPublicQuizzes);

router.get("/api/quizzes/guest/:id", guestMiddleware, getQuizById);
router.get("/api/quizzes/:id", authMiddleware, getQuizById);

router.get("/api/quizzes", authMiddleware, getAllQuizzes);
router.get("/api/quizzes/author/:authorId", authMiddleware, getAllQuizzesByAuthorId);

router.post("/api/quizzes", authMiddleware, createQuiz);
router.post("/api/quizzes/bulk-create", authMiddleware, createQuizWithQuestions);

router.put("/api/quizzes/:id", authMiddleware, updateQuiz);
router.delete("/api/quizzes/:id", authMiddleware, deleteQuiz);

router.post("/api/quizzes/guesttoken", authMiddleware, (req, res) => {
  const { quizId } = req.body;

  if (!quizId) {
    return res.status(400).json({ message: "quizId is required" });
  }

  const token = generateGuestToken(req.user, quizId);

  return res.status(200).json({ token });
});


router.post(
  "/api/quizzes/:quizId/share",
  authMiddleware,
  shareQuiz
);

/* ================= QUESTION ROUTES ================= */

router.get("/api/questions", authMiddleware, getAllQuestions);
router.get("/api/questions/:id", authMiddleware, getQuestionById);
router.post("/api/questions", authMiddleware, createQuestion);
router.put("/api/questions/:id", authMiddleware, updateQuestion);
router.delete("/api/questions/:id", authMiddleware, deleteQuestion);

/* ================= ANSWER ROUTES ================= */

router.get("/api/answers", authMiddleware, getAllAnswers);
router.get("/api/answers/:id", authMiddleware, getAnswerById);
router.post("/api/answers", authMiddleware, createAnswer);
router.put("/api/answers/:id", authMiddleware, updateAnswer);
router.delete("/api/answers/:id", authMiddleware, deleteAnswer);

/* ================= MATRIX ROUTES ================= */

router.get("/api/matrix/:matrixId", authMiddleware, getMatrixQuestionById);
router.post("/api/matrix", authMiddleware, createMatrixQuestion);

/* ================= DEV/MIGRATION ROUTES ================= */

router.put("/migrate/question-refpath", authMiddleware, migrateQuizQuestionsToRefPath);

export default router;