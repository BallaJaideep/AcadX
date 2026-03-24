import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  submitFinalProject,
  reviewFinalSubmission,
  getFinalSubmissionByProject,
} from "../controllers/finalSubmission.controller.js";
import { uploadFinalFiles } from "../config/finalSubmissionUpload.js";

const router = Router();

/* ======================================================
   STUDENT — SUBMIT FINAL PROJECT FILES
   POST /api/final-submission/submit/:projectId
====================================================== */
const uploadMiddleware = uploadFinalFiles.fields([
  { name: "ppt", maxCount: 1 },
  { name: "document", maxCount: 1 },
]);

router.post(
  "/submit/:projectId",
  authenticate,
  authorizeRoles("student"),
  (req, res, next) => {
    uploadMiddleware(req, res, function (err) {
      if (err) {
        console.error("Multer upload error:", err);
        return res.status(400).json({ message: err.message || "File upload failed" });
      }
      next();
    });
  },
  submitFinalProject
);

/* ======================================================
   FACULTY / HOD — REVIEW FINAL SUBMISSION
   PATCH /api/final-submission/review/:submissionId
====================================================== */
router.patch(
  "/review/:submissionId",
  authenticate,
  authorizeRoles("faculty", "hod", "admin"),
  reviewFinalSubmission
);

/* ======================================================
   GET FINAL SUBMISSION BY PROJECT
   GET /api/final-submission/project/:projectId
====================================================== */
router.get(
  "/project/:projectId",
  authenticate,
  getFinalSubmissionByProject
);

export default router;
