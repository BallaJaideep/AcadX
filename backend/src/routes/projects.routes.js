// src/routes/projects.routes.js

import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

import {
  createProject,
  getMyProjects,
  getProjectById,
  deleteProject,
  downloadProjectReport,
  updateProject,
} from "../controllers/projects.controller.js";

const router = Router();

/* ======================================================
   ALL PROJECT ROUTES REQUIRE AUTH
====================================================== */
router.use(authenticate);

/* ======================================================
   CREATE PROJECT
   POST /api/projects
====================================================== */
router.post(
  "/",
  authorizeRoles("student"),
  createProject
);

/* ======================================================
   GET MY PROJECTS
   GET /api/projects/my
====================================================== */
router.get(
  "/my",
  authorizeRoles("student"),
  getMyProjects
);

/* ======================================================
   GET PROJECT DETAILS
   GET /api/projects/:id
====================================================== */
router.get(
  "/:id",
  authorizeRoles("student", "faculty", "hod", "admin"),
  getProjectById
);

/* ======================================================
   DELETE PROJECT
   DELETE /api/projects/:id
====================================================== */
router.delete(
  "/:id",
  authorizeRoles("student"),
  deleteProject
);

/* ======================================================
   UPDATE / REGENERATE PROJECT
   PUT /api/projects/:id
====================================================== */
router.put(
  "/:id",
  authorizeRoles("student"),
  updateProject
);

/* ======================================================
   DOWNLOAD PDF REPORT (BACKEND)
   GET /api/projects/:id/download
====================================================== */
router.get(
  "/:id/download",
  authorizeRoles("student", "faculty", "hod", "admin"),
  downloadProjectReport
);

export default router;
