import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  applyWeeklyReward,
  getLeaderboard,
} from "../controllers/gamification.controller.js";

const router = Router();

/* =========================================
   APPLY WEEKLY REWARD
   POST /api/gamification/week-complete
========================================= */
router.post("/week-complete", authenticate, applyWeeklyReward);

/* =========================================
   LEADERBOARD
   GET /api/gamification/leaderboard
========================================= */
router.get("/leaderboard", authenticate, getLeaderboard);

export default router;
