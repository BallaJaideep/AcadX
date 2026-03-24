import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    department: "",
    semester: 3,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "semester" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await register(form);
    if (!res.success) {
      setError(res.message);
      return;
    }

    if (["faculty", "hod", "admin"].includes(form.role)) {
      navigate("/faculty/dashboard");
    } else {
      navigate("/student/projects");
    }
  };

  return (
    <div className="acadx-auth-page">
      {/* Left Branding Pane */}
      <div className="auth-hero-pane">
        <div className="hero-content fade-in">
          <img src="/logo.png" alt="AcadX Logo" className="hero-logo" />
          <h1 className="hero-title">Welcome to <span className="gemini-text">AcadX</span></h1>
          <p className="hero-subtitle">The next-generation academic evaluation platform designed for industry-level oversight and precision.</p>
        </div>
        <div className="legal-footer">© 2025 AcadX Systems. Internal Use Only.</div>
      </div>

      {/* Right Form Pane */}
      <div className="auth-form-pane">
        <div className="auth-card-wrapper register-wide glass-panel fade-in">
          <div className="form-header">
            <h2 className="form-greeting">Create Account</h2>
            <p className="form-subgreeting">Initialize your institutional profile</p>
          </div>

          {error && <div className="acadx-alert-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className="acadx-auth-form">
            <div className="form-group">
              <label className="acadx-label">Full Legal Name</label>
              <input
                name="name"
                className="acadx-input"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Alexander Hamilton"
                required
              />
            </div>

            <div className="form-group">
              <label className="acadx-label">Institutional Email</label>
              <input
                type="email"
                name="email"
                className="acadx-input"
                value={form.email}
                onChange={handleChange}
                placeholder="name@university.edu"
                required
              />
            </div>

            <div className="form-group">
              <label className="acadx-label">Define Access Key</label>
              <input
                type="password"
                name="password"
                className="acadx-input"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                required
              />
            </div>

            <div className="form-row-grid">
              <div className="form-group">
                <label className="acadx-label">Institutional Role</label>
                <select
                  name="role"
                  className="acadx-select"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="hod">HOD</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {form.role !== "hod" && (
                <div className="form-group">
                  <label className="acadx-label">Current Semester</label>
                  <input
                    type="number"
                    name="semester"
                    min={1}
                    max={8}
                    className="acadx-input"
                    value={form.semester}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="acadx-label">Department / Faculty</label>
              <input
                name="department"
                className="acadx-input"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g. Computer Science & Engineering"
              />
            </div>

            <button type="submit" disabled={loading} className="acadx-btn-primary">
              {loading ? "Initializing Records..." : "Establish Account"}
            </button>
          </form>

          <footer className="form-footer" style={{ justifyContent: 'center' }}>
            <p className="footer-text-muted" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Already registered?{" "}
              <Link to="/login" className="acadx-footer-link" style={{ fontWeight: '600' }}>
                Authenticate here
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Register;