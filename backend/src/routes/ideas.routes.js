// src/routes/ideas.routes.js
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  createIdea,
  getIdeas,
  getIdeaById,
  updateIdea,
  deleteIdea,
} from "../controllers/ideas.controller.js";

const router = Router();

// every route requires login
router.use(authenticate);

// LIST ideas - all roles
// GET /api/ideas
router.get("/", getIdeas);

// GET single idea
// GET /api/ideas/:id
router.get("/:id", getIdeaById);

// FACULTY / HOD / ADMIN only routes
const canManageIdeas = authorizeRoles("faculty", "hod", "admin");

// CREATE idea
// POST /api/ideas
router.post("/", canManageIdeas, createIdea);

// UPDATE idea
// PUT /api/ideas/:id
router.put("/:id", canManageIdeas, updateIdea);

// DELETE (soft) idea
// DELETE /api/ideas/:id
router.delete("/:id", canManageIdeas, deleteIdea);

export default router;
