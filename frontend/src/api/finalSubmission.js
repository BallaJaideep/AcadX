import api from "./client";

export const submitFinalSubmission = async (formData) => {
  const res = await api.post("/final-submission", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getFinalSubmission = async (projectId) => {
  const res = await api.get(`/final-submission/${projectId}`);
  return res.data;
};

export const reviewFinalSubmission = async (projectId, payload) => {
  const res = await api.patch(
    `/final-submission/${projectId}/review`,
    payload
  );
  return res.data;
};
