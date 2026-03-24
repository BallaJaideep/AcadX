import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getMyPortfolio,
  generatePortfolio,
  getStudentPortfolio,
} from "../controllers/portfolio.controller.js";

const router = Router();

router.use(authenticate);

router.get("/me", getMyPortfolio);
router.post("/generate", generatePortfolio);
router.get("/:studentId", getStudentPortfolio);

export default router;
