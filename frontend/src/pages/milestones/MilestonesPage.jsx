import { useEffect, useState, useLayoutEffect } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { 
  ArrowLeft, Map, Hash, Zap, ChevronDown, ChevronRight, 
  Trash2, Rocket, CheckCircle2, AlertCircle, Info 
} from "lucide-react";

import MilestoneCard from "../../components/milestones/MilestoneCard";
import GenerateMilestonesButton from "../../components/milestones/GenerateMilestonesButton";

import "./MilestonesPage.css";
import { useNavigate } from "react-router-dom";

const MilestonesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [expandedProjects, setExpandedProjects] = useState({});

  const toggleProject = (projectId) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const getProjectStatus = (milestones) => {
    if (!milestones || milestones.length === 0) {
      return { label: "Not Started", cls: "not-started", color: "#64748b" };
    }
    const total = milestones.length;
    const completed = milestones.filter((m) => m.status === "completed").length;
    if (completed === total) {
      return { label: "Completed", cls: "completed", color: "#10b981" };
    }
    return { label: "In Progress", cls: "in-progress", color: "#3B82F6" };
  };

  useLayoutEffect(() => {
    const savedPosition = sessionStorage.getItem("milestoneScrollPos");
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition, 10));
    }

    const handleScroll = () => {
      sessionStorage.setItem("milestoneScrollPos", window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadMilestones = async () => {
    try {
      setError("");
      const res = await api.get("/milestones/my");
      setProjects(Array.isArray(res.data?.projects) ? res.data.projects : []);
    } catch (err) {
      console.error("Milestone load error:", err);
      setProjects([]);
      setError(err?.response?.data?.message || "System synchronization failed.");
    }
  };

  const deleteMilestones = async (projectId) => {
    if (!window.confirm("Are you sure you want to reset the project roadmap?")) return;
    try {
      await api.delete(`/milestones/project/${projectId}`);
      loadMilestones();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete milestones.");
    }
  };

  const submitToFaculty = async (projectId, milestones) => {
    const isAllCompleted = milestones.every((m) => {
      const allTasksDone = m.tasks.every((t) => t.status === "completed" || t.status === "done");
      return m.status === "completed" && allTasksDone;
    });

    if (!isAllCompleted) {
      alert("Please complete all milestones and tasks before formal submission.");
      return;
    }

    if (!window.confirm("Submit final project to faculty? This action cannot be undone.")) return;
    try {
      await api.patch(`/milestones/project/${projectId}/complete`);
      loadMilestones();
      alert("Project submitted successfully!");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to submit project.");
    }
  };

  useEffect(() => {
    loadMilestones();
  }, []);

  return (
    <div className="vp-root">
      <div className="vp-container vp-roadmap-container">
        
        {/* ── ROADMAP HEADER (Dark Gemini Format) ── */}
        <div className="vp-header-box vp-roadmap-header">
          <button className="vp-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Back
          </button>
          
          <div className="vp-header-box-content">
            <div className="vp-hero-badge"><Map size={14} /> Strategic Roadmap</div>
            <h1 className="vp-hero-h1">Weekly <span className="vp-hero-name">Milestones.</span></h1>
            <p className="vp-hero-p">
              Institutional tracking of your academic milestones. 
              Monitor progress, validate deliverables, and secure final approvals.
            </p>
          </div>

          <div className="vp-header-stats">
            <div className="vp-header-stat">
              <span className="vp-stat-num">{projects.length}</span>
              <span className="vp-stat-lab">Active Tracks</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="vp-alert error">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}

        {/* ── PROJECT ROADMAP STACK ── */}
        <div className="vp-roadmap-stack">
          {projects.length === 0 ? (
            <div className="vp-empty-box-best">
              <div className="vp-empty-ico-frame">
                <Map size={64} className="vp-empty-ico-vibrant" />
              </div>
              <h3>Roadmap Archive Empty</h3>
              <p>No active project tracks found in your institutional directory. Initialize a project to begin roadmap generation.</p>
            </div>
          ) : (
            projects.map((block) => {
              const status = getProjectStatus(block.milestones);
              const isExpanded = expandedProjects[block.projectId];

              return (
                <div key={block.projectId} className="vp-project-roadmap-card">
                  {/* Status Side Accent (Flush) */}
                  <div className="vp-proj-bar-accent" style={{ background: status.color }} />
                  
                  {/* Project Control Bar */}
                  <div 
                    className={`vp-project-ctrl-bar ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleProject(block.projectId)}
                  >
                    <div className="vp-ctrl-info">
                      <div className="vp-label-mini">INSTITUTIONAL TRACK CONTROL</div>
                      <h2 className="vp-ctrl-title">
                        <Hash size={24} style={{ opacity: 0.3, marginRight: '12px' }} />
                        {block.project?.title || "Untitled Research Track"}
                      </h2>
                    </div>
                    
                    <div className="vp-ctrl-actions" onClick={(e) => e.stopPropagation()}>
                      <div className={`vp-status-pill ${status.cls}`}>
                        <div className="status-dot" /> {status.label}
                      </div>

                      {user && ["faculty", "hod", "admin"].includes(user.role) && (!block.milestones || block.milestones.length === 0) && (
                        <GenerateMilestonesButton
                          projectId={block.projectId}
                          onDone={loadMilestones}
                        />
                      )}
                      
                      {user && ["faculty", "hod", "admin"].includes(user.role) && block.milestones?.length > 0 && (
                        <button 
                          className="vp-btn-minimal-danger"
                          onClick={() => deleteMilestones(block.projectId)}
                        >
                          <Trash2 size={16} /> Reset Roadmap
                        </button>
                      )}

                      <button className="vp-expand-indicator">
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Milestone Timeline Grid */}
                  {isExpanded && (
                    <div className="vp-milestone-timeline">
                      {Array.isArray(block.milestones) && block.milestones.length > 0 ? (
                        <div className="vp-milestone-grid">
                          {block.milestones.map((milestone) => (
                            <MilestoneCard
                              key={milestone._id}
                              milestone={milestone}
                              role={user?.role}
                              reload={loadMilestones}
                            />
                          ))}
                          
                          {/* Formal Submission Protocol */}
                          {user && user.role === "student" && (
                             <div className="vp-submission-protocol-card">
                                <div className="vp-protocol-info">
                                  <div className="vp-label-mini">FORMAL TERMINATION PROTOCOL</div>
                                  <h3>Project Finalization</h3>
                                  <p>Execute this protocol once all research phases above have been validated and marked as completed.</p>
                                </div>
                                
                                <button 
                                  className="vp-btn-vibrant vp-protocol-btn"
                                  disabled={status.label === "Completed"}
                                  onClick={() => submitToFaculty(block.projectId, block.milestones)}
                                >
                                  {status.label === "Completed" ? (
                                    <><CheckCircle2 size={18} /> Protocol Finalized</>
                                  ) : (
                                    <><Rocket size={18} /> Submit to Faculty</>
                                  )}
                                </button>
                             </div>
                          )}
                        </div>
                      ) : (
                        <div className="vp-no-roadmap-msg">
                          <Info size={24} />
                          <p>Institutional roadmap sequence pending generation by presiding faculty.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="vp-bottom-spacer" />
    </div>
  );
};

export default MilestonesPage;