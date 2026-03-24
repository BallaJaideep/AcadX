import React, { useEffect, useState, useMemo } from "react";
import api from "../../api/client";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FolderOpen, Plus, Users, Search, BarChart2,
  Zap, TrendingUp, CheckCircle, Activity, Target,
  RefreshCw, Sparkles, Lightbulb, Calendar, Trophy,
  ArrowRight, ChevronRight, ChevronLeft, Layout, BookOpen, MessageSquare,
  Globe, Shield, Cpu, PieChart, Info, Map as MapIcon,
  Mail, Linkedin, Twitter, Github, ExternalLink, ArrowUpRight,
  XCircle, RotateCcw, AlertTriangle, Clock
} from "lucide-react";
import "./MyProjects.css";

/* ── Status config ─────────────────────────────────────────── */
const STATUS_CFG = {
  active: { label: "Active", cls: "active", bar: "linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)" },
  completed: { label: "Completed", cls: "completed", bar: "#10B981" },
  pending: { label: "Pending", cls: "pending", bar: "#F59E0B" },
};

/* ── Mentor Request Status config ──────────────────────────── */
const MENTOR_STATUS_CFG = {
  APPROVED:         { label: "Mentor Approved",    icon: <CheckCircle size={11} />,  bg: "rgba(16,185,129,0.1)",  color: "#065f46",  border: "rgba(16,185,129,0.25)"  },
  PENDING:          { label: "Mentor Pending",     icon: <Clock size={11} />,        bg: "rgba(99,102,241,0.1)", color: "#3730a3",  border: "rgba(99,102,241,0.25)"  },
  REJECTED:         { label: "Request Rejected",   icon: <XCircle size={11} />,      bg: "rgba(239,68,68,0.1)",  color: "#991b1b",  border: "rgba(239,68,68,0.2)"    },
  REJECTED_RECREATE:{ label: "Revision Required",  icon: <RotateCcw size={11} />,    bg: "rgba(245,158,11,0.1)", color: "#92400e",  border: "rgba(245,158,11,0.3)"   },
};

