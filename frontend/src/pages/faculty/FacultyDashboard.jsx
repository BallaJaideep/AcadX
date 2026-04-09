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
  RotateCcw,
  ChevronLeft,
  ChevronRight
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

  // Pagination & Layout State
  const [activeTab, setActiveTab] = useState("incoming"); // "incoming" or "guidance"
  const [reqPage, setReqPage] = useState(1);
  const [compPage, setCompPage] = useState(1);
  const [projPage, setProjPage] = useState(1);

  const REQ_LIMIT = 3;
  const COMP_LIMIT = 3;
  const PROJ_LIMIT = 10;

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

  // Pagination getters
  const paginatedRequests = requests.slice((reqPage - 1) * REQ_LIMIT, reqPage * REQ_LIMIT);
  const paginatedComplaints = complaints.slice((compPage - 1) * COMP_LIMIT, compPage * COMP_LIMIT);
  const paginatedProjects = projects.slice((projPage - 1) * PROJ_LIMIT, projPage * PROJ_LIMIT);

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
            Pending Actions
          </span>
          <span className="stat-value">{requests.length + complaints.length}</span>
        </div>
      </div>

      <div className="dashboard-main-grid">
        
        {/* LEFT COMPONENT: ACTION QUEUE WITH TABS */}
        <div className="dashboard-sidebar">
          
          <div className="fac-tabs">
            <button className={`fac-tab-btn ${activeTab === 'incoming' ? 'active' : ''}`} onClick={() => { setActiveTab('incoming'); setReqPage(1); }}>
               Mentorships ({requests.length})
            </button>
            <button className={`fac-tab-btn ${activeTab === 'guidance' ? 'active alert-pulse' : ''}`} onClick={() => { setActiveTab('guidance'); setCompPage(1); }}>
               Guidance ({complaints.length})
            </button>
          </div>

          <section className="dashboard-section tabbed-section">
            
            {/* TAB 1: MENTORSHIP REQUESTS */}
            {activeTab === 'incoming' && (
              <>
                {paginatedRequests.length === 0 ? <p className="empty-label">No pending mentorship requests.</p> : 
                  paginatedRequests.map(req => (
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
                              Send
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
                            <RotateCcw size={14} /> Redo
                          </button>
                          <button className="acadx-btn-small ghost" onClick={() => openProject(req.projectId._id)}>
                            <Eye size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                }

                {/* PAGINATION CONTROLS */}
                {requests.length > REQ_LIMIT && (
                  <div className="fac-pagination">
                    <button className="fac-pg-btn" disabled={reqPage === 1} onClick={() => setReqPage(p => p - 1)}><ChevronLeft size={16}/></button>
                    <span className="fac-pg-text">Page {reqPage} of {Math.ceil(requests.length / REQ_LIMIT)}</span>
                    <button className="fac-pg-btn" disabled={reqPage * REQ_LIMIT >= requests.length} onClick={() => setReqPage(p => p + 1)}><ChevronRight size={16}/></button>
                  </div>
                )}
              </>
            )}

            {/* TAB 2: URGENT GUIDANCE */}
            {activeTab === 'guidance' && (
              <>
                {paginatedComplaints.length === 0 ? <p className="empty-label">No active guidance requests.</p> :
                  paginatedComplaints.map(c => (
                    <div key={c._id} className="warning-card">
                      <h4 className="mini-title">{c.projectId?.title}</h4>
                      <p className="mini-issue">"{c.reason}"</p>
                      
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

                {/* PAGINATION CONTROLS */}
                {complaints.length > COMP_LIMIT && (
                  <div className="fac-pagination">
                    <button className="fac-pg-btn" disabled={compPage === 1} onClick={() => setCompPage(p => p - 1)}><ChevronLeft size={16}/></button>
                    <span className="fac-pg-text">Page {compPage} of {Math.ceil(complaints.length / COMP_LIMIT)}</span>
                    <button className="fac-pg-btn" disabled={compPage * COMP_LIMIT >= complaints.length} onClick={() => setCompPage(p => p + 1)}><ChevronRight size={16}/></button>
                  </div>
                )}
              </>
            )}

          </section>
        </div>

        {/* RIGHT COMPONENT: PROGRESS MONITOR */}
        <div className="dashboard-content">
          <section className="dashboard-section">
            <div className="section-header-flex">
               <h3 className="section-label" style={{ marginBottom: 0 }}>
                 <TrendingUp size={20} style={{ color: '#7C3AED' }} /> Student Progression Feed
               </h3>
               {projects.length > PROJ_LIMIT && (
                 <div className="fac-pagination mini">
                   <button className="fac-pg-btn" disabled={projPage === 1} onClick={() => setProjPage(p => p - 1)}><ChevronLeft size={16}/></button>
                   <span className="fac-pg-text">{projPage} of {Math.ceil(projects.length / PROJ_LIMIT)}</span>
                   <button className="fac-pg-btn" disabled={projPage * PROJ_LIMIT >= projects.length} onClick={() => setProjPage(p => p + 1)}><ChevronRight size={16}/></button>
                 </div>
               )}
            </div>

            <div className="progress-list" style={{ marginTop: '24px' }}>
              {paginatedProjects.length === 0 ? <p className="empty-label">No managed projects yet.</p> :
                paginatedProjects.map(p => (
                  <div key={p.projectId} className={`progress-row-card ${p.healthStatus === 'Critical' ? 'critical-risk' : ''}`}>
                    <div className="row-info">
                      <h4 className="row-title">
                        {p.projectTitle}
                        {p.healthStatus === 'Critical' && (
                           <span className="fac-risk-badge critical"><ShieldAlert size={12} style={{ marginRight: 4 }} /> Critical Dev Risk</span>
                        )}
                        {p.healthStatus === 'Warning' && (
                           <span className="fac-risk-badge warning"><Activity size={12} style={{ marginRight: 4 }} /> Low Velocity</span>
                        )}
                      </h4>
                      <p className="row-meta">
                        {p.student?.name} • Semester {p.student?.semester || 'N/A'} 
                        {p.currentHealthScore !== undefined && (
                          <span className="fac-velocity-meta"> • Pulse Score: {p.currentHealthScore}/100</span>
                        )}
                      </p>
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