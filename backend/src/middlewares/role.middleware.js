// src/middlewares/role.middleware.js

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // 🔍 Debug (KEEP during development)
      console.log("ROLE CHECK → User:", req.user);

      // ❌ No authenticated user
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized: User not authenticated",
        });
      }

      // ❌ Role missing
      if (!req.user.role) {
        return res.status(403).json({
          message: "Forbidden: User role missing",
        });
      }

      // ❌ Role not allowed
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Forbidden: ${req.user.role} role not allowed`,
        });
      }

      // ✅ Allowed
      next();
    } catch (error) {
      console.error("❌ Role middleware error:", error);
      return res.status(500).json({
        message: "Internal server error in role middleware",
      });
    }
  };
};
