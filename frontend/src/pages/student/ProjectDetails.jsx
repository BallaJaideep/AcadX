import React, { useEffect, useState } from "react";
import { useParams, Navigate, useNavigate, Link } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { 
  ArrowLeft, Calendar, User, Shield, BarChart2, 
  CheckCircle, Clock, FileText, ChevronRight,
  MessageSquare, AlertCircle, Zap, Hash, Info, Lock, Globe, Download, Trash
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./ProjectDetails.css";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  
  // Guard for null auth context
  const isAuthenticated = auth ? auth.isAuthenticated : false;
  const user = auth ? auth.user : null;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data.project || res.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    };
    if (id) loadProject();
  }, [id]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (loading) return (
    <div className="vp-loader">
      <div className="vp-spin" />
      <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 800, marginTop: '20px' }}>
        Authenticating Record...
      </span>
    </div>
  );

  if (error || !project) return (
    <div className="vp-root vp-error-root">
      <div className="vp-card vp-error-card">
        <AlertCircle size={48} color="var(--pk)" />
        <h2>Registry Error</h2>
        <p>{error || "Project data missing."}</p>
        <button onClick={() => navigate(-1)} className="vp-btn-vibrant">
          <ArrowLeft size={18} /> Return to Registry
        </button>
      </div>
    </div>
  );

  const handleDeleteProject = async () => {
    if (!window.confirm("Are you sure you want to discard this project? This action cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await api.delete(`/projects/${id}`);
      navigate("/student/projects");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadPDF = async () => {
    const input = document.getElementById("industrial-report-content");
    if (!input) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(input, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#0f172a", // Obsidian Base
        onclone: (clonedDoc) => {
          const clonedRecord = clonedDoc.getElementById("industrial-report-content");
          if (clonedRecord) {
            // Force WHITE Print-Optimized Theme for Capture
            clonedRecord.style.setProperty("background", "#ffffff", "important");
            clonedRecord.style.setProperty("color", "#020617", "important");
            clonedRecord.style.setProperty("padding-bottom", "124px", "important");
            clonedRecord.style.setProperty("border", "1px solid #e2e8f0", "important");
            
            const titles = clonedRecord.querySelectorAll(".ai-detail-label");
            titles.forEach(t => t.style.setProperty("color", "#7c3aed", "important")); // Darker lavender for contrast
            
            const texts = clonedRecord.querySelectorAll(".industrial-long-text");
            texts.forEach(t => t.style.setProperty("color", "#334155", "important"));

            const header = clonedRecord.querySelector(".pdf-only-header");
            if (header) header.style.setProperty("border-bottom", "2px solid #020617", "important");

            const brand = clonedRecord.querySelector(".pdf-brand");
            if (brand) brand.style.setProperty("color", "#020617", "important");

            const footer = clonedRecord.querySelector(".pdf-only-footer");
            if (footer) {
              footer.style.setProperty("background", "#f8fafc", "important");
              footer.style.setProperty("border-top", "1px solid #e2e8f0", "important");
              footer.style.setProperty("color", "#64748b", "important");
            }

            // Restore Budget Section Background for PDF Distinction
            const budgetPaper = clonedRecord.querySelector(".industrial-budget-paper");
            if (budgetPaper) {
              budgetPaper.style.setProperty("background", "#0f172a", "important"); 
              budgetPaper.style.setProperty("color", "#ffffff", "important");
              const budgetTexts = budgetPaper.querySelectorAll("p");
              budgetTexts.forEach(p => p.style.setProperty("color", "#ffffff", "important"));
            }
          }
        }
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      
      const pdfWidth = 210; // Standard A4 Width
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Initialize with dynamic height to prevent extra page
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight]
      });
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      pdf.save(`${project.title.replace(/\s+/g, "_")}_Industrial_Report.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("Failed to generate PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusCfg = (status) => {
    const s = (status || "pending").toLowerCase();
    if (s === "completed") return { cls: "completed", label: "Completed", bar: "#10b981" };
    if (s === "in_progress" || s === "active") return { cls: "active", label: "Active", bar: "var(--brand)" };
    return { cls: "pending", label: "Pending", bar: "#f59e0b" };
  };

  const cfg = getStatusCfg(project.status || project.derivedStatus);

  return (
    <div className="vp-root">
      <div className="vp-container vp-ticket-flow">
        <div className="vp-ticket">
          <div className="vp-ticket-accent" style={{ background: cfg.bar }} />
          <div className="vp-ticket-header">
            <div className="vp-ticket-nav">
              <button className="vp-back-btn-minimal" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
              </button>
              <div className="vp-ticket-meta-top">
                <span className="vp-ticket-category">Research Record</span>
                <span className="vp-ticket-id">ENT: {project._id ? project._id.slice(-8).toUpperCase() : "N/A"}</span>
              </div>
              {user?.role === "student" && user?._id === (project.studentId?._id || project.studentId) && (
                <button className="vp-btn-discard" onClick={handleDeleteProject} disabled={isDeleting}>
                  <Trash size={14} /> {isDeleting ? "Discarding..." : "Discard"}
                </button>
              )}
            </div>
            <div className="vp-ticket-main-hd">
              <h1 className="vp-ticket-title">{project.title}</h1>
              <div className="vp-ticket-actions-row">
                <div className={`vp-ticket-status ${cfg.cls}`}>
                  <div className="status-indicator" /> {cfg.label}
                </div>
                <button className="vp-btn-download-main" onClick={handleDownloadPDF} disabled={isExporting}>
                  <Download size={16} /> {isExporting ? "Generating..." : "Download Report"}
                </button>
              </div>
            </div>
            <div className="vp-ticket-basic-info">
              <div className="vp-info-blob">
                <Calendar size={14} /> 
                <span>Registered: {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="vp-info-blob">
                <Zap size={14} /> 
                <span>Domain: {project.domain || "N/A"}</span>
              </div>
              <div className="vp-info-blob">
                <Hash size={14} /> 
                <span>Type: {project.projectType || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="vp-ticket-body">
            <div id="industrial-report-content" className="vp-ai-proposal-details">
              <div className="pdf-only-header">
                <div className="pdf-brand">ELOR PORTAL INDUSTRIAL RECORD</div>
                <div className="pdf-meta">ID: {project._id} | DATE: {new Date().toLocaleDateString()}</div>
              </div>
              <div className="ai-detail-item">
                <div className="ai-detail-label"><Info size={16} /> Industrial Problem Analysis</div>
                <p className="industrial-long-text">{project.problemStatement || "No analysis available."}</p>
              </div>
              <div className="ai-proposal-grid">
                <div className="ai-detail-item">
                  <div className="ai-detail-label"><CheckCircle size={16} /> Strategic Technical Objectives</div>
                  <p className="industrial-long-text">{project.objective || "N/A"}</p>
                </div>
                <div className="ai-detail-item">
                  <div className="ai-detail-label"><Zap size={16} /> Deliverable Specifications & Outcome</div>
                  <p className="industrial-long-text">{project.outcome || "N/A"}</p>
                </div>
              </div>
              <div className="ai-detail-item">
                <div className="ai-detail-label"><FileText size={16} /> Resource Breakdown & Estimated Budget</div>
                <div className="industrial-budget-paper">
                  <p>{project.budget || "Minimal"}</p>
                </div>
              </div>
              <footer className="pdf-only-footer">
                <p>Technological Stack: {Array.isArray(project.techStack) ? project.techStack.join(" · ") : project.techStack}</p>
                <p>© {new Date().getFullYear()} ELOR Portal · Industrial Record Verification</p>
              </footer>
            </div>

            <div className="vp-ticket-row">
              <div className="vp-ticket-section large">
                <div className="vp-section-label"><BarChart2 size={16} /> Implementation Progress</div>
                <div className="vp-ticket-progress-hub">
                  <div className="vp-ticket-progress-data">
                    <span className="vp-big-percent">{project.progress || 0}%</span>
                    <span className="vp-progress-sub">Validation Status</span>
                  </div>
                  <div className="vp-ticket-rail">
                    <div className="vp-ticket-fill" style={{ width: `${project.progress || 0}%`, background: cfg.bar }} />
                  </div>
                  <Link to="/milestones" className="vp-ticket-link">
                    Open Roadmap <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
              <div className="vp-ticket-section">
                <div className="vp-section-label"><Shield size={16} /> Technical Mentorship</div>
                {project.mentor ? (
                  <div className="vp-ticket-mentor">
                    <div className="vp-mentor-orb" style={{ background: cfg.bar }}>{project.mentor.name?.[0]}</div>
                    <div className="vp-mentor-details">
                      <span className="vp-mentor-name">{project.mentor.name}</span>
                      <span className="vp-mentor-role">Lead Expert</span>
                    </div>
                  </div>
                ) : (
                  <div className="vp-ticket-mentor empty">
                    <p>No mentor allocated.</p>
                    <Link to={`/student/request-mentor?projectId=${project._id}`} className="vp-ticket-btn-action">Request Expert</Link>
                  </div>
                )}
              </div>
            </div>

            <div className="vp-ticket-footer">
              <div className="vp-ticket-actions-hub">
                {user?.role === "student" && (
                  <button onClick={() => navigate(`/student/final-submission/${project._id}`)} className="vp-ticket-btn-solid">
                    <FileText size={18} /> Submit Materials
                  </button>
                )}
                <Link to="/milestones" className="vp-ticket-btn-outline"><Clock size={18} /> Milestones</Link>
                <Link to="/student/complaint" className="vp-ticket-btn-outline"><MessageSquare size={18} /> Support</Link>
              </div>
              <div className="vp-ticket-meta-grid">
                <div className="vp-meta-cell"><span>Department</span><strong>{user?.department || "N/A"}</strong></div>
                <div className="vp-meta-cell"><span>Current Phase</span><strong>{project.progress >= 100 ? "Final Review" : "Research Stage"}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="vp-bottom-spacer" />
    </div>
  );
};

export default ProjectDetails;