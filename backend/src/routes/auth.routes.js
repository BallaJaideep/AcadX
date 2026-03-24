// src/routes/auth.routes.js
import { Router } from "express";
import {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// GET /api/auth/me
router.get("/me", authenticate, getMe);

// 🔹 POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);

// 🔹 POST /api/auth/reset-password
router.post("/reset-password", resetPassword);

export default router;
