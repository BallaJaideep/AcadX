// src/utils/projectStatus.util.js
import Milestone from "../models/Milestone.model.js";

/*
  STATUS RULES:
  - No milestones            → not_started
  - Some completed           → in_progress
  - All completed            → completed
*/

export const deriveProjectStatus = async (projectId) => {
  const milestones = await Milestone.find({ projectId }).lean();

  if (!milestones || milestones.length === 0) {
    return "not_started";
  }

  const completedCount = milestones.filter(
    (m) => m.status === "completed"
  ).length;

  if (completedCount === milestones.length) {
    return "completed";
  }

  if (completedCount > 0) {
    return "in_progress";
  }

  return "not_started";
};
