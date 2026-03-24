import React, { useEffect, useState } from "react";
import api from "../../api/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./FacultyDashboard.css";
import { 
  Users, 
  Activity, 
  Zap, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Eye,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Command,
  RotateCcw
} from "lucide-react";

const FacultyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [replyText, setReplyText] = useState({});
  const [rejectForm, setRejectForm] = useState({ id: null, reason: "", suggestions: "" });

  const loadAll = async () => {
    try {
      setLoading(true);
      const [reqRes, projRes, compRes] = await Promise.all([
        api.get("/mentor-requests/incoming"),
        api.get("/faculty/project-progress"),
        api.get("/faculty/complaints"),
      ]);
      setRequests(reqRes.data?.requests || []);
      setProjects(projRes.data?.projects || []);
      setComplaints((compRes.data?.complaints || []).filter(c => c.status !== "RESOLVED"));
    } catch (err) {
      console.error("Dashboard sync failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleDecision = async (id, decision, extra = {}) => {
    setActionBusy(true);
    try {
      await api.post(`/mentor-requests/${id}/decision`, { decision, ...extra });
      setRejectForm({ id: null, reason: "", suggestions: "" });
      await loadAll();
    } catch (err) {
      const msg = err.response?.data?.message || "Decision transmission failed.";
      const details = err.response?.data?.details;
      alert(`Error: ${msg}${details ? "\n\nDetails:\n" + details.join("\n") : ""}`);
    } finally {
      setActionBusy(false);
    }
  };

  const resolveComplaint = async (complaintId) => {
    const reply = replyText[complaintId];
    if (!reply?.trim()) return alert("Provide guidance text.");
    setActionBusy(true);
    await api.patch(`/milestones/complaints/${complaintId}/resolve`, { response: reply });
    setReplyText(prev => { const n = {...prev}; delete n[complaintId]; return n; });
    await loadAll();
    setActionBusy(false);
  };

  const openProject = (id) => navigate(`/student/project/${id}`);

  if (loading) return (
    <div className="dashboard-loader">
      <div className="shimmer-text">Synchronizing Faculty Records...</div>
    </div>
  );

  const completedCount = projects.filter(p => p.status === "completed").length;

  return (
    <div className="dashboard-page fade-in">
      {/* COMMAND HEADER */}
      <header className="dashboard-header">
        <div className="header-text">
          <div className="dashboard-tag">
            <Command size={14} /> OFFICIAL FACULTY COMMAND
          </div>
          <h1 className="faculty-name-hero" style={{ fontSize: '48px', fontWeight: '950', marginBottom: '8px' }}>{user?.name}</h1>
          <div className="faculty-meta-strip">
             <span className="fac-meta-item">{user?.department}</span>
             <span className="fac-meta-divider">|</span>
             <span className="fac-meta-item">REG: {user?.registrationNumber || "FAC-ADMIN-001"}</span>
          </div>
        </div>
      </header>

      {/* STATS SECTION */}
      <div className="acadx-stats-row">
        <div className="stat-tile">
          <span className="label-tiny">
            <Users size={14} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Total Managed
          </span>
          <span className="stat-value">{projects.length}</span>
        </div>
        <div className="stat-tile">
          <span className="label-tiny">
            <Activity size={14} style={{ verticalAlign: 'middle', marginRight: 8, color: '#DB2777' }} />
            Active Projects
          </span>
          <span className="stat-value">{projects.length - completedCount}</span>
        </div>
        <div className="stat-tile gold">
          <span className="label-tiny">
            <Zap size={14} style={{ verticalAlign: 'middle', marginRight: 8, color: '#F59E0B' }} />
            Pending Requests
          </span>
          <span className="stat-value">{requests.length}</span>
        </div>
      </div>

      <div className="dashboard-main-grid">
        
        {/* LEFT COMPONENT: ACTION QUEUE */}
        <div className="dashboard-sidebar">
          <section className="dashboard-section">
            <h3 className="section-label">
              <Zap size={20} style={{ color: '#F59E0B' }} /> Incoming Mentorships
            </h3>
            {requests.length === 0 ? <p className="empty-label">No pending requests.</p> : 
              requests.map(req => (
                <div key={req._id} className="request-card">
                  <span className="label-tiny">Project Proposal</span>
                  <h4 className="mini-title">{req.projectId?.title}</h4>
                  <p className="mini-meta">{req.studentId?.name}</p>
                  
                  {rejectForm.id === req._id ? (
                    <div className="reject-recreate-panel">
                      <textarea 
                        className="acadx-input-mini" 
                        placeholder="Reason for rejection..."
                        value={rejectForm.reason}
                        onChange={(e) => setRejectForm(f => ({...f, reason: e.target.value}))}
                      />
                      <textarea 
                        className="acadx-input-mini" 
                        placeholder="Suggestions for student..."
                        value={rejectForm.suggestions}
                        onChange={(e) => setRejectForm(f => ({...f, suggestions: e.target.value}))}
                      />
                      <div className="mini-actions">
                        <button disabled={actionBusy} className="acadx-btn-small orange" onClick={() => handleDecision(req._id, "REJECT_AND_RECREATE", { reason: rejectForm.reason, suggestions: rejectForm.suggestions })}>
                          Confirm & Send
                        </button>
                        <button className="acadx-btn-small ghost" onClick={() => setRejectForm({ id: null, reason: "", suggestions: "" })}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="mini-actions">
                      <button disabled={actionBusy} className="acadx-btn-small green" onClick={() => handleDecision(req._id, "APPROVE")}>
                        <CheckCircle2 size={14} /> Approve
                      </button>
                      <button disabled={actionBusy} className="acadx-btn-small red" onClick={() => handleDecision(req._id, "REJECT")}>
                        <XCircle size={14} /> Decline
                      </button>
                      <button disabled={actionBusy} className="acadx-btn-small orange" onClick={() => setRejectForm({ id: req._id, reason: "", suggestions: "" })}>
                        <RotateCcw size={14} /> Reject & Recreate
                      </button>
                      <button className="acadx-btn-small ghost" onClick={() => openProject(req.projectId._id)}>
                        <Eye size={14} /> Review
                      </button>
                    </div>
                  )}
                </div>
              ))
            }
          </section>

          <section className="dashboard-section">
            <h3 className="section-label">
              <ShieldAlert size={20} style={{ color: '#F97316' }} /> Urgent Guidance
            </h3>
            {complaints.length === 0 ? <p className="empty-label">No active guidance requests.</p> :
              complaints.map(c => (
                <div key={c._id} className="warning-card">
                  <h4 className="mini-title">{c.projectId?.title}</h4>
                  <p className="mini-issue">"{c.reason}"</p>
                  
                  {/* AI SUGGESTIONS REPLICA (So faculty sees what AI tried) */}
                  {c.aiSuggestions?.length > 0 && (
                    <div className="mini-ai-snapshot">
                      <span className="label-tiny">AI ATTEMPTED GUIDANCE:</span>
                      <div className="mini-link-row">
                        {c.aiSuggestions.map((s, idx) => (
                          <div key={idx} className="mini-tag">
                            {s.title}: {s.links?.length} items
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <textarea 
                    className="acadx-input-mini" 
                    placeholder="Provide professional resolution text..."
                    value={replyText[c._id] || ""}
                    onChange={(e) => setReplyText(p => ({...p, [c._id]: e.target.value}))}
                  />
                  <button disabled={actionBusy} className="acadx-btn-small blue full-width" onClick={() => resolveComplaint(c._id)}>
                    <MessageSquare size={14} style={{ marginRight: 8 }} /> RESOLVE ISSUE
                  </button>
                </div>
              ))
            }
          </section>
        </div>

        {/* RIGHT COMPONENT: PROGRESS MONITOR */}
        <div className="dashboard-content">
          <section className="dashboard-section">
            <h3 className="section-label">
              <TrendingUp size={20} style={{ color: '#7C3AED' }} /> Student Progression Feed
            </h3>
            <div className="progress-list">
              {projects.length === 0 ? <p className="empty-label">No managed projects yet.</p> :
                projects.map(p => (
                  <div key={p.projectId} className="progress-row-card">
                    <div className="row-info">
                      <h4 className="row-title">{p.projectTitle}</h4>
                      <p className="row-meta">{p.student?.name} • Semester {p.student?.semester || 'N/A'}</p>
                    </div>
                    <div className="row-stats">
                       <div className="progress-mini-track">
                          <div className="progress-mini-fill" style={{ width: `${p.progress}%` }} />
                       </div>
                       <span className="percent-text">{p.progress}%</span>
                    </div>
                    <button className="acadx-btn-small ghost" onClick={() => openProject(p.projectId)}>
                      Manage <ArrowRight size={14} />
                    </button>
                  </div>
                ))
              }
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;