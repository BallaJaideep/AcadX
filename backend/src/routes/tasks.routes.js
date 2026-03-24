// src/routes/tasks.routes.js
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  createTask,
  getTasksByProject,
  getTasksByMilestone,
  updateTask,
  deleteTask,
} from "../controllers/tasks.controller.js";

const router = Router();

/* ======================================================
   ALL TASK ROUTES REQUIRE LOGIN
====================================================== */
router.use(authenticate);

/* ======================================================
   CREATE TASK
   POST /api/tasks
====================================================== */
router.post("/", createTask);

/* ======================================================
   GET TASKS BY PROJECT
   GET /api/tasks/project/:projectId
====================================================== */
router.get("/project/:projectId", getTasksByProject);

/* ======================================================
   GET TASKS BY MILESTONE
   GET /api/tasks/milestone/:milestoneId
====================================================== */
router.get("/milestone/:milestoneId", getTasksByMilestone);

/* ======================================================
   UPDATE TASK STATUS
   PATCH /api/tasks/:id
====================================================== */
router.patch("/:id", updateTask);

/* ======================================================
   DELETE TASK
   DELETE /api/tasks/:id
====================================================== */
router.delete("/:id", deleteTask);

export default router;
