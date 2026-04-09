import Project from "../models/Project.model.js";
import ProjectHealthSnapshot from "../models/ProjectHealthSnapshot.model.js";
import { fetchRecentGithubActivity } from "../services/githubService.js";

import { PROJECT_STATUS } from "../constants/projectStatus.js";

/**
 * Runs the health checks for all active projects.
 * Should be run daily (e.g., at midnight).
 */
export const runHealthMonitorJob = async () => {
  console.log("⏰ Starting Nightly Project Health Monitor Job...");

  try {
    // 1. Get all projects that are active and have a GitHub URL linked
    const activeProjects = await Project.find({
      githubUrl: { $ne: "" },
      status: { $in: [PROJECT_STATUS.IN_PROGRESS, PROJECT_STATUS.ACTIVE, PROJECT_STATUS.DRAFT] } 
    }).populate("studentId"); // To get email if needed for interventions

    console.log(`🔍 Found ${activeProjects.length} active projects to analyze.`);

    for (const project of activeProjects) {
      console.log(`📊 Analyzing project: ${project.title}`);

      // 2. Fetch GitHub activity for TODAY
      const activity = await fetchRecentGithubActivity(project.githubUrl);

      // 3. Retrieve last 6 days of snapshots from database to calculate 7-day rolling sum
      const pastSnapshots = await ProjectHealthSnapshot.find({ projectId: project._id })
        .sort({ date: -1 })
        .limit(6);
      
      const pastCommitsSum = pastSnapshots.reduce((sum, snap) => sum + (snap.commitsCount || 0), 0);
      const sevenDaySum = pastCommitsSum + activity.commitsCount;

      // 4. Calculate today's Health Score dynamically based on Weekly Consistency
      let penalty = 0;
      
      // Student MUST make at least 3 commits per week
      if (sevenDaySum < 3) {
        penalty = 10; // Heavy drop
      } else {
        penalty = -5; // Increase score smoothly
      }

      // Calculate new score
      let newScore = (project.currentHealthScore || 100) - penalty;
      // Clamp between 0 and 100
      newScore = Math.max(0, Math.min(100, newScore));

      // Determine nominal status
      if (newScore < 50) {
        status = "Critical";
      } else if (newScore < 80) {
        status = "Warning";
      } else {
        status = "Healthy";
      }

      // 4. Save the snapshot for the heatmap
      const snapshot = new ProjectHealthSnapshot({
        projectId: project._id,
        date: new Date(),
        commitsCount: activity.commitsCount,
        prsOpened: activity.prsOpened,
        issuesActivity: activity.issuesActivity,
        dailyHealthScore: newScore,
      });
      await snapshot.save();

      // 5. Update The Project model safely using updateOne 
      // This prevents existing legacy schema validation errors from crashing the job
      await Project.updateOne(
        { _id: project._id },
        { $set: { currentHealthScore: newScore, healthStatus: status } }
      );

      // 6. Automated Interventions (e.g. Email Nudge)
      if (status === "Warning") {
        console.log(`⚠️  [INTERVENTION] Emailing ${project.studentId?.email} about low velocity.`);
        // sendWarningEmailToStudent(project);
      } else if (status === "Critical") {
        console.log(`🚨 [INTERVENTION] Alerting HoD about Critical project: ${project.title}`);
        // sendCriticalAlertToHOD(project);
      }
    }

    console.log("✅ Nightly Project Health Monitor Job completed.");

  } catch (error) {
    console.error("❌ Error in runHealthMonitorJob:", error);
  }
};
