import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

const Login = () => {
  const auth = useAuth();
  const login = auth ? auth.login : null;
  const loading = auth ? auth.loading : false;
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Credentials are required for authentication.");
      return;
    }

    try {
      const res = await login(form.email.trim(), form.password);
      if (!res.success) {
        setError(res.message || "Invalid credentials provided.");
        return;
      }

      const saved = localStorage.getItem("elor_user");
      const userObj = saved ? JSON.parse(saved) : null;

      if (!userObj) {
        setError("Synchronization failed. Please re-authenticate.");
        return;
      }

      if (userObj?.role === "hod") {
        navigate("/hod/dashboard");
      } else if (["faculty", "admin"].includes(userObj?.role)) {
        navigate("/faculty/dashboard");
      } else {
        navigate("/student/projects");
      }
    } catch (err) {
      setError("An unexpected server error occurred.");
    }
  };

  return (
    <div className="acadx-auth-page">
      {/* Left Branding Pane */}
      <div className="auth-hero-pane">
        <div className="hero-content fade-in">
          <img src="/logo.png" alt="AcadX Logo" className="hero-logo" />
          <h1 className="hero-title">Welcome to <span className="gemini-text">ELOR Portal</span></h1>
          <p className="hero-subtitle">The next-generation academic evaluation platform designed for industry-level oversight and precision.</p>
        </div>
        <div className="legal-footer">© 2025 AcadX Systems. Internal Use Only.</div>
      </div>

      {/* Right Form Pane */}
      <div className="auth-form-pane">
        <div className="auth-card-wrapper glass-panel fade-in">
          <div className="form-header">
            <h2 className="form-greeting">Secure Access</h2>
            <p className="form-subgreeting">Authenticate with your institutional credentials</p>
          </div>

          {error && <div className="acadx-alert-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className="acadx-auth-form">
            <div className="form-group">
              <label className="acadx-label">Institutional Email</label>
              <input
                name="email"
                type="email"
                className="acadx-input"
                value={form.email}
                onChange={handleChange}
                placeholder="name@university.edu"
                required
              />
            </div>

            <div className="form-group">
              <label className="acadx-label">Access Key</label>
              <input
                name="password"
                type="password"
                className="acadx-input"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="acadx-btn-primary">
              {loading ? "Authenticating..." : "Establish Session"}
            </button>
          </form>

          <footer className="form-footer">
            <Link to="/register" className="acadx-footer-link">Initialize Account</Link>
            <Link to="/forgot-password" name="forgot" className="acadx-footer-link">Recovery Access</Link>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;