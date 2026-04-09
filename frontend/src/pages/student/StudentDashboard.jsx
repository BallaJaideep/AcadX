// import React, { useEffect, useState, useMemo } from "react";
// import api from "../../api/client";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import {
//   Plus, Activity, CheckCircle, Users, Trophy,
//   MessageSquare, Award, Target, Calendar,
//   BarChart2, Brain, Sparkles, RefreshCw,
//   Check, Bell, ThumbsUp, Rocket, Search,
//   TrendingUp, Zap, Lightbulb, ChevronRight,
//   Clock, History, Layout, Settings
// } from "lucide-react";
// import "./StudentDashboard.css";

// /* ── AI Tips pool ──────────────────────────────────────────── */
// const AI_TIPS = [
//   { icon: <Lightbulb size={24} color="#D97706" />, title: "Break milestones into tasks", body: "Large milestones are easier to complete when split into 2-3 daily tasks." },
//   { icon: <Calendar size={24} color="#6366F1" />, title: "Review weekly goals every Monday", body: "Consistent weekly planning improves project completion rates by 40%." },
//   { icon: <Users size={24} color="#059669" />, title: "Communicate with your mentor", body: "Regular mentor updates help you get feedback before issues block you." },
//   { icon: <Trophy size={24} color="#FACC15" />, title: "Earn gamification points", body: "Completing milestones on time earns you leaderboard points that boost your profile." },
// ];

// /* ── Mini Bar Chart ────────────────────────────────────────── */
// const MiniBarChart = ({ data }) => {
//   const max = Math.max(...data.map(d => d.value), 1);
//   return (
//     <div className="mini-chart">
//       {data.map((d, i) => (
//         <div key={i} className="mini-bar-col">
//           <div className="mini-bar-fill-wrap">
//             <div className="mini-bar-fill" style={{
//               height: `${Math.max((d.value / max) * 100, 10)}%`,
//               background: d.color || "#6366F1"
//             }} />
//           </div>
//           <div className="mini-bar-label">{d.label}</div>
//         </div>
//       ))}
//     </div>
//   );
// };

// /* ── Circular Progress ─────────────────────────────────────── */
// const CircularProgress = ({ pct, color = "#6366F1", size = 80 }) => {
//   const r = 30; const circ = 2 * Math.PI * r;
//   const dash = ((pct || 0) / 100) * circ;
//   return (
//     <svg width={size} height={size} viewBox="0 0 70 70">
//       <circle cx="35" cy="35" r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
//       <circle cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="7"
//         strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ / 4}
//         strokeLinecap="round" style={{ transition: "stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
//       />
//       <text x="35" y="40" textAnchor="middle" fontSize="12" fontWeight="900" fill={color}>{pct}%</text>
//     </svg>
//   );
// };

// const StudentDashboard = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   /* ── State ── */
//   const [projects, setProjects] = useState([]);
//   const [milestones, setMilestones] = useState([]);
//   const [mentorReqs, setMentorReqs] = useState([]);
//   const [leaderboard, setLeaderboard] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [tipIdx, setTipIdx] = useState(0);
//   const [aiLoading, setAiLoading] = useState(false);
//   const [lastSync, setLastSync] = useState(new Date());

//   /* ── Load all data ── */
//   const loadAll = async (quiet = false) => {
//     if (!quiet) setLoading(true);
//     try {
//       const [projRes, msRes, mrRes, lbRes] = await Promise.allSettled([
//         api.get("/projects/my"),
//         api.get("/milestones/my"),
//         api.get("/mentor-requests/my"),
//         api.get("/gamification/leaderboard"),
//       ]);
//       if (projRes.status === "fulfilled") setProjects(projRes.value.data.projects || []);
//       if (msRes.status === "fulfilled") setMilestones(Array.isArray(msRes.value.data) ? msRes.value.data : []);
//       if (mrRes.status === "fulfilled") setMentorReqs(Array.isArray(mrRes.value.data) ? mrRes.value.data : (mrRes.value.data?.requests || []));
//       if (lbRes.status === "fulfilled") setLeaderboard(Array.isArray(lbRes.value.data) ? lbRes.value.data : (lbRes.value.data?.leaderboard || []));
//       setLastSync(new Date());
//     } catch (e) {
//       console.error(e);
//     } finally {
//       if (!quiet) setLoading(false);
//     }
//   };

//   useEffect(() => { 
//     loadAll();
//     // Real-time polling every 30 seconds
//     const interval = setInterval(() => loadAll(true), 30000);
//     return () => clearInterval(interval);
//   }, []);

