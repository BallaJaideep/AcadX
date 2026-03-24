import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  BookOpen,
  LayoutDashboard,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  FileText,
  Users,
  MessageSquare,
  Award,
  ClipboardList,
  CheckCircle2,
  BarChart3,
  Shield,
  Sparkles,
} from "lucide-react";
import "./HomePage.css";

const HomePage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showChatTooltip, setShowChatTooltip] = useState(false);
  const [recoverStep, setRecoverStep] = useState("email");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "student") navigate("/student/projects");
      else if (user.role === "faculty") navigate("/faculty/dashboard");
      else if (user.role === "hod") navigate("/hod/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setShowChatTooltip(true), 3500);
    const t2 = setTimeout(() => setShowChatTooltip(false), 7500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !role) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const { default: api } = await import("../../api/client");
      await api.post("/auth/register", { name, email, password, role, department, semester });
      setSuccess("Account created! You can now sign in.");
      setActiveTab("login");
      setName(""); setDepartment(""); setSemester("");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);
    try {
      const { default: api } = await import("../../api/client");
      const res = await api.post("/auth/forgot-password", { email });
      setSuccess(res.data.message || "Security code transmitted to your inbox.");
      setRecoverStep("reset");
    } catch (err) {
      setError(err.response?.data?.message || "Verification request failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);
    try {
      const { default: api } = await import("../../api/client");
      await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      setSuccess("Credential update successful. You can now sign in.");
      setActiveTab("login");
      setRecoverStep("email");
      setPassword("");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid security code.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      num: "01",
      title: "Real-Time Progress Tracking",
      desc: "Monitor project progress with live dashboards. Track milestone completion, submission timelines, and performance metrics — for every student, all at once.",
      tags: ["Milestones", "Live Sync", "Analytics"],
      visual: "progress",
    },
    {
      num: "02",
      title: "Secure Document Submission",
      desc: "Students upload PDFs and presentations directly. Faculty can view and download instantly. Every file is organized, versioned, and accessible at any time.",
      tags: ["PDF Upload", "PPT Support", "Instant Access"],
      visual: "docs",
      reverse: true,
    },
    {
      num: "03",
      title: "Department-Level Analytics",
      desc: "HODs get a complete view of department performance — student counts, faculty workloads, points earned, and top performers — all in one place.",
      tags: ["HOD View", "Faculty Load", "Leaderboard"],
      visual: "analytics",
    },
  ];

  return (
    <div className="home-root">

      {/* ─── NAVBAR ─── */}
      <nav className={`home-nav ${scrolled ? "scrolled" : ""}`}>
        {/* Logo */}
        <div className="home-nav-brand-wrap">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <defs>
              <linearGradient id="bgSq" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1e1253"/>
                <stop offset="100%" stopColor="#3b1fa8"/>
              </linearGradient>
              <linearGradient id="shieldG" x1="18" y1="5" x2="18" y2="31" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(167,139,250,0.35)"/>
                <stop offset="100%" stopColor="rgba(109,40,217,0.15)"/>
              </linearGradient>
              <linearGradient id="boltG" x1="18" y1="9" x2="18" y2="29" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff"/>
                <stop offset="100%" stopColor="#c4b5fd"/>
              </linearGradient>
            </defs>
            {/* Dark square */}
            <rect width="36" height="36" rx="10" fill="url(#bgSq)"/>
            {/* Subtle top glow */}
            <ellipse cx="18" cy="2" rx="12" ry="4" fill="rgba(139,92,246,0.25)"/>
            {/* Shield */}
            <path
              d="M18 6 L28 10.5 V20 C28 25.8 18 31 18 31 C18 31 8 25.8 8 20 V10.5 Z"
              fill="url(#shieldG)"
              stroke="rgba(167,139,250,0.5)"
              strokeWidth="1.2"
            />
            {/* Bold lightning bolt */}
            <path
              d="M21 9.5 L14.5 20 H19.5 L15.5 28.5 L24.5 17 H19.5 Z"
              fill="url(#boltG)"
            />
          </svg>
          <span className="home-nav-brand">AcadX</span>
        </div>

        <ul className="home-nav-links">
          <li><a onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</a></li>
          <li><a onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How It Works</a></li>
          <li><a onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>About</a></li>
        </ul>

        <div className="home-nav-cta">
          <button className="nav-btn ghost" onClick={() => { setActiveTab("login"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            Sign In
          </button>
          <button className="nav-btn solid" onClick={() => { setActiveTab("register"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            Get Started <ArrowRight size={14} style={{ marginLeft: 4 }} />
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="home-hero">
        <div className="hero-bg-img" />
        <div className="hero-bg-overlay" />
        <div className="hero-bottom-fade" />

        <div className="hero-body">
          {/* LEFT */}
          <div className="hero-content-left">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Academic Excellence Platform
            </div>

            <h1 className="hero-title">
              Where Academic<br />
              Projects Meet{" "}
              <span className="accent-word">Intelligence</span>
            </h1>

            <p className="hero-sub">
              AcadX unifies Students, Faculty, and HODs on a single platform —
              built for seamless project submission, mentorship, evaluation, and
              real-time oversight.
            </p>

            <div className="hero-actions">
              <button className="hero-btn-primary" onClick={() => setActiveTab("register")}>
                <Sparkles size={16} />
                Start Free Today
              </button>
              <button
                className="hero-btn-secondary"
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              >
                See How It Works
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="hero-stats-row">
              <div className="hero-stat">
                <span className="hero-stat-num">500+</span>
                <span className="hero-stat-label">Students</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-num">50+</span>
                <span className="hero-stat-label">Faculty</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-num">100+</span>
                <span className="hero-stat-label">Projects</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-num">98%</span>
                <span className="hero-stat-label">Satisfaction</span>
              </div>
            </div>
          </div>

          {/* RIGHT — LOGIN CARD */}
          <div className="hero-card-wrap">
            <div className="hero-login-card">
              <div className="login-card-header">
                <div className="login-card-title">Welcome to AcadX</div>
                <div className="login-card-sub">Sign in or create your account</div>
              </div>

              <div className="login-tabs">
                <button
                  className={`login-tab ${activeTab === "login" ? "active" : ""}`}
                  onClick={() => { setActiveTab("login"); setError(""); setSuccess(""); }}
                >
                  Sign In
                </button>
                <button
                  className={`login-tab ${activeTab === "register" ? "active" : ""}`}
                  onClick={() => { setActiveTab("register"); setError(""); setSuccess(""); }}
                >
                  Register
                </button>
                <button
                  className={`login-tab ${activeTab === "forgot" ? "active" : ""}`}
                  onClick={() => { setActiveTab("forgot"); setError(""); setSuccess(""); }}
                >
                  Reset Password
                </button>
              </div>

              {error && <div className="card-alert error" style={{ marginBottom: 14 }}>{error}</div>}
              {success && <div className="card-alert success" style={{ marginBottom: 14 }}>{success}</div>}

              {activeTab === "login" && (
                <form className="login-card-form" onSubmit={handleLogin}>
                  <div className="form-field">
                    <label className="field-label">Email</label>
                    <input
                      type="email"
                      className="field-input"
                      placeholder="you@university.edu"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="field-label">Password</label>
                    <input
                      type="password"
                      className="field-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ textAlign: "right", marginTop: "8px" }}>
                    <button type="button" className="forgot-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => { setActiveTab("forgot"); setError(""); setSuccess(""); }}>Forgot password?</button>
                  </div>
                  <button type="submit" className="card-submit-btn" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In →"}
                  </button>
                </form>
              )}

              {activeTab === "forgot" && recoverStep === "email" && (
                <form className="login-card-form" onSubmit={handleSendOtp}>
                  <div className="form-field">
                    <label className="field-label">Institutional Email</label>
                    <input
                      type="email"
                      className="field-input"
                      placeholder="you@university.edu"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="card-submit-btn" disabled={loading}>
                    {loading ? "Transmitting..." : "Generate Security Code →"}
                  </button>
                </form>
              )}

              {activeTab === "forgot" && recoverStep === "reset" && (
                <form className="login-card-form" onSubmit={handleResetPassword}>
                  <div className="form-field">
                    <label className="field-label">Validated Email</label>
                    <input
                      type="email"
                      className="field-input"
                      style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
                      value={email}
                      readOnly
                    />
                  </div>
                  <div className="form-field">
                    <label className="field-label">Security Code (OTP)</label>
                    <input
                      type="text"
                      className="field-input"
                      placeholder="000000"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="field-label">New Password</label>
                    <input
                      type="password"
                      className="field-input"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="card-submit-btn" disabled={loading}>
                    {loading ? "Updating..." : "Authorize Reset →"}
                  </button>
                </form>
              )}

              {activeTab === "register" && (
                <form className="login-card-form" onSubmit={handleRegister}>
                  <div className="form-field">
                    <label className="field-label">Full Name</label>
                    <input
                      type="text"
                      className="field-input"
                      placeholder="Your full name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="field-label">Email</label>
                    <input
                      type="email"
                      className="field-input"
                      placeholder="you@university.edu"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="field-label">Password</label>
                    <input
                      type="password"
                      className="field-input"
                      placeholder="Create a password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="field-label">Role</label>
                    <select className="field-select" value={role} onChange={e => setRole(e.target.value)}>
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="hod">Head of Department</option>
                    </select>
                  </div>
                  {role === "student" && (
                    <div className="form-field">
                      <label className="field-label">Semester</label>
                      <select className="field-select" value={semester} onChange={e => setSemester(e.target.value)}>
                        <option value="">Select semester</option>
                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="form-field">
                    <label className="field-label">Department</label>
                    <input
                      type="text"
                      className="field-input"
                      placeholder="e.g. Computer Science"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="card-submit-btn" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account →"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── ROLE CARDS ─── */}
      <section className="roles-section" id="how-it-works">
        <div className="roles-section-inner">
          <div className="section-eyebrow">
            <Users size={14} />
            Platform Overview
          </div>
          <h2 className="section-heading">Built for Every Role</h2>
          <p className="section-sub">
            Three distinct experiences — one unified platform. AcadX powers the complete
            academic project lifecycle for every stakeholder.
          </p>
        </div>

        <div className="roles-grid">
          {/* Student */}
          <div className="role-card student">
            <div className="role-card-bg" />
            <div className="role-card-overlay" />
            <div className="role-card-content">
              <div className="role-icon-circle">
                <GraduationCap size={24} />
              </div>
              <div className="role-type-tag">For Students</div>
              <div className="role-name">Submit, Track & Excel</div>
              <p className="role-desc">
                Create projects, request mentors, upload documents, and build your
                academic portfolio — all in one place.
              </p>
              <div className="role-bullets">
                <div className="role-bullet"><CheckCircle2 size={14} className="bullet-icon" /> Create & submit projects</div>
                <div className="role-bullet"><CheckCircle2 size={14} className="bullet-icon" /> Request faculty mentors</div>
                <div className="role-bullet"><CheckCircle2 size={14} className="bullet-icon" /> Track milestones & marks</div>
                <div className="role-bullet"><CheckCircle2 size={14} className="bullet-icon" /> Build public portfolio</div>
              </div>
            </div>
          </div>

          {/* Faculty */}
          <div className="role-card faculty">
            <div className="role-card-bg" />
            <div className="role-card-overlay" />
            <div className="role-card-content">
              <div className="role-icon-circle">
                <BookOpen size={24} />
              </div>
              <div className="role-type-tag">For Faculty</div>
              <div className="role-name">Mentor, Evaluate & Guide</div>
              <p className="role-desc">
                Review mentor requests, evaluate submissions, assign marks, and
                monitor your entire mentored cohort with clarity.
              </p>
              <div className="role-bullets">
                <div className="role-bullet"><CheckCircle2 size={14} className="bullet-icon" /> Accept mentor requests</div>
                <div className="role-bullet"><CheckCircle2 size={14} className="bullet-icon" /> Evaluate & mark submissions</div>
                <div className="role-bullet"><CheckCircle2 size={14} className="bullet-icon" /> Monitor project progress</div>
                <div className="role-bullet"><CheckCircle2 size={14} className="bullet-icon" /> Handle student complaints</div>
              </div>
            </div>
          </div>

          {/* HOD */}
          <div className="role-card hod">
            <div className="role-card-bg" />
            <div className="role-card-overlay" />
            <div className="role-card-content">
              <div className="role-icon-circle">
                <LayoutDashboard size={24} />
              </div>
              <div className="role-type-tag">For Head of Department</div>
              <div className="role-name">Oversee & Optimize</div>
              <p className="role-desc">
                Complete department visibility — faculty workloads, student progress,
                top performers, and analytics at a glance.
              </p>
              <div className="role-bullets">
                <div className="role-bullet"><CheckCircle2 size={14} className="bullet-icon" /> Full department oversight</div>
                <div className="role-bullet"><CheckCircle2 size={14} className="bullet-icon" /> Faculty load management</div>
                <div className="role-bullet"><CheckCircle2 size={14} className="bullet-icon" /> Student directory & audit</div>
                <div className="role-bullet"><CheckCircle2 size={14} className="bullet-icon" /> Analytics & reporting</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES — ALTERNATING ROWS ─── */}
      <section className="features-section" id="features">
        <div className="section-eyebrow" style={{ marginBottom: 14 }}>
          <Sparkles size={13} />
          Features
        </div>
        <h2 className="section-heading">Everything in One Place</h2>
        <p className="section-sub">
          Industry-grade tools built to streamline the entire academic project lifecycle —
          from creation to completion.
        </p>

        <div className="features-list">
          {features.map((f, i) => (
            <div key={i} className={`feature-row ${f.reverse ? "reverse" : ""}`}>
              <div className="feature-text">
                <div className="feature-number">{f.num}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
                <div className="feature-tags">
                  {f.tags.map(t => <span key={t} className="feature-tag">{t}</span>)}
                </div>
              </div>

              <div className="feature-visual">
                {f.visual === "progress" && (
                  <div className="feat-vis-progress">
                    {[
                      { label: "Project Alpha", pct: 85, color: "indigo" },
                      { label: "Project Beta", pct: 60, color: "sky" },
                      { label: "Project Gamma", pct: 92, color: "green" },
                    ].map(b => (
                      <div key={b.label} className="fv-bar-row">
                        <div className="fv-bar-label">
                          <span>{b.label}</span>
                          <span>{b.pct}%</span>
                        </div>
                        <div className="fv-bar-track">
                          <div className={`fv-bar-fill ${b.color}`} style={{ width: `${b.pct}%` }} />
                        </div>
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      {[{ l: "On Track", c: "#059669" }, { l: "Needs Review", c: "#d97706" }].map(s => (
                        <span key={s.l} style={{ fontSize: 11, fontWeight: 600, color: s.c, background: `${s.c}18`, padding: "4px 10px", borderRadius: 999, border: `1px solid ${s.c}30` }}>{s.l}</span>
                      ))}
                    </div>
                  </div>
                )}

                {f.visual === "docs" && (
                  <div className="feat-vis-doc">
                    {[
                      { icon: <FileText size={18} />, name: "Technical Report.pdf", meta: "Submitted • 2.4 MB", cls: "pdf" },
                      { icon: <ClipboardList size={18} />, name: "Presentation.pptx", meta: "Submitted • 5.1 MB", cls: "ppt" },
                    ].map(doc => (
                      <div key={doc.name} className="fv-doc-card">
                        <div className={`fv-doc-icon ${doc.cls}`}>{doc.icon}</div>
                        <div className="fv-doc-info">
                          <div className="fv-doc-name">{doc.name}</div>
                          <div className="fv-doc-meta">{doc.meta}</div>
                        </div>
                        <div className="fv-doc-actions">
                          <button className="fv-doc-btn">View</button>
                          <button className="fv-doc-btn">↓</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {f.visual === "analytics" && (
                  <div className="feat-vis-analytics">
                    <div className="fv-stat-row">
                      {[
                        { num: "48", label: "Students" },
                        { num: "12", label: "Faculty" },
                        { num: "87%", label: "Completion" },
                        { num: "1.2K", label: "Points" },
                      ].map(s => (
                        <div key={s.label} className="fv-stat-tile">
                          <div className="fv-tile-num">{s.num}</div>
                          <div className="fv-tile-label">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── STATS SECTION ─── */}
      <section className="stats-section">
        <div className="stats-inner">
          <h2 className="stats-title">Trusted Across the Department</h2>
          <div className="stats-grid">
            <div className="stat-cell">
              <div className="stat-big-num">500+</div>
              <div className="stat-big-label">Students Enrolled</div>
            </div>
            <div className="stat-cell">
              <div className="stat-big-num">50+</div>
              <div className="stat-big-label">Expert Faculty</div>
            </div>
            <div className="stat-cell">
              <div className="stat-big-num">100+</div>
              <div className="stat-big-label">Projects Done</div>
            </div>
            <div className="stat-cell">
              <div className="stat-big-num">98%</div>
              <div className="stat-big-label">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="home-footer" id="contact">
        <div className="footer-grid">
          <div className="footer-left">
            <span className="footer-brand">AcadX</span>
            <p className="footer-tagline">Academic project management for students, faculty &amp; departments.</p>
          </div>
          <ul className="footer-quick-links">
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="mailto:support@acadx.edu">Contact</a></li>
          </ul>
        </div>
        <hr className="footer-divider" />
        <div className="footer-bottom">
          <span className="footer-copy">© 2025 AcadX. All rights reserved.</span>
          <span className="footer-copy">Built for Academic Excellence</span>
        </div>
      </footer>


      {/* ─── CHATBOT FAB ─── */}
      <div className="chatbot-fab">
        {showChatTooltip && (
          <div className="chatbot-tooltip">
            <MessageSquare size={13} style={{ marginRight: 6, display: "inline" }} />
            Login to chat with AcadX AI
          </div>
        )}
        <button
          className="chatbot-btn"
          onClick={() => { setShowChatTooltip(v => !v); }}
          title="AcadX AI Assistant"
        >
          <MessageSquare size={22} />
        </button>
      </div>

    </div>
  );
};

export default HomePage;
