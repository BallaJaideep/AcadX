// src/routes/faculty.routes.js

import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

/* =========================
   CONTROLLERS
========================= */

// Assigned projects
import {
  getAssignedProjectsForFaculty,
} from "../controllers/projects.controller.js";

// Faculty dashboard controllers
import {
  getFacultyProjectProgress,
  getFacultyComplaints,
} from "../controllers/faculty.controller.js";

import { resolveComplaint } from "../controllers/milestones.controller.js";

const router = Router();

/* ======================================================
   🔐 AUTHENTICATION (ALL FACULTY ROUTES)
====================================================== */
router.use(authenticate);

/* ======================================================
   ASSIGNED PROJECTS
   GET /api/faculty/assigned-projects
====================================================== */
router.get(
  "/assigned-projects",
  authorizeRoles("faculty", "hod", "admin"),
  getAssignedProjectsForFaculty
);

/* ======================================================
   FACULTY PROJECT PROGRESS
   GET /api/faculty/project-progress
====================================================== */
router.get(
  "/project-progress",
  authorizeRoles("faculty", "hod", "admin"),
  getFacultyProjectProgress
);

/* ======================================================
   STUDENT COMPLAINTS (NEEDS FACULTY ACTION)
   GET /api/faculty/complaints
====================================================== */
router.get(
  "/complaints",
  authorizeRoles("faculty", "hod", "admin"),
  getFacultyComplaints
);

/* ======================================================
   RESOLVE COMPLAINT
   PATCH /api/faculty/complaints/:id/resolve
 ====================================================== */
router.patch(
  "/complaints/:id/resolve",
  authorizeRoles("faculty", "hod", "admin"),
  resolveComplaint
);

export default router;
