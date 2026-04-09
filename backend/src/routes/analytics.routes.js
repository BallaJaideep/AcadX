import express from "express";
import { 
  updateGithubUrl, 
  getProjectHealthStats,
  getAtRiskProjects
} from "../controllers/analytics.controller.js";

// Import your authMiddleware if it exists, otherwise we keep routes open for now based on current app style.
// import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Update GitHub URL
router.put("/project/:projectId/github", updateGithubUrl);

// Get Health Stats for a specific project
router.get("/project/:projectId", getProjectHealthStats);

// Get At-Risk projects for HOD/Faculty Dashboard
router.get("/at-risk", getAtRiskProjects);

export default router;