//   /* ── Rotate AI tips ── */
//   useEffect(() => {
//     const t = setInterval(() => setTipIdx(i => (i + 1) % AI_TIPS.length), 8000);
//     return () => clearInterval(t);
//   }, []);

//   const nextTip = () => {
//     setAiLoading(true);
//     setTimeout(() => { setTipIdx(i => (i + 1) % AI_TIPS.length); setAiLoading(false); }, 400);
//   };

//   /* ── Derived stats ── */
//   const hour = new Date().getHours();
//   const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
//   const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

//   const total = projects.length;
//   const active = projects.filter(p => ["in_progress", "active", "draft", "not_started"].includes((p.status || p.derivedStatus || "").toLowerCase())).length;
//   const done = projects.filter(p => ["completed", "done"].includes((p.status || p.derivedStatus || "").toLowerCase())).length;
//   const avgProg = total > 0 ? Math.round(projects.reduce((a, p) => a + (p.progress || 0), 0) / total) : 0;

//   const msTotal = milestones.length;
//   const msDone = milestones.filter(m => (m.status || "").toLowerCase() === "completed" || m.completed).length;

//   const myRank = leaderboard.findIndex(u => u._id === user?._id || u.name === user?.name);
//   const myPoints = leaderboard[myRank]?.points || user?.points || 0;
  
//   const activityItems = useMemo(() => {
//     // Simulated real-time activity based on current project states
//     const items = projects.slice(0, 3).map(p => ({
//       icon: <Rocket size={16} />,
//       text: `Project "${p.title}" is at ${p.progress}% progress.`,
//       time: "Updated recently"
//     }));
//     if (milestones.length > 0) {
//       items.push({
//         icon: <Target size={16} />,
//         text: `Milestone tracking active for ${milestones.length} tasks.`,
//         time: "Real-time sync"
//       });
//     }
//     return items;
//   }, [projects, milestones]);

//   const tip = AI_TIPS[tipIdx];

//   const quickLinks = [
//     { to: "/student/create-project", icon: <Plus size={18} />, label: "Launch New", sub: "Start Project", color: "#6366F1", bg: "#EEF2FF" },
//     { to: "/student/projects", icon: <Layout size={18} />, label: "Inventory", sub: "All Projects", color: "#F43F5E", bg: "#FFF1F2" },
//     { to: "/milestones", icon: <Target size={18} />, label: "Roadmap", sub: "Milestones", color: "#8B5CF6", bg: "#F5F3FF" },
//     { to: "/portfolio", icon: <Award size={18} />, label: "Showcase", sub: "My Portfolio", color: "#10B981", bg: "#ECFDF5" },
//     { to: "/student/requests", icon: <Users size={18} />, label: "Mentors", sub: "Support", color: "#F59E0B", bg: "#FFFBEB" },
//   ];

//   if (loading) return (
//     <div className="sp-loader">
//       <div className="sp-spinner" />
//       <p>Syncing Academic Data...</p>
//     </div>
//   );

//   return (
//     <div className="sp-page fade-in">
//       {/* HEADER WITH REAL-TIME INDICATOR */}
//       <section className="sp-dashboard-header">
//         <div className="sp-header-left">
//           <div className="sp-live-badge"><div className="sp-live-dot" /> Live System</div>
//           <p className="sp-last-sync">Last updated: {lastSync.toLocaleTimeString()}</p>
//         </div>
//         <button onClick={() => navigate("/student/create-project")} className="sp-create-project-btn">
//           <Plus size={20} /> Create New Project
//         </button>
//       </section>

//       {/* HERO SECTION */}
//       <section className="sp-hero-pro">
//         <div className="sp-hero-mesh-loop" />
//         <div className="sp-hero-content-pro">
//           <div className="sp-eyebrow-pro"><Zap size={14} /> Academic Workspace v2.0</div>
//           <h1 className="sp-greeting-pro">
//             {greeting},<br />
//             <span className="sp-name-pro">{user?.name || "Student"}</span>
//           </h1>
//           <p className="sp-hero-sub-pro">
//             Your high-performance workspace for academic results. Track, analyze, and build your future.
//           </p>
//           <div className="sp-hero-actions-pro">
//             <Link to="/student/projects" className="sp-btn-pro sp-btn-gradient">View My Portfolio</Link>
//             <Link to="/milestones" className="sp-btn-pro sp-btn-outline">Track Roadmaps</Link>
//           </div>
//         </div>

