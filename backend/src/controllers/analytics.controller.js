import Project from "../models/Project.model.js";
import ProjectHealthSnapshot from "../models/ProjectHealthSnapshot.model.js";
import { backfillGithubHistory } from "../services/githubService.js";

/**
 * Update the GitHub URL for a project
 */
export const updateGithubUrl = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { githubUrl } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // A real implementation would verify the user owns the project here
    await Project.updateOne(
      { _id: projectId },
      { $set: { githubUrl } }
    );
    project.githubUrl = githubUrl;

    // Immediately fetch & populate the last 30 days of commits so it renders nicely!
    const backfillResult = await backfillGithubHistory(projectId, githubUrl);

    if (!backfillResult.success) {
      return res.status(400).json({ 
        message: backfillResult.reason 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "GitHub URL updated successfully",
      project 
    });
  } catch (error) {
    console.error("Error updating GitHub URL:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/**
 * Get project health stats including recent snapshots
 */
export const getProjectHealthStats = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).select("currentHealthScore healthStatus githubUrl");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Get last 30 snapshots
    const snapshots = await ProjectHealthSnapshot.find({ projectId })
      .sort({ date: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      currentHealthScore: project.currentHealthScore,
      healthStatus: project.healthStatus,
      githubUrl: project.githubUrl,
      snapshots: snapshots.reverse() // Return chronological order
    });
  } catch (error) {
    console.error("Error fetching project health stats:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/**
 * Get all At-Risk projects for Faculty/HOD
 */
export const getAtRiskProjects = async (req, res) => {
  try {
    // A real implementation might filter by department or mentorId
    const atRiskProjects = await Project.find({
      healthStatus: { $in: ["Warning", "Critical"] }
    })
    .populate("studentId", "name email registrationNumber")
    .sort({ currentHealthScore: 1 }) // Lowest score first
    .limit(20);

    res.status(200).json({
      success: true,
      projects: atRiskProjects
    });
  } catch (error) {
    console.error("Error fetching at-risk projects:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
