import api from "./client";

/* =========================
   PORTFOLIO APIs
========================= */

export const fetchMyPortfolio = async () => {
  const res = await api.get("/portfolio/me");
  return res.data.portfolio;
};

export const generatePortfolio = async () => {
  const res = await api.post("/portfolio/generate");
  return res.data.portfolio;
};