//         <div className="sp-hero-visual-pro">
//           <div className="sp-orbital-container">
//             <div className="sp-orbital-core">
//               <Sparkles size={60} color="#fff" strokeWidth={1.5} />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* STATS TILES */}
//       <div className="sp-stats-grid">
//         {[
//           { label: "Total Load", value: total, sub: "Projects", icon: <Zap size={20} />, bg: "#EEF2FF", color: "#6366F1" },
//           { label: "In Flight", value: active, sub: "Active", icon: <TrendingUp size={20} />, bg: "#FFF1F2", color: "#F43F5E" },
//           { label: "Achieved", value: done, sub: "Success", icon: <CheckCircle size={20} />, bg: "#ECFDF5", color: "#10B981" },
//           { label: "Efficiency", value: `${avgProg}%`, sub: "Avg Rank", icon: <Activity size={20} />, bg: "#F5F3FF", color: "#8B5CF6" },
//           { label: "Execution", value: msDone, sub: "Milestones", icon: <Target size={20} />, bg: "#F0F9FF", color: "#0EA5E9" },
//           { label: "Network", value: mentorReqs.length, sub: "Mentors", icon: <Users size={20} />, bg: "#FFFBEB", color: "#F59E0B" },
//         ].map(s => (
//           <div key={s.label} className="sp-stat-card">
//             <div className="sp-stat-top">
//               <div className="sp-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
//             </div>
//             <div className="sp-stat-num">{s.value}</div>
//             <div className="sp-stat-label">{s.label}</div>
//           </div>
//         ))}
//       </div>

//       <div className="sp-dashboard-layout">
//         {/* MAIN AREA: CONTENT TILES */}
//         <div className="sp-dashboard-main">
//           {/* ANALYTICS + QUICK ACTIONS ROW */}
//           <div className="sp-analytics-row">
//             {/* Project Analytics */}
//             <div className="sp-analytics-card">
//               <div className="sp-card-header">
//                 <div>
//                   <h3 className="sp-card-h3">Academic Performance</h3>
//                   <p className="sp-card-hsub">Real-time status analysis</p>
//                 </div>
//               </div>
//               <div className="sp-analytics-body">
//                 <div className="sp-ring-section">
//                   <CircularProgress pct={avgProg} color="#6366F1" size={96} />
//                 </div>
//                 <div className="sp-bar-section">
//                   <div className="sp-bar-section-label">Top Performance</div>
//                   {total > 0 ? (
//                     <MiniBarChart data={projects.slice(0, 4).map(p => ({ label: p.title.slice(0, 6), value: p.progress, color: "#6366F1" }))} />
//                   ) : <div className="sp-chart-empty">No active projects</div>}
//                 </div>
//               </div>
//             </div>

//             {/* AI Assistant */}
//             <div className="sp-ai-card">
//               <div className="sp-card-header">
//                 <div>
//                   <h3 className="sp-card-h3">Smart Advisor</h3>
//                   <p className="sp-card-hsub">AI Recommended Actions</p>
//                 </div>
//               </div>
//               <div className={`sp-ai-tip-card ${aiLoading ? "sp-ai-loading" : ""}`}>
//                 <div className="sp-ai-tip-icon">{tip.icon}</div>
//                 <div className="sp-ai-tip-content">
//                   <div className="sp-ai-tip-title">{tip.title}</div>
//                   <div className="sp-ai-tip-body">{tip.body}</div>
//                 </div>
//               </div>
//               <div className="sp-ai-actions">
//                 <button className="sp-ai-refresh-btn" onClick={nextTip}><RefreshCw size={13} /> Refresh Advice</button>
//               </div>
//             </div>
//           </div>

//           <section className="sp-quick-section" style={{marginTop: 32}}>
//              <div className="sp-qa-grid" style={{gridTemplateColumns: "repeat(5, 1fr)"}}>
//                {quickLinks.map(ql => (
//                  <Link key={ql.to} to={ql.to} className="sp-qa-card">
//                    <div className="sp-qa-icon" style={{ background: ql.bg, color: ql.color }}>{ql.icon}</div>
//                    <div className="sp-qa-text">
//                      <span className="sp-qa-label">{ql.label}</span>
//                    </div>
//                    <ChevronRight size={14} color={ql.color} />
//                  </Link>
//                ))}
//              </div>
//           </section>
//         </div>

