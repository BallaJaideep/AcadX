import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { acceptAIHelp } from "../controllers/milestones.controller.js";




import {
  getMyMilestones,
  generateMilestonesByAI,
  completeMilestone,
  raiseMilestoneComplaint,
  resolveComplaint,
  reopenComplaint,
  deleteMilestonesByProject,
  completeAllProjectMilestones,
  completeAllMilestoneTasks,
} from "../controllers/milestones.controller.js";

const router = Router();

/* ======================================================
   ALL milestone routes require authentication
====================================================== */
router.use(authenticate);

/* ======================================================
   GET WEEKLY MILESTONES
   Student  → own project milestones
   Faculty → assigned project milestones
   GET /api/milestones/my
====================================================== */
router.get("/my", getMyMilestones);

/* ======================================================
   AI GENERATE WEEKLY MILESTONES + TASKS
   Faculty / HOD / Admin only
   POST /api/milestones/ai-generate
====================================================== */
router.post(
  "/ai-generate",
  authorizeRoles("faculty", "hod", "admin"),
  generateMilestonesByAI
);

/* ======================================================
   STUDENT COMPLETES A WEEK
   PATCH /api/milestones/:id/complete
====================================================== */
router.patch(
  "/:id/complete",
  authorizeRoles("student"),
  completeMilestone
);

/* ======================================================
   STUDENT COMPLETES ALL TASKS IN A WEEK
   PATCH /api/milestones/:id/tasks/complete
====================================================== */
router.patch(
  "/:id/tasks/complete",
  authorizeRoles("student"),
  completeAllMilestoneTasks
);

/* ======================================================
   STUDENT ASKS FOR HELP (AI suggestions + complaint)
   POST /api/milestones/:milestoneId/complaint
====================================================== */
router.post(
  "/:milestoneId/complaint",
  authorizeRoles("student"),
  raiseMilestoneComplaint
);

/* ======================================================
   FACULTY / HOD / ADMIN RESOLVES COMPLAINT
   PATCH /api/milestones/complaints/:id/resolve
====================================================== */
router.patch(
  "/complaints/:id/resolve",
  authorizeRoles("faculty", "hod", "admin"),
  resolveComplaint
);

/* ======================================================
   STUDENT REOPENS COMPLAINT
   PATCH /api/milestones/complaints/:id/reopen
====================================================== */
router.patch(
  "/complaints/:id/reopen",
  authorizeRoles("student"),
  reopenComplaint
);



router.patch(
  "/complaints/:id/accept-ai",
  authorizeRoles("student"),
  acceptAIHelp
);

/* ======================================================
   FACULTY DELETES ALL MILESTONES FOR A PROJECT
   DELETE /api/milestones/project/:projectId
====================================================== */
router.delete(
  "/project/:projectId",
  authorizeRoles("faculty", "hod", "admin"),
  deleteMilestonesByProject
);

/* ======================================================
   STUDENT COMPLETES ALL MILESTONES FOR A PROJECT
   PATCH /api/milestones/project/:projectId/complete
====================================================== */
router.patch(
  "/project/:projectId/complete",
  authorizeRoles("student"),
  completeAllProjectMilestones
);

export default router;
