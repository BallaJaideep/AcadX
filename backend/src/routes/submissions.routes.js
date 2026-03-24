import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

import {
  submitWork,
  reviewSubmission,
  getMySubmissions,
  getSubmissionsByProject,
} from "../controllers/submission.controller.js";

const router = Router();

// 🔐 All routes protected
router.use(authenticate);

/* ======================================================
   STUDENT submits work
   POST /api/submissions
====================================================== */
router.post(
  "/",
  authorizeRoles("student"),
  submitWork
);

/* ======================================================
   STUDENT gets own submissions
   GET /api/submissions/my
====================================================== */
router.get(
  "/my",
  authorizeRoles("student"),
  getMySubmissions
);

/* ======================================================
   FACULTY gets submissions by project
   GET /api/submissions/project/:projectId
====================================================== */
router.get(
  "/project/:projectId",
  authorizeRoles("faculty", "hod", "admin"),
  getSubmissionsByProject
);

/* ======================================================
   FACULTY reviews submission
   PATCH /api/submissions/:id/review
====================================================== */
router.patch(
  "/:id/review",
  authorizeRoles("faculty", "hod", "admin"),
  reviewSubmission
);

export default router;
