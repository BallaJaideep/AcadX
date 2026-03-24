import api from "./client";

/* ==========================
   STUDENT SUBMIT WORK
========================== */
export const submitWork = async (payload) => {
  const res = await api.post("/submissions", payload);
  return res.data;
};

/* ==========================
   STUDENT – MY SUBMISSIONS
========================== */
export const fetchMySubmissions = async () => {
  const res = await api.get("/submissions/my");
  return res.data.submissions || [];
};

/* ==========================
   FACULTY – PROJECT SUBMISSIONS
========================== */
export const fetchProjectSubmissions = async (projectId) => {
  const res = await api.get(`/submissions/project/${projectId}`);
  return res.data.submissions || [];
};

/* ==========================
   FACULTY REVIEW
========================== */
export const reviewSubmission = async (id, status, feedback) => {
  const res = await api.patch(`/submissions/${id}/review`, {
    status,
    feedback,
  });
  return res.data;
};
