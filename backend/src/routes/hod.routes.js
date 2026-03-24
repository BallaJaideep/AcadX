import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { 
  getHodDashboard, 
  getFacultyDetails, 
  getStudentDetails,
  getFacultyDirectory,
  getStudentDirectory,
  deleteFaculty,
  deleteStudent
} from "../controllers/hod.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("hod", "admin"));

// HOD Executive Dashboard
router.get("/dashboard", getHodDashboard);

// Faculty Directory (all faculty in dept)
router.get("/faculty-directory", getFacultyDirectory);

// Student Directory (all students in dept)
router.get("/student-directory", getStudentDirectory);

// Faculty Audit View (single faculty deep-dive)
router.get("/faculty/:facultyId", getFacultyDetails);
router.delete("/faculty/:id", deleteFaculty);

// Student Admin View (single student deep-dive)
router.get("/student/:studentId", getStudentDetails);
router.delete("/student/:id", deleteStudent);

export default router;
