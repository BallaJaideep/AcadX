import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* =======================
   CONTEXT & LAYOUT
======================= */
import { AuthProvider, useAuth } from "./context/AuthContext";
import RoleRoute from "./components/RoleRoute";
import AppLayout from "./components/layout/AppLayout";

/* =======================
   AUTH PAGES
======================= */
import HomePage from "./pages/auth/HomePage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

/* =======================
   STUDENT PAGES
======================= */

import MyProjects from "./pages/student/MyProjects";
import StudentDashboard from "./pages/student/StudentDashboard";
import CreateProject from "./pages/student/CreateProject";
import RequestMentor from "./pages/student/RequestMentor";
import StudentRequests from "./pages/student/StudentRequests";
import ProjectDetails from "./pages/student/ProjectDetails";
import RaiseHodComplaint from "./pages/student/RaiseHodComplaint";
import FinalSubmission from "./pages/student/FinalSubmission";
import TechnicalRecordGenerator from "./pages/student/TechnicalRecordGenerator";
import EditProject from "./pages/student/EditProject";

/* =======================
   FACULTY / HOD PAGES
======================= */
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import MentorRequests from "./pages/faculty/MentorRequests";
import FacultyComplaints from "./pages/faculty/FacultyComplaints";
import HodDashboard from "./pages/hod/HodDashboard";
import HodComplaints from "./pages/hod/HodComplaints";
import FacultyDetails from "./pages/hod/FacultyDetails";
import StudentDetails from "./pages/hod/StudentDetails";
import FacultyDirectory from "./pages/hod/FacultyDirectory";
import StudentDirectory from "./pages/hod/StudentDirectory";
import EvaluateSubmission from "./pages/faculty/EvaluateSubmission";

/* =======================
   SHARED PAGES
======================= */
import MilestonesPage from "./pages/milestones/MilestonesPage";

import PortfolioPage from "./pages/portfolio/PortfolioPage";

/* =======================
   GLOBAL COMPONENTS
======================= */


/* ======================================================
   ROUTES + CHATBOT (AUTH-AWARE)
====================================================== */
const AppRoutes = () => {
  const auth = useAuth();
  
  if (!auth) {
    console.error("Critical: AuthContext is NULL in AppRoutes. Check if AuthProvider is mounted correctly.");
    return (
      <div style={{ padding: 40, background: '#020617', color: 'white', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#ef4444' }}>System Authentication Failure</h2>
            <p>Please check the console for more details.</p>
         </div>
      </div>
    );
  }

  const { isAuthenticated } = auth;

  return (
    <>
      <Routes>
        {/* HOME */}
        <Route path="/" element={<HomePage />} />

        {/* AUTH */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Navigate to="/" replace />} />

        {/* STUDENT */}
        <Route
          path="/student/dashboard"
          element={
            <RoleRoute roles={["student"]}>
              <AppLayout>
                <MyProjects />
              </AppLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/student/projects"
          element={
            <RoleRoute roles={["student"]}>
              <AppLayout>
                <MyProjects />
              </AppLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/student/create-project"
          element={
            <RoleRoute roles={["student"]}>
              <AppLayout>
                <CreateProject />
              </AppLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/student/generate-record"
          element={
            <RoleRoute roles={["student"]}>
              <AppLayout>
                <TechnicalRecordGenerator />
              </AppLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/student/request-mentor"
          element={
            <RoleRoute roles={["student"]}>
              <AppLayout>
                <RequestMentor />
              </AppLayout>
            </RoleRoute>
          }
        />

      

        <Route
          path="/student/edit-project/:id"
          element={
            <RoleRoute roles={["student"]}>
              <AppLayout>
                <EditProject />
              </AppLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/student/requests"
          element={
            <RoleRoute roles={["student"]}>
              <AppLayout>
                <StudentRequests />
              </AppLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/student/complaint"
          element={
            <RoleRoute roles={["student"]}>
              <AppLayout>
                <RaiseHodComplaint />
              </AppLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/student/final-submission/:projectId"
          element={
            <RoleRoute roles={["student"]}>
              <AppLayout>
                <FinalSubmission />
              </AppLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/student/project/:id"
          element={
            <RoleRoute roles={["student", "faculty", "hod", "admin"]}>
              <AppLayout>
                <ProjectDetails />
              </AppLayout>
            </RoleRoute>
          }
        />

        {/* FACULTY */}
        <Route
          path="/faculty/dashboard"
          element={
            <RoleRoute roles={["faculty", "admin"]}>
              <AppLayout>
                <FacultyDashboard />
              </AppLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/faculty/mentor-requests"
          element={
            <RoleRoute roles={["faculty", "admin"]}>
              <AppLayout>
                <MentorRequests />
              </AppLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/faculty/complaints"
          element={
            <RoleRoute roles={["faculty", "hod", "admin"]}>
              <AppLayout>
                <FacultyComplaints />
              </AppLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/faculty/review/:projectId"
          element={
            <RoleRoute roles={["faculty", "admin"]}>
              <AppLayout>
                <EvaluateSubmission />
              </AppLayout>
            </RoleRoute>
          }
        />

        {/* HOD */}
        <Route
          path="/hod/dashboard"
          element={
            <RoleRoute roles={["hod", "admin"]}>
              <AppLayout>
                <HodDashboard />
              </AppLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/hod/complaints"
          element={
            <RoleRoute roles={["hod", "admin"]}>
              <AppLayout>
                <HodComplaints />
              </AppLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/hod/faculty-directory"
          element={
            <RoleRoute roles={["hod", "admin"]}>
              <AppLayout>
                <FacultyDirectory />
              </AppLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/hod/student-directory"
          element={
            <RoleRoute roles={["hod", "admin"]}>
              <AppLayout>
                <StudentDirectory />
              </AppLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/hod/faculty/:facultyId"
          element={
            <RoleRoute roles={["hod", "admin"]}>
              <AppLayout>
                <FacultyDetails />
              </AppLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/hod/student/:studentId"
          element={
            <RoleRoute roles={["hod", "admin"]}>
              <AppLayout>
                <StudentDetails />
              </AppLayout>
            </RoleRoute>
          }
        />

        {/* SHARED */}
        <Route
          path="/milestones"
          element={
            <RoleRoute roles={["student", "faculty", "admin"]}>
              <AppLayout>
                <MilestonesPage />
              </AppLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/portfolio"
          element={
            <AppLayout>
              <PortfolioPage />
            </AppLayout>
          }
        />

        <Route
          path="/portfolio/:studentId"
          element={
            <AppLayout>
              <PortfolioPage />
            </AppLayout>
          }
        />

        

        {/* FALLBACK */}
        <Route
          path="*"
          element={
            <div className="auth-page">
              <div className="auth-card">
                <h2 className="auth-title">Page not found</h2>
                <p className="auth-subtitle">
                  The page you requested does not exist.
                </p>
              </div>
            </div>
          }
        />
      </Routes>
    </>
  );
};

/* ======================================================
   MAIN APP
====================================================== */
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
