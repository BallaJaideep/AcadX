import Portfolio from "../models/Portfolio.model.js";
import Project from "../models/Project.model.js";
import User from "../models/user.model.js";
import { generatePortfolioFromAI } from "../services/aiPortfolio.service.js";
import { deriveProjectStatus } from "../utils/projectStatus.util.js";

/* ============================
   GET MY PORTFOLIO
============================ */
export const getMyPortfolio = async (req, res) => {
  try {
    const studentId = req.user._id;

    const portfolio = await Portfolio.findOne({ studentId }).lean();
    const projects = await Project.find({ studentId }).lean();

    // ✅ DERIVE STATUS FROM MILESTONES (SINGLE SOURCE OF TRUTH)
    const projectData = await Promise.all(
      projects.map(async (p) => {
        const derivedStatus = await deriveProjectStatus(p._id);

        return {
          title: p.title,
          status:
            derivedStatus === "completed"
              ? "Completed"
              : derivedStatus === "in_progress"
              ? "In Progress"
              : "Not Started",
          aiSummary:
            derivedStatus === "completed"
              ? "Completed project demonstrating applied skills."
              : derivedStatus === "in_progress"
              ? "Currently under development."
              : "Project has not been started yet.",
        };
      })
    );

    return res.json({
      portfolio: portfolio
        ? {
            ...portfolio,
            projects: projectData,
          }
        : null,
    });
  } catch (error) {
    console.error("❌ getMyPortfolio error:", error);
    res.status(500).json({ message: "Failed to load portfolio" });
  }
};

export const getStudentPortfolio = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Authorization check
    if (req.user.role !== "hod" && req.user.role !== "admin" && req.user._id.toString() !== studentId) {
        return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(studentId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const portfolio = await Portfolio.findOne({ studentId });
    
    // Fetch resume path separately if needed or just return user
    res.json({ 
        portfolio,
        targetUser: user
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch student portfolio" });
  }
};

/* ============================
   GENERATE / UPDATE PORTFOLIO (AI)
============================ */
export const generatePortfolio = async (req, res) => {
  try {
    const studentId = req.user._id;

    const student = await User.findById(studentId).lean();
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const projects = await Project.find({ studentId }).lean();

    // ✅ ALWAYS USE DERIVED STATUS (NOT project.status)
    const projectContext = await Promise.all(
      projects.map(async (p) => {
        const derivedStatus = await deriveProjectStatus(p._id);

        return {
          title: p.title,
          techStack: p.techStack || [],
          status:
            derivedStatus === "completed"
              ? "Completed"
              : derivedStatus === "in_progress"
              ? "In Progress"
              : "Not Started",
        };
      })
    );

    const aiInput = {
      student: {
        name: student.name,
        department: student.department,
        semester: student.semester,
        skills: student.skills || [],
      },
      projects: projectContext,
      regenerationId: Date.now(),
    };

    const aiResult = await generatePortfolioFromAI(aiInput);

    const portfolio = await Portfolio.findOneAndUpdate(
      { studentId },
      {
        studentId,
        tagline: aiResult.tagline,
        about: aiResult.about,
        skills: aiResult.skills,
        generatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ portfolio });
  } catch (error) {
    console.error("❌ generatePortfolio error:", error);
    res.status(500).json({
      message: "Portfolio generation failed",
    });
  }
};

