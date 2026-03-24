import express from "express";
import { getAIProjectSuggestions } from "../controllers/aiProject.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Apply auth middleware to all AI routes
router.use(authenticate);

// POST /api/ai/project/recommend
router.post("/recommend", getAIProjectSuggestions);

export default router;
