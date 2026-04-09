
import axios from "axios";

/* ======================================
   AXIOS INSTANCE
====================================== */

// 🔧 CHANGE ONLY THIS WHEN DEPLOYING
// 🔧 DYNAMIC API BASE URL
const BASE_URL =
  import.meta.env.VITE_API_URL || 
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://acadx-backend.onrender.com/api");

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ======================================
   REQUEST INTERCEPTOR
   → Attach JWT token
====================================== */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("elor_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🔥 VITAL FIX: If data is FormData, remove static Content-Type so Axios auto-appends the multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    // 🐞 DEBUG (remove later if you want)
    console.log(
      "➡ API REQUEST:",
      config.method?.toUpperCase(),
      config.url
    );

    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

/* ======================================
   RESPONSE INTERCEPTOR
   → Global error handling
====================================== */
api.interceptors.response.use(
  (response) => {
    // 🐞 DEBUG
    console.log("✅ API RESPONSE:", response.config.url);
    return response;
  },

  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    /* 🔴 401 — UNAUTHORIZED */
    if (status === 401) {
      console.warn("🔐 Unauthorized – logging out");

      localStorage.removeItem("elor_token");
      localStorage.removeItem("elor_user");

      // avoid infinite redirect loop
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    /* 🟠 403 — FORBIDDEN */
    if (status === 403) {
      console.warn(
        "⛔ Forbidden – role does not have permission",
        message || error?.response?.data
      );
    }

    /* 🔴 NETWORK / DNS ERROR */
    if (!error.response) {
      console.error(
        "🌐 Network error / Server unreachable",
        error.message
      );
    }

    return Promise.reject(error);
  }
);

export default api;

