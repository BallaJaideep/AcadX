import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

import { uploadPhoto } from "../config/profilePhoto.multer.js";
import { resumeUpload } from "../config/resumeUpload.js";

import {
  getFacultyList,
  uploadResume,
  downloadResume,
  uploadProfilePhotoController,
  getMyResume,
  getStudentResume, // New
} from "../controllers/users.controller.js";

const router = Router();

/* ======================================================
   GET FACULTY LIST
   GET /api/users/faculty
====================================================== */
router.get(
  "/faculty",
  authenticate,
  getFacultyList
);

/* ======================================================
   GET MY RESUME PATH (🔥 REQUIRED FOR VIEW/DOWNLOAD)
   GET /api/users/me/resume
====================================================== */
router.get(
  "/me/resume",
  authenticate,
  getMyResume
);

router.get(
  "/:studentId/resume",
  authenticate,
  getStudentResume
);

/* ======================================================
   UPLOAD RESUME (STUDENT ONLY)
   POST /api/users/me/resume
====================================================== */
router.post(
  "/me/resume",
  authenticate,
  authorizeRoles("student"),
  resumeUpload.single("resume"),
  uploadResume
);

/* ======================================================
   UPLOAD PROFILE PHOTO (ALL LOGGED-IN USERS)
   POST /api/users/me/photo
====================================================== */
router.post(
  "/me/photo",
  authenticate,
  uploadPhoto.single("photo"),
  uploadProfilePhotoController
);
/* ======================================================
   DOWNLOAD RESUME
   GET /api/users/resume/download/:filename
====================================================== */
router.get(
  "/resume/download/:filename",
  authenticate,
  downloadResume
);

export default router;