/* helper: get the latest mentor request status for a given project from the loaded array */
const getLatestMentorStatus = (mentorReqs, projectId) => {
  const matches = mentorReqs
    .filter(r => (r.projectId?._id || r.projectId) === projectId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return matches[0] || null;
};

/* ── AI Tips pool ──────────────────────────────────────────── */
const AI_TIPS = [
  { icon: <Lightbulb size={20} />, title: "Institutional Governance", body: "Every research track is validated against institutional standards for high-impact results." },
  { icon: <Globe size={20} />, title: "Global Collaboration", body: "Connect with experts worldwide to peer-review and refine your research methodologies." },
  { icon: <Shield size={20} />, title: "Portfolio Protection", body: "Your academic identity is secured with enterprise-grade encryption and exportable to major endpoints." },
  { icon: <Target size={20} />, title: "Milestone Efficiency", body: "Students using AcadX milestones complete projects 3x faster than traditional methods." },
];

/* ── Circular Progress ─────────────────────────────────────── */
const CircularProgress = ({ pct, color = "#7C3AED", size = 64 }) => {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = ((pct || 0) / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 70 70" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="35" cy="35" r={r} fill="none" stroke="rgba(167, 139, 250, 0.1)" strokeWidth="6" />
      <circle
        cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease-in-out" }}
      />
      <text
        x="35" y="-35"
        textAnchor="middle"
        fontSize="14"
        fontWeight="900"
        fill="#1e293b"
        style={{ transform: 'rotate(90deg)', dominantBaseline: 'middle' }}
      >
        {pct}%
      </text>
    </svg>
  );
};

const MyProjects = () => {
  const auth = useAuth();
  const user = auth ? auth.user : null;
  const navigate = useNavigate();

  /* ── State ── */
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [mentorReqs, setMentorReqs] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery]   = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [tipIdx, setTipIdx]             = useState(0);
  const [projPage, setProjPage]         = useState(1);
  const PROJ_PAGE_SIZE = 9;

  /* ── Data Sync ── */
  const loadAll = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const [projRes, msRes, mrRes, lbRes] = await Promise.allSettled([
        api.get("/projects/my"),
        api.get("/milestones/my"),
        api.get("/mentor-requests/my"),
        api.get("/gamification/leaderboard"),
      ]);
      if (projRes.status === "fulfilled") setProjects(projRes.value.data.projects || []);
      if (msRes.status === "fulfilled") {
        const pmData = msRes.value.data?.projects || [];
        const allMs = pmData.flatMap(pBlock => pBlock.milestones || []);
        setMilestones(allMs);

        // SYNC PROJECT PROGRESS FROM MILESTONE RESPONSE (Source of Truth)
        if (pmData.length > 0) {
          setProjects(prev => {
            const updatedMap = new Map(pmData.map(pb => [pb.projectId || pb.project?._id, pb.project]));
            return (prev || []).map(p => updatedMap.has(p._id) ? updatedMap.get(p._id) : p);
          });
        }
      }
      if (mrRes.status === "fulfilled") setMentorReqs(Array.isArray(mrRes.value.data) ? mrRes.value.data : (mrRes.value.data?.requests || []));
      if (lbRes.status === "fulfilled") setLeaderboard(Array.isArray(lbRes.value.data) ? lbRes.value.data : (lbRes.value.data?.leaderboard || []));
    } catch (e) {
      console.error("Vibrant sync error:", e);
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    const interval = setInterval(() => loadAll(true), 45000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i + 1) % AI_TIPS.length), 8000);
    return () => clearInterval(t);
  }, []);

  /* ── Derived ── */
  const total = projects.length || 0;
  const activeCount = projects.filter(p => ["in_progress", "active", "not_started"].includes((p.status || "").toLowerCase())).length;
  const doneCount = projects.filter(p => ["completed", "done"].includes((p.status || "").toLowerCase())).length;
  const avgProg = total > 0 ? Math.round(projects.reduce((a, p) => a + (p.progress || 0), 0) / total) : 0;
  const msDone = milestones.filter(m => (m.status || "").toLowerCase() === "completed" || m.completed).length;
  const totalMs = milestones.length || 0;
  const milestoneYield = totalMs > 0 ? Math.round((msDone / totalMs) * 100) : 0;
  const productivityScore = Math.round((avgProg * 0.6) + (milestoneYield * 0.4));

  const filteredProjects = useMemo(() => projects.filter(p => {
    const titleMatch = (p.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const status = (p.status || "").toLowerCase();
    return titleMatch && (filterStatus === "all" || status === filterStatus);
  }), [projects, searchQuery, filterStatus]);

  // Pagination derived
  const projTotalPages = Math.max(1, Math.ceil(filteredProjects.length / PROJ_PAGE_SIZE));
  const pagedProjects  = filteredProjects.slice((projPage - 1) * PROJ_PAGE_SIZE, projPage * PROJ_PAGE_SIZE);

  // Reset page when filter/search changes
  useEffect(() => { setProjPage(1); }, [searchQuery, filterStatus]);

  const tip = AI_TIPS[tipIdx];

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  if (loading) return (
    <div className="vp-loader">
      <div className="vp-spin" />
      <span>Initializing Research Environment...</span>
    </div>
  );

  return (
    <div className="vp-root">
      {/* ── SECTION 1: VIBRANT BOXED HEADER ── */}
      <div className="vp-header-wrapper">
        <div className="vp-header-box">
          <div className="vp-header-grid">
            <div className="vp-hero-left">
              <div className="vp-welcome-msg">
                <span className="vp-time-greet">{timeGreeting},</span>
                <h1 className="vp-user-name">
                  {user?.name || "Student"}
                </h1>
                
                <div className="vp-academic-identity">
                  <div className="vp-id-badge">
                    <span className="label">REGISTRATION NO</span>
                    <span className="value">{user?.registrationNumber || "N/A"}</span>
                  </div>
                  <div className="vp-id-badge">
                    <span className="label">SEMESTER</span>
                    <span className="value">{user?.semester ? `Semester ${user.semester}` : "N/A"}</span>
                  </div>
                  <div className="vp-id-badge">
                    <span className="label">DEPARTMENT</span>
                    <span className="value">{user?.department || "N/A"}</span>
                  </div>
                </div>
              </div>
              
              <div className="vp-hero-content-inner">
                <div className="vp-hero-badge"><Zap size={14} /> AcadX Institutional Node</div>
                <h1 className="vp-hero-h1">
                  Standardize your <br />
                  <span className="vp-hero-name">Academic Excellence.</span>
                </h1>
                <div className="vp-hero-btns">
                  <Link to="/student/create-project" className="vp-btn-vibrant">
                    <Plus size={18} /> Initiate New Track
                  </Link>
                  <div className="vp-btn-outline">
                    View Repository <ArrowUpRight size={16} />
                  </div>
                </div>
              </div>
            </div>

            <div className="vp-hero-right">
              <div className="vp-viz-card">
                <div className="vp-viz-hd">
                  <MapIcon size={24} color="var(--brand)" />
                  <span className="vp-live-tag">LIVE REGISTRY</span>
                </div>
                <div className="vp-viz-body">
                  <div className="vp-kpi-row">
                    <span className="vp-kpi-lbl">Current Focus</span>
                    <h4 className="vp-kpi-val">Data Validation IV</h4>
                  </div>
                  <div className="vp-viz-bars">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="vp-viz-bar-rail">
                        <div className="vp-viz-bar-fill" style={{ width: `${60 - i * 10}%`, background: i === 1 ? 'var(--brand)' : 'var(--p)' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="vp-stats-grid">
            {[
              { icon: <Layout size={20} />, label: "Managed Projects", val: total, color: "#4F46E5" },
              { icon: <Activity size={20} />, label: "Active Tracks", val: activeCount, color: "#DB2777" },
              { icon: <CheckCircle size={20} />, label: "Completed", val: doneCount, color: "#10B981" },
              { icon: <Target size={20} />, label: "Global Impact", val: msDone, color: "#F59E0B" },
            ].map((s, i) => (
              <div key={i} className="vp-stat-tile" style={{ "--item-color": s.color }}>
                <div className="vp-stat-ico">{s.icon}</div>
                <div className="vp-stat-content">
                  <span className="vp-stat-val">{s.val}</span>
                  <span className="vp-stat-lbl">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="vp-container">
        {/* ── SECTION 2: ACTIONS BAR ── */}
        <div className="vp-actions-bar">
          <Link to="/student/create-project" className="vp-action-card">
            <div className="vp-action-ico"><Plus size={22} /></div>
            <span>New Track</span>
          </Link>
          <Link to="/student/requests" className="vp-action-card">
            <div className="vp-action-ico"><Users size={22} /></div>
            <span>Expert Help</span>
          </Link>
          <Link to="/milestones" className="vp-action-card">
            <div className="vp-action-ico"><TrendingUp size={22} /></div>
            <span>Analytics</span>
          </Link>
          <Link to="/portfolio" className="vp-action-card">
            <div className="vp-action-ico"><Trophy size={22} /></div>
            <span>Portfolio</span>
          </Link>
          <Link to="/student/request-mentor" className="vp-action-card">
            <div className="vp-action-ico"><Users size={22} /></div>
            <span>Request Mentor</span>
          </Link>
        </div>

        {/* ── SECTION 3: ANALYTICS & INSIGHT BOXES ── */}
        <div className="vp-insights-row">
          {/* Overview */}
          <div className="vp-card vp-analytics-card">
            <div className="vp-card-hd">
              <div className="vp-card-ico"><BarChart2 size={18} /></div>
              <div>
                <h3>Impact Analysis</h3>
                <p>Academic productivity record</p>
              </div>
            </div>
            <div className="vp-analytics-body">
              <div className="vp-donut">
                <CircularProgress pct={productivityScore} color="var(--brand)" />
                <span className="vp-donut-label">SCORE</span>
              </div>
              <div className="vp-impact-stats">
                <div className="vp-impact-item">
                  <div className="vp-impact-info">
                    <span className="lbl">Milestone Yield</span>
                    <span className="val">{milestoneYield}%</span>
                  </div>
                  <div className="vp-impact-bar"><div className="fill" style={{ width: `${milestoneYield}%`, background: '#10B981' }} /></div>
                </div>
                <div className="vp-impact-item">
                  <div className="vp-impact-info">
                    <span className="lbl">Avg. Project Progress</span>
                    <span className="val">{avgProg}%</span>
                  </div>
                  <div className="vp-impact-bar"><div className="fill" style={{ width: `${avgProg}%`, background: '#4F46E5' }} /></div>
                </div>
                <div className="vp-impact-item">
                  <div className="vp-impact-info">
                    <span className="lbl">Experts Consulted</span>
                    <span className="val">{mentorReqs.filter(r => r.status === 'APPROVED').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Tip */}
          <div className="vp-card vp-ai-card">
            <div className="vp-card-hd">
              <div className="vp-card-ico vp-ico-purple"><Sparkles size={18} /></div>
              <div>
                <h3>Infrastructure Tip</h3>
                <p>Powered by AcadX AI</p>
              </div>
              <span className="vp-tag-live">STABLE</span>
            </div>
            <div className="vp-ai-tip">
              <div className="vp-tip-icon">{tip.icon}</div>
              <div className="vp-tip-text">
                <h4>{tip.title}</h4>
                <p>{tip.body}</p>
              </div>
            </div>
            <div className="vp-tip-nav">
              {AI_TIPS.map((_, idx) => (
                <button key={idx} className={`vp-dot ${idx === tipIdx ? "active" : ""}`} onClick={() => setTipIdx(idx)} />
              ))}
              <button className="vp-sync-btn" onClick={() => setTipIdx(i => (i + 1) % AI_TIPS.length)}>
                <RefreshCw size={12} /> Sync Registry
              </button>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="vp-card vp-lb-card">
            <div className="vp-card-hd">
              <div className="vp-card-ico vp-ico-amber"><Trophy size={18} /></div>
              <div>
                <h3>Institutional Rank</h3>
                <p>Top performance metrics</p>
              </div>
            </div>
            <div className="vp-lb-list">
              {leaderboard.slice(0, 3).map((u, i) => (
                <div key={i} className={`vp-lb-row ${u.name === user?.name ? "me" : ""}`}>
                  <span className="vp-lb-rank">#{i + 1}</span>
                  <span className="vp-lb-name">{u.name || "Academic Member"}</span>
                  <span className="vp-lb-pts">{u.points || 0} pts</span>
                </div>
              ))}
              {leaderboard.length === 0 && <p className="vp-empty-txt">Scanning registry...</p>}
            </div>
          </div>
        </div>

        {/* ── SECTION 4: REFINED INVENTORY ── */}
        <section className="vp-inventory-section">
          <div className="vp-inv-hd">
            <div className="vp-inv-ttl">
              <h2>Operational Inventory</h2>
              <p>Institutional record of your active research tracks</p>
            </div>
            <div className="vp-inv-controls">
              <div className="vp-search-box">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Filter by title..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="vp-filter-box">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">Global Status</option>
                  <option value="active">In Progress</option>
                  <option value="completed">Verified</option>
                </select>
              </div>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="vp-empty-box-best">
              <div className="vp-empty-ico-frame">
                <FolderOpen size={64} className="vp-empty-ico-vibrant" />
              </div>
              <h3>No entities found</h3>
              <p>Initiate your first research track to begin academic monitoring.</p>
              <Link to="/student/create-project" className="vp-btn-create-best">
                <Plus size={20} /> Create Entity
              </Link>
            </div>
          ) : (
            <>
              {/* Results label */}
              <div className="vp-results-info">
                Showing <strong>{(projPage - 1) * PROJ_PAGE_SIZE + 1}–{Math.min(projPage * PROJ_PAGE_SIZE, filteredProjects.length)}</strong> of <strong>{filteredProjects.length}</strong> projects
              </div>

              <div className="vp-project-grid">
                {pagedProjects.map(p => {
                  const s = (p.status || "pending").toLowerCase();
                  const cfg = s === "completed" ? STATUS_CFG.completed : s === "active" ? STATUS_CFG.active : STATUS_CFG.pending;

                  return (
                    <div key={p._id} className="vp-proj-card">
                      <div className="vp-proj-accent" style={{ color: cfg.bar }} />
                      <div className="vp-proj-hd">
                        <span className={`vp-status-pill ${cfg.cls}`}>{cfg.label}</span>
                        <span className="vp-proj-id">ID-{p._id.slice(-6).toUpperCase()}</span>
                      </div>

                      {/* ─ Mentor request status badge ─ */}
                      {(() => {
                        const mr = getLatestMentorStatus(mentorReqs, p._id);
                        const mc = mr ? MENTOR_STATUS_CFG[mr.status] : null;
                        if (!mc) return null;
                        return (
                          <div
                            className="vp-mentor-status-badge"
                            style={{ background: mc.bg, color: mc.color, borderColor: mc.border }}
                          >
                            {mc.icon} {mc.label}
                          </div>
                        );
                      })()}

                      <div className="vp-proj-body">
                        <h3>{p.title}</h3>
                        <p>{p.description || "No research abstract available for this entity."}</p>
                      </div>
                      <div className="vp-proj-prog">
                        <div className="vp-prog-info">
                          <span>Validation Progress</span>
                          <span>{p.progress || 0}%</span>
                        </div>
                        <div className="vp-prog-track">
                          <div className="vp-prog-fill" style={{ width: `${p.progress || 0}%`, background: cfg.bar }} />
                        </div>
                      </div>
                      <div className="vp-proj-foot">
                        <button className="vp-btn-details" onClick={() => navigate(`/student/project/${p._id}`)}>
                          Enterprise View <ArrowRight size={14} />
                        </button>
                        <Link to={`/student/request-mentor?projectId=${p._id}`} className="vp-btn-mentor-outline" title="Consult Expert">
                          <Users size={16} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {projTotalPages > 1 && (
                <div className="vp-pagination">
                  <button
                    className="vp-page-btn"
                    onClick={() => setProjPage(p => Math.max(1, p - 1))}
                    disabled={projPage === 1}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <div className="vp-page-numbers">
                    {Array.from({ length: projTotalPages }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        className={`vp-page-num ${n === projPage ? "active" : ""}`}
                        onClick={() => setProjPage(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <button
                    className="vp-page-btn"
                    onClick={() => setProjPage(p => Math.min(projTotalPages, p + 1))}
                    disabled={projPage === projTotalPages}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
      <div className="vp-bottom-spacer" />
    </div>
  );
};

export default MyProjects;
