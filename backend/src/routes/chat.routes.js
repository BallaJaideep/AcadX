import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { sendMessage } from "../controllers/chat.controller.js";

const router = Router();

/* ======================================================
   AI CHATBOT ROUTES
====================================================== */

/**
 * Send message to Gemini AI chatbot
 * POST /api/chat/send
 * Access: Authenticated users (student / faculty / hod / admin)
 */
router.post(
  "/send",
  authenticate,
  sendMessage
);

export default router;
