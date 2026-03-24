// src/routes/mentorRequests.routes.js
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  createMentorRequest,
  getMyMentorRequests,
  getIncomingRequestsForFaculty,
  decideMentorRequest,
} from "../controllers/mentorRequests.controller.js";

const router = Router();

// All routes require login
router.use(authenticate);

/* -----------------------------------------
   STUDENT ROUTES
------------------------------------------*/

// Create mentor request
router.post(
  "/",
  authorizeRoles("student"),
  createMentorRequest
);

// View own mentor requests
router.get(
  "/my",
  authorizeRoles("student"),
  getMyMentorRequests
);

/* -----------------------------------------
   FACULTY / HOD / ADMIN ROUTES
------------------------------------------*/

// View incoming mentor requests (faculty dashboard)
router.get(
  "/incoming",
  authorizeRoles("faculty", "hod", "admin"),
  getIncomingRequestsForFaculty
);

// Approve / Reject a request
router.post(
  "/:id/decision",
  authorizeRoles("faculty", "hod", "admin"),
  decideMentorRequest
);

export default router;
