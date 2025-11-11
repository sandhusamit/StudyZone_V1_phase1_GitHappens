import express from "express";
import {
  getUserById,
  getAllUsers,
  createUser,
  updateUserById,
  deleteUserById,
  deleteAllUsers,
  loginUser,
} from "../controller/user.js";  
import authMiddleware from "../middleware/auth.js";
import { get } from "mongoose";


const router = express.Router();

// Routes for Users collection
router.get("/api/users/:id", authMiddleware, getUserById); // Example route to get user by ID
router.get("/api/users", getAllUsers); // Example route for users
router.post("/api/users", createUser); // Example route to create a user
router.put("/api/users/:id", authMiddleware, updateUserById); // Example route to update user by ID
router.delete("/api/users/:id", authMiddleware, deleteUserById); // Example route to delete user by ID
router.delete("/api/users", authMiddleware, deleteAllUsers); // Example route to delete all users
router.post("/api/login", loginUser); // Example route for user login

export default router;