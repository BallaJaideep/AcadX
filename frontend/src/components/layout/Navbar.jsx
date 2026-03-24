import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const renderLink = (to, label) => (
    <NavLink
      to={to}
      className={({ isActive }) => `acadx-nav-link ${isActive ? "active" : ""}`}
    >
      {label}
    </NavLink>
  );

  return (
    <header className="acadx-navbar">
      <div className="nav-container">

        {/* LEFT: Branding — matches HomePage exactly */}
        <div className="nav-left">
          <div className="nav-branding">
            {/* Shield SVG Logo — same as HomePage */}
            <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <defs>
                <linearGradient id="db-bgSq" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1e1253"/>
                  <stop offset="100%" stopColor="#3b1fa8"/>
                </linearGradient>
                <linearGradient id="db-shieldG" x1="18" y1="5" x2="18" y2="31" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="rgba(167,139,250,0.35)"/>
                  <stop offset="100%" stopColor="rgba(109,40,217,0.15)"/>
                </linearGradient>
                <linearGradient id="db-boltG" x1="18" y1="9" x2="18" y2="29" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ffffff"/>
                  <stop offset="100%" stopColor="#c4b5fd"/>
                </linearGradient>
              </defs>
              <rect width="36" height="36" rx="10" fill="url(#db-bgSq)"/>
              <ellipse cx="18" cy="2" rx="12" ry="4" fill="rgba(139,92,246,0.25)"/>
              <path
                d="M18 6 L28 10.5 V20 C28 25.8 18 31 18 31 C18 31 8 25.8 8 20 V10.5 Z"
                fill="url(#db-shieldG)"
                stroke="rgba(167,139,250,0.5)"
                strokeWidth="1.2"
              />
              <path
                d="M21 9.5 L14.5 20 H19.5 L15.5 28.5 L24.5 17 H19.5 Z"
                fill="url(#db-boltG)"
              />
            </svg>
            <h1 className="nav-logo">AcadX</h1>
          </div>
        </div>

        {/* CENTER: Navigation Links */}
        <div className="nav-center">
          {role === "student" && (
            <nav className="nav-menu">
              {renderLink("/student/dashboard", "Dashboard")}
              {renderLink("/student/create-project", "Initiate Track")}
              {renderLink("/student/requests", "Mentor Requests")}
              {renderLink("/milestones", "Milestones")}
              {renderLink("/portfolio", "Portfolio")}
              {renderLink("/student/complaint", "HOD Complaint")}
            </nav>
          )}

          {["faculty", "admin"].includes(role) && (
            <nav className="nav-menu">
              {renderLink("/faculty/dashboard", "Mentoring Dashboard")}
              {renderLink("/milestones", "Milestones")}
            </nav>
          )}

          {["hod", "admin"].includes(role) && (
            <nav className="nav-menu">
              {renderLink("/hod/dashboard", "Analytics")}
              {renderLink("/hod/faculty-directory", "Faculty Audit")}
              {renderLink("/hod/student-directory", "Student Directory")}
              {renderLink("/hod/complaints", "Complaints")}
            </nav>
          )}
        </div>

        {/* RIGHT: User Info + Logout */}
        <div className="nav-right">
          {user?.role && (
            <div className="user-profile-summary">
              <span className="user-name-meta">{user.name || "Administrator"}</span>
              <span className={`role-badge ${user.role.toLowerCase()}`}>
                {user.role}
              </span>
            </div>
          )}

          <div className="nav-divider"></div>

          <button className="nav-logout-btn" onClick={handleLogout}>
            <span>Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;