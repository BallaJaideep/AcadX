export const fileUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  
  // Ensure we don't end up with multiple slashes or missing slashes
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = import.meta.env.VITE_SERVER_URL || "https://acadx-backend.onrender.com";
  
  return `${baseUrl}${cleanPath}`;
};
