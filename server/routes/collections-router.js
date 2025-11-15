import express from 'express';

// User controller
import {
  getUserById,
  getAllUsers,
  createUser,
  updateUserById,
  deleteUserById,
  deleteAllUsers,
  loginUser,
} from '../controller/user.js';

// Quiz controller
import {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
} from '../controller/quiz.js';

// Question controller
import {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from '../controller/question.js';

// Answer controller
import {
  createAnswer,
  getAllAnswers,
  getAnswerById,
  updateAnswer,
  deleteAnswer,
} from '../controller/answer.js';

// Middleware
import authMiddleware from '../middleware/auth.js';
import authSelf from '../middleware/authSelf.js';

const router = express.Router();

// -------------------- User Routes --------------------
router.get('/api/users/:id', authMiddleware, getUserById);
router.get('/api/users', getAllUsers);
router.post('/api/users', createUser);
router.put('/api/users/:id', authMiddleware, authSelf, updateUserById);
router.delete('/api/users/:id', authMiddleware, authSelf, deleteUserById);
router.delete('/api/users', authMiddleware, deleteAllUsers);
router.post('/api/login', loginUser);

// -------------------- Quiz Routes --------------------
router.get('/api/quizzes/:id', authMiddleware, getQuizById);
router.get('/api/quizzes', authMiddleware, getAllQuizzes);
router.post('/api/quizzes', authMiddleware,createQuiz); // feature for later - add question id's as params to link
router.put('/api/quizzes/:id', authMiddleware,updateQuiz);
router.delete('/api/quizzes/:id', authMiddleware, deleteQuiz);

// -------------------- Question Routes --------------------
router.get('/api/questions/:id', getQuestionById);
router.get('/api/questions', getAllQuestions);
router.post('/api/questions', createQuestion);
router.put('/api/questions/:id', updateQuestion);
router.delete('/api/questions/:id', deleteQuestion);

// -------------------- Answer Routes --------------------
router.get('/api/answers/:id', getAnswerById);
router.get('/api/answers', getAllAnswers);
router.post('/api/answers', createAnswer);
router.put('/api/answers/:id', updateAnswer);
router.delete('/api/answers/:id', deleteAnswer);

export default router;
