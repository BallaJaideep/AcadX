import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

/* ======================
   ROUTE IMPORTS
====================== */
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/projects.routes.js";
import mentorRequestRoutes from "./routes/mentorRequests.routes.js";
import userRoutes from "./routes/users.routes.js";
import ideaRoutes from "./routes/ideas.routes.js";
import milestoneRoutes from "./routes/milestones.routes.js";
import taskRoutes from "./routes/tasks.routes.js";
import submissionsRoutes from "./routes/submissions.routes.js";
import gamificationRoutes from "./routes/gamification.routes.js";
import facultyRoutes from "./routes/faculty.routes.js";
import hodRoutes from "./routes/hod.routes.js";
import hodComplaintsRoutes from "./routes/hodComplaints.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import finalSubmissionRoutes from "./routes/finalSubmission.routes.js";
import aiProjectRoutes from "./routes/aiProject.routes.js";

dotenv.config();

const app = express();

/* ======================================================
   GLOBAL MIDDLEWARES
====================================================== */

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

// Request logger (DEV)
app.use((req, res, next) => {
  console.log(`➡ ${req.method} ${req.originalUrl}`);
  next();
});

/* ======================================================
   HEALTH CHECK
====================================================== */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "ELOR backend is running ✅",
  });
});

/* ======================================================
   API ROUTES
====================================================== */

// Auth
app.use("/api/auth", authRoutes);

// Core modules
app.use("/api/projects", projectRoutes);
app.use("/api/mentor-requests", mentorRequestRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ideas", ideaRoutes);

// Milestones + AI + complaints
app.use("/api/milestones", milestoneRoutes);

// Tasks
app.use("/api/tasks", taskRoutes);

// Submissions
app.use("/api/submissions", submissionsRoutes);

// Gamification
app.use("/api/gamification", gamificationRoutes);

// Faculty
app.use("/api/faculty", facultyRoutes);

// ✅ PORTFOLIO (THIS FIXES YOUR 404)
app.use("/api/portfolio", portfolioRoutes);

// HOD
app.use("/api/hod", hodRoutes);
app.use("/api/hod-complaints", hodComplaintsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/final-submission", finalSubmissionRoutes);
app.use("/api/ai/project", aiProjectRoutes);
/* ======================================================
   404 HANDLER (MUST BE LAST)
====================================================== */
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

export default app;
