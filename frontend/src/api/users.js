import api from "./client";

/* =========================
   USER APIs
========================= */

export const uploadProfilePhoto = async (file) => {
  const fd = new FormData();
  fd.append("photo", file);

  const res = await api.post("/users/me/photo", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const uploadResume = async (file) => {
  const fd = new FormData();
  fd.append("resume", file);

  const res = await api.post("/users/me/resume", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const fetchMyResume = async () => {
  const res = await api.get("/users/me/resume");
  return res.data.resumePath;
};