//         {/* SIDEBAR AREA: ACTIVITY + LEADERBOARD */}
//         <div className="sp-dashboard-sidebar">
//           {/* Real-time Activity */}
//           <div className="sp-lb-card sp-activity-card">
//             <div className="sp-card-header">
//               <h3 className="sp-card-h3"><History size={18} /> System Activity</h3>
//             </div>
//             <div className="sp-activity-list">
//               {activityItems.map((item, i) => (
//                 <div key={i} className="sp-activity-item">
//                   <div className="sp-activity-icon">{item.icon}</div>
//                   <div className="sp-activity-info">
//                     <span className="sp-activity-text">{item.text}</span>
//                     <span className="sp-activity-time">{item.time}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Mini Leaderboard */}
//           <div className="sp-lb-card" style={{marginTop: 24}}>
//             <div className="sp-card-header">
//               <h3 className="sp-card-h3"><Trophy size={18} /> Top Performers</h3>
//             </div>
//             <div className="sp-lb-list">
//               {leaderboard.slice(0, 4).map((u, i) => (
//                 <div key={u._id || i} className={`sp-lb-row ${u.name === user?.name ? "sp-lb-me" : ""}`}>
//                   <span className="sp-lb-rank-badge">#{i + 1}</span>
//                   <span className="sp-lb-name">{u.name || "Anonymous"}</span>
//                   <span className="sp-lb-pts">{u.points || 0}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StudentDashboard;




import React, { useEffect, useState, useMemo } from "react";
import api from "../../api/client";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Plus, Activity, CheckCircle, Users, Trophy,
  MessageSquare, Award, Target, Calendar,
  BarChart2, Brain, Sparkles, RefreshCw,
  Check, Bell, ThumbsUp, Rocket, Search,
  TrendingUp, Zap, Lightbulb, ChevronRight,
  Clock, History, Layout, Settings, Star, ShieldCheck,
  XCircle, AlertTriangle, RotateCcw
} from "lucide-react";
import "./StudentDashboard.css";

/* ── AI Tips pool ──────────────────────────────────────────── */
const AI_TIPS = [
  { icon: <Lightbulb size={24} color="#D97706" />, title: "Break milestones into tasks", body: "Large milestones are easier to complete when split into 2-3 daily tasks." },
  { icon: <Calendar size={24} color="#6366F1" />, title: "Review weekly goals every Monday", body: "Consistent weekly planning improves project completion rates by 40%." },
  { icon: <Users size={24} color="#059669" />, title: "Communicate with your mentor", body: "Regular mentor updates help you get feedback before issues block you." },
  { icon: <Trophy size={24} color="#FACC15" />, title: "Earn gamification points", body: "Completing milestones on time earns you leaderboard points that boost your profile." },
];

/* ── Mini Bar Chart ────────────────────────────────────────── */
const MiniBarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="mini-chart">
      {data.map((d, i) => (
        <div key={i} className="mini-bar-col">
          <div className="mini-bar-fill-wrap">
            <div className="mini-bar-fill" style={{
              height: `${Math.max((d.value / max) * 100, 10)}%`,
              background: d.color || "#6366F1"
            }} />
          </div>
          <div className="mini-bar-label">{d.label}</div>
        </div>
      ))}
    </div>
  );
};

/* ── Circular Progress ─────────────────────────────────────── */
const CircularProgress = ({ pct, color = "#6366F1", size = 80 }) => {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = ((pct || 0) / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 70 70">
      <circle cx="35" cy="35" r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
      <circle
        cx="35" cy="35" r={r}
        fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
      />
      <text x="35" y="40" textAnchor="middle" fontSize="12" fontWeight="900" fill={color}>{pct}%</text>
    </svg>
  );
};

/* ── Stat Card ─────────────────────────────────────────────── */
const StatCard = ({ label, value, icon, bg, color }) => (
  <div className="sp-stat-card">
    <div className="sp-stat-top">
      <div className="sp-stat-icon" style={{ background: bg, color }}>{icon}</div>
    </div>
    <div className="sp-stat-num">{value}</div>
    <div className="sp-stat-label">{label}</div>
  </div>
);

/* ── Mentor request status badge config ────────────────────── */
const MENTOR_STATUS_CFG = {
  APPROVED:          { label: "Mentor Approved",   icon: <CheckCircle size={12} />, bg: "rgba(16,185,129,0.1)",  color: "#065f46", border: "rgba(16,185,129,0.25)" },
  PENDING:           { label: "Mentor Pending",    icon: <Clock size={12} />,       bg: "rgba(99,102,241,0.1)", color: "#3730a3", border: "rgba(99,102,241,0.2)"  },
  REJECTED:          { label: "Request Rejected",  icon: <XCircle size={12} />,     bg: "rgba(239,68,68,0.1)",  color: "#991b1b", border: "rgba(239,68,68,0.2)"   },
  REJECTED_RECREATE: { label: "Revision Required", icon: <RotateCcw size={12} />,   bg: "rgba(245,158,11,0.1)", color: "#92400e", border: "rgba(245,158,11,0.3)"  },
};

