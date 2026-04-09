// src/controllers/faculty.controller.js

import Project from "../models/Project.model.js";
import Milestone from "../models/Milestone.model.js";
import MilestoneComplaint from "../models/MilestoneComplaint.model.js";

/* ======================================================
   FACULTY PROJECT PROGRESS
   GET /api/faculty/project-progress
   ✔ Shows how much each project is completed
====================================================== */
export const getFacultyProjectProgress = async (req, res) => {
  try {
    const facultyId = req.user._id;

    // 🔐 Only projects assigned to this faculty
    const projects = await Project.find({
      mentorId: facultyId,
    }).populate("studentId", "name email");

    const result = [];

    for (const project of projects) {
      const milestones = await Milestone.find({
        projectId: project._id,
      }).sort({ orderIndex: 1 });

      const totalWeeks = milestones.length;
      const completedWeeks = milestones.filter(
        (m) => m.status === "completed"
      ).length;

      const progress =
        totalWeeks === 0
          ? 0
          : Math.round((completedWeeks / totalWeeks) * 100);

      result.push({
        projectId: project._id,
        projectTitle: project.title,
        student: project.studentId,
        totalWeeks,
        completedWeeks,
        progress,
        status:
          progress === 100
            ? "completed"
            : totalWeeks === 0
            ? "not_started"
            : "in_progress",
        currentHealthScore: project.currentHealthScore,
        healthStatus: project.healthStatus,
      });
    }

    return res.json({ projects: result });
  } catch (error) {
    console.error("❌ getFacultyProjectProgress error:", error);
    return res.status(500).json({
      message: "Failed to load faculty project progress",
    });
  }
};

/* ======================================================
   FACULTY COMPLAINTS
   GET /api/faculty/complaints
   ✔ Only unresolved complaints
====================================================== */
export const getFacultyComplaints = async (req, res) => {
  try {
    const complaints = await MilestoneComplaint.find({
      status: { $in: ["PENDING", "REOPENED"] },
    })
      .populate("projectId", "title")
      .populate("studentId", "name email")
      .populate("milestoneId", "title phase")
      .sort({ createdAt: -1 });

    return res.json({ complaints });
  } catch (error) {
    console.error("❌ getFacultyComplaints error:", error);
    return res.status(500).json({
      message: "Failed to load complaints",
    });
  }
};
