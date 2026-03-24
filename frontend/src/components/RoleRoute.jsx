// src/components/RoleRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Usage:
 * <RoleRoute roles={["student"]}><StudentPage/></RoleRoute>
 * <RoleRoute roles={["faculty","hod"]}><FacultyPage/></RoleRoute>
 */
const RoleRoute = ({ children, roles = [] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/" replace />;

  // if roles empty allow all authenticated users
  if (roles.length === 0) return children;

  if (!user || !user.role) {
    return <Navigate to="/" replace />;
  }

  if (!roles.includes(user.role)) {
    // redirect based on user's role
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />; // Fallback if admin has a dashboard
    }
    if (user.role === "hod") {
      return <Navigate to="/hod/dashboard" replace />;
    }
    if (user.role === "faculty") {
      return <Navigate to="/faculty/dashboard" replace />;
    }
    return <Navigate to="/student/projects" replace />;
  }

  return children;
};

export default RoleRoute;
