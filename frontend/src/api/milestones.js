import api from "./client";

/* ======================================
   Fetch milestones for a project
   GET /api/milestones/project/:projectId
====================================== */
export const fetchMilestonesByProject = async (projectId) => {
  if (!projectId) {
    throw new Error("fetchMilestonesByProject: projectId is required");
  }

  const res = await api.get(`/milestones/project/${projectId}`);
  return Array.isArray(res.data?.milestones)
    ? res.data.milestones
    : [];
};

/* ======================================
   AI generate milestones
   POST /api/milestones/ai-generate
====================================== */
export const generateMilestonesByAI = async (projectId) => {
  // 🔒 HARD GUARD (this stops silent failures)
  if (!projectId || typeof projectId !== "string") {
    console.error("generateMilestonesByAI called with invalid projectId:", projectId);
    throw new Error("Project ID is required for AI milestone generation");
  }

  console.log("📤 API → /milestones/ai-generate", { projectId });

  const res = await api.post("/milestones/ai-generate", {
    projectId, // ✅ explicit and correct
  });

  return res.data;
};

/* ======================================
   Student marks milestone complete
   PATCH /api/milestones/:id/complete
====================================== */
export const completeMilestone = async (milestoneId) => {
  if (!milestoneId) {
    throw new Error("completeMilestone: milestoneId is required");
  }

  const res = await api.patch(`/milestones/${milestoneId}/complete`);
  return res.data;
};

/* ======================================
   Student raises complaint on milestone
   POST /api/milestones/:id/complaint
====================================== */
export const raiseMilestoneComplaint = async (milestoneId, reason) => {
  if (!milestoneId) {
    throw new Error("raiseMilestoneComplaint: milestoneId is required");
  }

  if (!reason || !reason.trim()) {
    throw new Error("Complaint reason is required");
  }

  const res = await api.post(`/milestones/${milestoneId}/complaint`, {
    reason: reason.trim(),
  });

  return res.data;
};

/* ======================================
   Faculty / HOD deletes milestone
   DELETE /api/milestones/:id
====================================== */
export const deleteMilestone = async (milestoneId) => {
  if (!milestoneId) {
    throw new Error("deleteMilestone: milestoneId is required");
  }

  const res = await api.delete(`/milestones/${milestoneId}`);
  return res.data;
};