const getLatestMentorStatus = (mentorReqs, projectId) => {
  const matches = mentorReqs
    .filter(r => (r.projectId?._id || r.projectId) === projectId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return matches[0] || null;
};

/* ================================================================
   MAIN COMPONENT
================================================================ */
const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  /* ── State ── */
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [mentorReqs, setMentorReqs] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipIdx, setTipIdx] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());

  /* ── Load all data ── */
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
        // Flatten all milestones from all projects into a single array for stats/activity
        const allMs = pmData.flatMap(pBlock => pBlock.milestones || []);
        setMilestones(allMs);

        // Sync project statuses from the milestone response (source of truth for progress)
        if (pmData.length > 0) {
          setProjects(prev => {
            const updatedMap = new Map(pmData.map(pBlock => [pBlock.projectId, pBlock.project]));
            return (prev || []).map(p => updatedMap.has(p._id) ? updatedMap.get(p._id) : p);
          });
        }
      }
      if (mrRes.status === "fulfilled") setMentorReqs(Array.isArray(mrRes.value.data) ? mrRes.value.data : (mrRes.value.data?.requests || []));
      if (lbRes.status === "fulfilled") setLeaderboard(Array.isArray(lbRes.value.data) ? lbRes.value.data : (lbRes.value.data?.leaderboard || []));
      setLastSync(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    const interval = setInterval(() => loadAll(true), 30000);
    return () => clearInterval(interval);
  }, []);

  /* ── Rotate AI tips ── */
  useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i + 1) % AI_TIPS.length), 8000);
    return () => clearInterval(t);
  }, []);

  const nextTip = () => {
    setAiLoading(true);
    setTimeout(() => { setTipIdx(i => (i + 1) % AI_TIPS.length); setAiLoading(false); }, 400);
  };

  /* ── Derived stats ── */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const total    = projects.length;
  const active   = projects.filter(p => ["in_progress", "active", "draft", "not_started"].includes((p.status || p.derivedStatus || "").toLowerCase())).length;
  const done     = projects.filter(p => ["completed", "done"].includes((p.status || p.derivedStatus || "").toLowerCase())).length;
  const avgProg  = total > 0 ? Math.round(projects.reduce((a, p) => a + (p.progress || 0), 0) / total) : 0;
  const msDone   = milestones.filter(m => (m.status || "").toLowerCase() === "completed" || m.completed).length;
  const myRank   = leaderboard.findIndex(u => u._id === user?._id || u.name === user?.name);
  const myPoints = leaderboard[myRank]?.points || user?.points || 0;

  const activityItems = useMemo(() => {
    const items = projects.slice(0, 3).map(p => ({
      icon: <Rocket size={15} />,
      text: `Project "${p.title}" is at ${p.progress}% progress.`,
      time: "Updated recently",
    }));

    // Add Mentor Request Activities
    mentorReqs.slice(0, 3).forEach(r => {
      const s = (r.status || "PENDING").toUpperCase();
      if (s === "APPROVED") {
        items.unshift({
          status: "APPROVED",
          icon: <CheckCircle size={15} />,
          text: `Expert "${r.requestedFacultyId?.name}" approved your request for "${r.projectId?.title}".`,
          time: "Just now"
        });
      } else if (s === "REJECTED" || s === "REJECTED_RECREATE") {
        items.unshift({
          status: s,
          icon: <XCircle size={15} />,
          text: `${s === "REJECTED_RECREATE" ? "Suggestions" : "Rejection"} received for "${r.projectId?.title}" from ${r.requestedFacultyId?.name || "Faculty"}.`,
          time: "Action required"
        });
      }
    });

    if (milestones.length > 0) {
      items.push({
        status: "MILESTONE",
        icon: <Target size={15} />,
        text: `Milestone tracking active for ${milestones.length} tasks.`,
        time: "Real-time sync",
      });
    }
    return items.slice(0, 5); // Keep it dense
  }, [projects, milestones, mentorReqs]);

  const tip = AI_TIPS[tipIdx];

  // Conditionally include Roadmap only when milestones exist
  const quickLinks = [
    { to: "/student/generate-record", icon: <ShieldCheck size={18} />,  label: "Technical Record",  sub: "Create Industrial Proposal",  color: "#bf953f", bg: "rgba(191,149,63,0.1)" },
    { to: "/student/projects",        icon: <Layout size={18} />,        label: "Inventory",          sub: "All Projects",                color: "#F43F5E", bg: "#FFF1F2" },
    ...(milestones.length > 0 ? [{ to: "/milestones", icon: <Target size={18} />, label: "Roadmap", sub: "Milestones", color: "#8B5CF6", bg: "#F5F3FF" }] : []),
    { to: "/portfolio",               icon: <Award size={18} />,         label: "Showcase",           sub: "My Portfolio",                color: "#10B981", bg: "#ECFDF5" },
    { to: "/student/requests",        icon: <Users size={18} />,         label: "Mentors",            sub: "Request Mentor",              color: "#F59E0B", bg: "#FFFBEB" },
  ];

  // Projects that need mentor re-request (REJECTED_RECREATE) — only those with no subsequent request
  const regeneratedProjects = mentorReqs.filter(r => {
    if (r.status !== "REJECTED_RECREATE") return false;
    // Exclude if there is already a newer request for this project
    const projectId = r.projectId?._id || r.projectId;
    const hasNewer = mentorReqs.some(
      other => other._id !== r._id &&
        (other.projectId?._id || other.projectId) === projectId &&
        new Date(other.createdAt) > new Date(r.createdAt)
    );
    return !hasNewer;
  });

  const stats = [
    { label: "Total Load",  value: total,              icon: <Zap size={20} />,         bg: "#EEF2FF", color: "#6366F1" },
    { label: "In Flight",   value: active,             icon: <TrendingUp size={20} />,  bg: "#FFF1F2", color: "#F43F5E" },
    { label: "Achieved",    value: done,               icon: <CheckCircle size={20} />, bg: "#ECFDF5", color: "#10B981" },
    { label: "Efficiency",  value: `${avgProg}%`,      icon: <Activity size={20} />,    bg: "#F5F3FF", color: "#8B5CF6" },
    { label: "Execution",   value: msDone,             icon: <Target size={20} />,      bg: "#F0F9FF", color: "#0EA5E9" },
    { label: "Network",     value: mentorReqs.length,  icon: <Users size={20} />,       bg: "#FFFBEB", color: "#F59E0B" },
  ];

  /* ── Loader ── */
  if (loading) return (
    <div className="sp-loader">
      <div className="sp-spinner" />
      <p>Syncing Academic Data…</p>
    </div>
  );

  /* ================================================================
     RENDER
  ================================================================ */
  return (
    <div className="sp-page fade-in">

      <header className="sp-institutional-header">
        <div className="sp-header-main" style={{ display: 'flex', gap: '64px', alignItems: 'center' }}>
          <div className="sp-header-avatar-wrap">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.name} className="sp-header-avatar-img" />
            ) : (
              <div className="sp-header-avatar-placeholder">
                {(user?.name || "S")[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="sp-id-card">
            <h1 className="sp-name-massive">{user?.name || "Student"}</h1>
            <div className="sp-academic-badge-row">
              <div className="sp-academic-badge">
                <span className="sp-badge-label">REGISTRATION NO</span>
                <span className="sp-badge-value">{user?.registrationNumber || "N/A"}</span>
              </div>
              <div className="sp-academic-badge">
                <span className="sp-badge-label">SEMESTER</span>
                <span className="sp-badge-value">{user?.semester ? `Semester ${user.semester}` : "N/A"}</span>
              </div>
              <div className="sp-academic-badge">
                <span className="sp-badge-label">DEPARTMENT</span>
                <span className="sp-badge-value">{user?.department || "N/A"}</span>
              </div>
            </div>
          </div>
          
          <div className="sp-header-stats-row">
            <div className="sp-h-stat">
              <span className="sp-h-stat-num">{total}</span>
              <span className="sp-h-stat-label">Projects</span>
            </div>
            <div className="sp-h-stat">
              <span className="sp-h-stat-num">{active}</span>
              <span className="sp-h-stat-label">In Flight</span>
            </div>
            <div className="sp-h-stat">
              <span className="sp-h-stat-num">{avgProg}%</span>
              <span className="sp-h-stat-label">Avg Progress</span>
            </div>
            <div className="sp-h-stat">
              <span className="sp-h-stat-num">#{myRank >= 0 ? myRank + 1 : "—"}</span>
              <span className="sp-h-stat-label">Global Rank</span>
            </div>
          </div>
        </div>

        <div className="sp-header-controls">
           <div className="sp-live-sync-indicator">
              <span>SYSTEM LIVE: {lastSync.toLocaleTimeString()}</span>
           </div>
           <button
             onClick={() => navigate("/student/generate-record")}
             className="sp-premium-office-btn"
           >
             <ShieldCheck size={20} />
             Technical Records Office
           </button>
        </div>
      </header>

      {/* ── STATS GRID ── */}
      <div className="sp-stats-grid">
        {stats.map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="sp-dashboard-layout">

        {/* ── LEFT / MAIN ── */}
        <div className="sp-dashboard-main">

          {/* Analytics + AI row */}
          <div className="sp-analytics-row">

            {/* Academic Performance card */}
            <div className="sp-analytics-card">
              <div className="sp-card-header">
                <div>
                  <h3 className="sp-card-h3">
                    <BarChart2 size={17} color="#6366F1" />
                    Academic Performance
                  </h3>
                  <p className="sp-card-hsub">Real-time status analysis</p>
                </div>
                <span className="sp-card-badge">Live</span>
              </div>
              <div className="sp-analytics-body">
                <div className="sp-ring-section">
                  <CircularProgress pct={avgProg} color="#6366F1" size={96} />
                  <p className="sp-ring-label">Avg Progress</p>
                </div>
                <div className="sp-bar-section">
                  <div className="sp-bar-section-label">Top Projects</div>
                  {total > 0 ? (
                    <MiniBarChart
                      data={projects.slice(0, 4).map(p => ({
                        label: p.title.slice(0, 6),
                        value: p.progress,
                        color: "#6366F1",
                      }))}
                    />
                  ) : (
                    <div className="sp-chart-empty">No active projects yet</div>
                  )}
                </div>
              </div>
            </div>

            {/* Smart Advisor card */}
            <div className="sp-ai-card">
              <div className="sp-card-header">
                <div>
                  <h3 className="sp-card-h3">
                    <Brain size={17} color="#7C3AED" />
                    Smart Advisor
                  </h3>
                  <p className="sp-card-hsub">AI Recommended Actions</p>
                </div>
                <span className="sp-card-badge sp-card-badge-purple">AI</span>
              </div>

              <div className={`sp-ai-tip-card ${aiLoading ? "sp-ai-loading" : ""}`}>
                <div className="sp-ai-tip-icon">{tip.icon}</div>
                <div className="sp-ai-tip-content">
                  <div className="sp-ai-tip-title">{tip.title}</div>
                  <div className="sp-ai-tip-body">{tip.body}</div>
                </div>
              </div>

              {/* Tip dots indicator */}
              <div className="sp-tip-dots">
                {AI_TIPS.map((_, i) => (
                  <button
                    key={i}
                    className={`sp-tip-dot ${i === tipIdx ? "sp-tip-dot-active" : ""}`}
                    onClick={() => setTipIdx(i)}
                  />
                ))}
              </div>

              <div className="sp-ai-actions">
                <button className="sp-ai-refresh-btn" onClick={nextTip}>
                  <RefreshCw size={13} />
                  Refresh Advice
                </button>
              </div>
            </div>
          </div>

          {/* ── QUICK LINKS ── */}
          <section className="sp-quick-section">
            <div className="sp-section-eyebrow">
              <Zap size={12} />
              Quick Navigation
            </div>
            <div className="sp-qa-grid">
              {quickLinks.map(ql => (
                <Link key={ql.to} to={ql.to} className="sp-qa-card">
                  <div className="sp-qa-icon" style={{ background: ql.bg, color: ql.color }}>
                    {ql.icon}
                  </div>
                  <div className="sp-qa-text">
                    <span className="sp-qa-label">{ql.label}</span>
                    <span className="sp-qa-sub">{ql.sub}</span>
                  </div>
                  <ChevronRight size={14} color={ql.color} style={{ flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          </section>

          {/* ── MY PROJECTS STATUS ── */}
          <section className="sp-projects-status-section">
            <div className="sp-section-eyebrow">
              <Layout size={12} /> My Projects
            </div>
            {projects.length === 0 ? (
              <div className="sp-proj-empty">No projects yet. <Link to="/student/create-project" style={{color:"#6366f1",fontWeight:800}}>Create one →</Link></div>
            ) : (
              <div className="sp-proj-status-list">
                {projects.slice(0, 6).map(p => {
                  const mr    = getLatestMentorStatus(mentorReqs, p._id);
                  const mc    = mr ? MENTOR_STATUS_CFG[mr.status] : null;
                  return (
                    <div key={p._id} className="sp-proj-status-row" onClick={() => navigate(`/student/project/${p._id}`)}>
                      <div className="sp-proj-status-left">
                        <div className={`sp-proj-status-dot ${(p.status || "not_started").toLowerCase()}`} />
                        <div>
                          <div className="sp-proj-status-title">{p.title?.length > 36 ? p.title.slice(0,34)+"…" : p.title}</div>
                          <div className="sp-proj-status-meta">
                            {p.domain || "General"} · {p.projectType || "Mini"}
                          </div>
                        </div>
                      </div>
                      {mc ? (
                        <div
                          className="sp-proj-mentor-badge"
                          style={{ background: mc.bg, color: mc.color, borderColor: mc.border }}
                        >
                          {mc.icon} {mc.label}
                        </div>
                      ) : (
                        <div className="sp-proj-mentor-badge sp-no-request">
                          <Users size={11} /> No Request
                        </div>
                      )}
                    </div>
                  );
                })}
                {projects.length > 6 && (
                  <Link to="/student/projects" className="sp-view-all-link">
                    View all {projects.length} projects →
                  </Link>
                )}
              </div>
            )}
          </section>
        </div>

        {/* ── SIDEBAR ── */}
        <div className="sp-dashboard-sidebar">

          {/* System Activity */}
          <div className="sp-lb-card sp-activity-card">
            <div className="sp-card-header">
              <h3 className="sp-card-h3">
                <History size={16} color="#0EA5E9" />
                System Activity
              </h3>
              <span className="sp-card-badge sp-card-badge-sky">Live</span>
            </div>
            <div className="sp-activity-list">
              {activityItems.length > 0 ? activityItems.map((item, i) => (
                <div key={i} className="sp-activity-item" data-status={item.status}>
                  <div className="sp-activity-icon">{item.icon}</div>
                  <div className="sp-activity-info">
                    <span className="sp-activity-text">{item.text}</span>
                    <span className="sp-activity-time">{item.time}</span>
                  </div>
                </div>
              )) : (
                <div className="sp-activity-empty">
                  <Rocket size={22} color="#cbd5e1" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* ── REGENERATED PROJECT ALERTS ── */}
          {regeneratedProjects.length > 0 && (
            <div className="sp-lb-card sp-regen-alert-card" style={{ marginBottom: 20 }}>
              <div className="sp-card-header">
                <h3 className="sp-card-h3">
                  <RotateCcw size={16} color="#f59e0b" />
                  Action Required
                </h3>
                <span className="sp-card-badge" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>⚠ Pending</span>
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 12px 0", lineHeight: 1.5 }}>
                Your project was revised. Now request a mentor to continue.
              </p>
              {regeneratedProjects.map((r, i) => (
                <div key={r._id || i} className="sp-regen-project-item">
                  <div className="sp-regen-project-name">
                    <AlertTriangle size={13} color="#f59e0b" />
                    <span>{r.projectId?.title || "Project"}</span>
                  </div>
                  <button
                    className="sp-regen-mentor-btn"
                    onClick={() => navigate(`/student/request-mentor?projectId=${r.projectId?._id || ""}`)}
                  >
                    <Users size={13} /> Request Mentor
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Leaderboard */}
          <div className="sp-lb-card sp-lb-main">
            <div className="sp-card-header">
              <h3 className="sp-card-h3">
                <Trophy size={16} color="#F59E0B" />
                Top Performers
              </h3>
            </div>

            {/* My rank pill */}
            {myRank >= 0 && (
              <div className="sp-my-rank-pill">
                <Star size={13} />
                You're ranked #{myRank + 1} with {myPoints} pts
              </div>
            )}

            <div className="sp-lb-list">
              {leaderboard.slice(0, 5).map((u, i) => (
                <div
                  key={u._id || i}
                  className={`sp-lb-row ${u.name === user?.name ? "sp-lb-me" : ""}`}
                >
                  <span className={`sp-lb-rank-badge ${i === 0 ? "sp-lb-gold" : i === 1 ? "sp-lb-silver" : i === 2 ? "sp-lb-bronze" : ""}`}>
                    #{i + 1}
                  </span>
                  <span className="sp-lb-name">{u.name || "Anonymous"}</span>
                  <span className="sp-lb-pts">{u.points || 0}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
