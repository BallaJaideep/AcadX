import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  createHodComplaint,
  getHodComplaints,
  resolveHodComplaint,
} from "../controllers/hodComplaint.controller.js";

const router = Router();

router.use(authenticate);

// Student raises complaint
router.post(
  "/",
  authorizeRoles("student"),
  createHodComplaint
);

// HOD views complaints
router.get(
  "/",
  authorizeRoles("hod", "admin"),
  getHodComplaints
);

// HOD resolves complaint
router.patch(
  "/:id/resolve",
  authorizeRoles("hod", "admin"),
  resolveHodComplaint
);

export default router;
