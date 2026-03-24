import Milestone from "../models/Milestone.model.js";

export const deriveProjectStatus = async (projectId) => {
  const milestones = await Milestone.find({ projectId }).lean();

  if (milestones.length === 0) {
    return "draft";
  }

  const completedCount = milestones.filter(
    (m) => m.status === "completed"
  ).length;

  if (completedCount === milestones.length) {
    return "completed";
  }

  return "in_progress";
};
