import React, { useState, useEffect } from "react";
import api from "../../api/client";
import { 
  Zap, Download, UserPlus, Info, CheckCircle, 
  FileText, ShieldCheck, ArrowRight, RefreshCw,
  Globe, Cpu, Database
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./TechnicalRecordGenerator.css";

const TechnicalRecordGenerator = () => {
  const auth = useAuth();
  const isAuthenticated = auth ? auth.isAuthenticated : false;
  const user = auth ? auth.user : null;

  /* ─── State ─── */
  const [form, setForm] = useState({
    domain: "",
    techStack: "",
    department: "Computer Science",
    projectType: "major"
  });
  
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [faculty, setFaculty] = useState([]);
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState("");

  /* ─── Load Faculty (for mentor assignment) ─── */
  useEffect(() => {
    const loadFaculty = async () => {
      try {
        const res = await api.get("/hod/faculty-directory");
        setFaculty(res.data.faculty || []);
      } catch (err) {
        console.error("Failed to load faculty:", err);
      }
    };
    loadFaculty();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ─── Generate Record ─── */
  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setProject(null);

    try {
      const res = await api.post("/projects", {
        ...form,
        techStack: form.techStack.split(",").map(s => s.trim())
      });
      
      setProject(res.data.project);
      setStreaming(true);
      setTimeout(() => setStreaming(false), 2000); // Visual "data-stream" effect
    } catch (err) {
      setError(err.response?.data?.message || "Generation failed. Please refine your inputs.");
    } finally {
      setLoading(false);
    }
  };

  /* ─── PDF Export (Bulletproof Version) ─── */
  const handleDownloadPDF = async () => {
    const paper = document.getElementById("industrial-paper-canvas");
    if (!paper) {
      alert("System Error: Capture target not found.");
      return;
    }

    // STRICT CHECK: Ensure synthesis is complete
    if (!project || !project.problemStatement || streaming) {
      alert("Technical synthesis is still in progress. Please wait for completion.");
      return;
    }

    setIsExporting(true);
    try {
      // Step 1: Force scroll to top (critical for html2canvas)
      window.scrollTo(0, 0);

      // Step 2: High-density capture
      const canvas = await html2canvas(paper, {
        scale: 3, // Ultra-high resolution
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff", // Force clean white background for PDF
        width: 800, // Lock width
        onclone: (clonedDoc) => {
          const clonedPaper = clonedDoc.getElementById("industrial-paper-canvas");
          if (clonedPaper) {
            // Force WHITE Print-Optimized Theme for Capture
            clonedPaper.style.setProperty("background", "#ffffff", "important");
            clonedPaper.style.setProperty("color", "#020617", "important");
            clonedPaper.style.setProperty("border", "1px solid #e2e8f0", "important");
            
            // Adjust header
            const header = clonedPaper.querySelector(".trg-paper-hd");
            if (header) header.style.setProperty("border-bottom", "2px solid #020617", "important");
            
            const brand = clonedPaper.querySelector(".trg-paper-brand");
            if (brand) brand.style.setProperty("color", "#020617", "important");
            
            const meta = clonedPaper.querySelector(".trg-paper-meta");
            if (meta) meta.style.setProperty("color", "#64748b", "important");

            // Adjust main title (H2)
            const mainTitle = clonedPaper.querySelector("h2");
            if (mainTitle) {
              mainTitle.style.setProperty("color", "#020617", "important");
              mainTitle.style.setProperty("border-bottom", "1px solid #e2e8f0", "important");
            }

            // Adjust section titles
            const titles = clonedPaper.querySelectorAll(".trg-section-title");
            titles.forEach(t => {
              t.style.setProperty("background", "#020617", "important");
              t.style.setProperty("color", "#ffffff", "important");
            });

            // Adjust all content text
            const texts = clonedPaper.querySelectorAll(".trg-content-text");
            texts.forEach(t => {
              t.style.setProperty("color", "#334155", "important");
            });

            // Adjust budget box
            const budgetBox = clonedPaper.querySelector(".trg-budget-box");
            if (budgetBox) {
              budgetBox.style.setProperty("background-color", "#0c111d", "important"); // Restoring dark background for PDF
              budgetBox.style.setProperty("border", "1px solid rgba(196, 181, 253, 0.3)", "important");
              const budgetText = budgetBox.querySelector(".trg-content-text");
              if (budgetText) budgetText.style.setProperty("color", "#ffffff", "important");
            }

            // Adjust footer
            const footer = clonedPaper.querySelector("footer");
            if (footer) {
              footer.style.setProperty("border-top", "1px solid #e2e8f0", "important");
              footer.style.setProperty("color", "#64748b", "important");
              footer.style.setProperty("opacity", "1", "important");
            }

            // Keep watermark subtle
            clonedPaper.style.setProperty("--watermark-opacity", "0.05", "important");
          }
        }
      });
      
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      
      const pdfWidth = 210; // Standard A4 Width
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight]
      });
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      pdf.save(`INDUSTRIAL_RECORD_${project.title.substring(0, 10).toUpperCase()}.pdf`);
    } catch (err) {
      console.error("PDF SYNTHESIS CRITICAL ERROR:", err);
      alert("PDF SYNTHESIS FAILURE: Consult logic logs.");
    } finally {
      setIsExporting(false);
    }
  };

  /* ─── Assign Mentor Flow ─── */
  const handleAssignMentor = async () => {
    if (!selectedFaculty) return alert("Please select a faculty member.");
    
    try {
      await api.post("/mentor-requests", {
        projectId: project._id,
        requestedFacultyId: selectedFaculty,
        message: `Hello, I have generated a comprehensive Industrial Technical Record for my project "${project.title}". I would be honored to have you as my mentor for this initiative.`
      });
      alert("Invitation sent! The Industrial Record has been attached to your request.");
      setShowMentorModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request.");
    }
  };

  return (
    <div className="trg-wrapper fade-in">
      
      {/* ─── OBSIDIAN HEADER ─── */}
      <header className="trg-obsidian-header">
        <div className="trg-tag">
          <ShieldCheck size={14} /> Institutional Standard v4.0
        </div>
        <h1 className="trg-title">
          Industrial <span>Technical Record</span> Generator
        </h1>
        <p className="trg-desc">
          Craft high-density academic proposals with automated industrial problem analysis, 
          strategic objectives, and resource breakdown.
        </p>
      </header>

      {/* ─── COMMAND CENTER ─── */}
      <section className="trg-command-center">
        <form onSubmit={handleGenerate}>
          <div className="trg-input-grid">
            <div className="trg-form-group">
              <label className="trg-label"><Globe size={14} /> Industry Domain</label>
              <input 
                name="domain" required className="trg-input" 
                placeholder="e.g. Fintech, Aerospace, Distributed Systems"
                onChange={handleChange}
              />
            </div>
            <div className="trg-form-group">
              <label className="trg-label"><Cpu size={14} /> Core Tech Stack</label>
              <input 
                name="techStack" required className="trg-input" 
                placeholder="e.g. Python, TensorFlow, Kubernetes"
                onChange={handleChange}
              />
            </div>
          </div>
          
          <button type="submit" className="trg-btn-generate" disabled={loading}>
            {loading ? <RefreshCw className="spin" size={20} /> : <Zap size={20} />}
            {loading ? "Synthesizing Industrial Data..." : "Generate Technical Record"}
          </button>
        </form>
        {error && <p className="trg-error" style={{color: '#ef4444', marginTop: 15, fontWeight: 700}}>{error}</p>}
      </section>

      {/* ─── PREVIEW CANVAS ─── */}
      {project && (
        <div className={`trg-preview-area ${streaming ? "loading" : ""}`}>
          <div id="industrial-paper-canvas" className="trg-paper">
            <div className="trg-paper-hd">
              <div className="trg-paper-brand">ELOR PORTAL · INDUSTRIAL RECORD</div>
              <div className="trg-paper-meta">
                ID: {project._id.slice(-8).toUpperCase()}<br />
                DOC_TYPE: TECH_SPEC_V1<br />
                DATE: {new Date().toLocaleDateString()}
              </div>
            </div>

            <h2 style={{fontSize: 32, fontWeight: 900, marginBottom: 40, borderBottom: '1px solid rgba(196, 181, 253, 0.2)', paddingBottom: 20, color: '#ffffff'}}>
              {project.title}
            </h2>

            <div className="trg-section">
              <h3 className="trg-section-title">I. Industrial Problem Analysis</h3>
              <p className="trg-content-text">{project.problemStatement}</p>
            </div>

            <div className="trg-section">
              <h3 className="trg-section-title">II. Strategic Technical Objectives</h3>
              <p className="trg-content-text">{project.objective}</p>
            </div>

            <div className="trg-section">
              <h3 className="trg-section-title">III. Deliverable Specifications</h3>
              <p className="trg-content-text">{project.outcome}</p>
            </div>

            <div className="trg-budget-box" id="budget-record-section">
              <h3 className="trg-section-title">IV. Resource Breakdown & Estimated Budget</h3>
              <p className="trg-content-text" style={{margin: 0, color: '#ffffff', fontWeight: 700}}>
                {project.budget}
              </p>
            </div>

            <footer style={{marginTop: 60, borderTop: '1px solid rgba(196, 181, 253, 0.4)', paddingTop: 20, fontSize: 11, color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center'}}>
              This document is a system-generated verified industrial technical record. 
              <br />
              © {new Date().getFullYear()} ELOR Portal · Industrial Record Verification
            </footer>
          </div>

          {/* FLOATING ACTIONS */}
          <div className="trg-actions-bar">
            <button className="trg-action-btn btn-download" onClick={handleDownloadPDF} disabled={isExporting}>
              <Download size={18} /> {isExporting ? "Exporting..." : "Download Record"}
            </button>
            <button className="trg-action-btn btn-mentor" onClick={() => setShowMentorModal(true)}>
              <UserPlus size={18} /> Assign Project Mentor
            </button>
            <button className="trg-action-btn btn-mentor" onClick={() => window.location.href='/student/dashboard'}>
              Dashboard <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ─── MENTOR MODAL ─── */}
      {showMentorModal && (
        <div className="trg-modal-overlay" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', 
          backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', 
          alignItems: 'center', justifyHeight: 'center', padding: 20
        }}>
          <div className="trg-modal" style={{
            background: 'white', borderRadius: 24, padding: 40, 
            maxWidth: 500, width: '100%', position: 'relative'
          }}>
            <h2 style={{fontWeight: 900, marginBottom: 10}}>Assign Institutional Mentor</h2>
            <p style={{color: '#64748b', fontSize: 14, marginBottom: 30}}>
              Select a faculty member to review your industrial proposal. 
              The technical record will be automatically attached to your invitation.
            </p>

            <div className="trg-form-group" style={{marginBottom: 30}}>
              <label className="trg-label">Select Faculty</label>
              <select 
                className="trg-input" 
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
              >
                <option value="">-- Choose Reviewer --</option>
                {faculty.map(f => (
                  <option key={f._id} value={f._id}>{f.name} ({f.department})</option>
                ))}
              </select>
            </div>

            <div style={{display: 'flex', gap: 12}}>
              <button 
                className="trg-btn-generate" 
                style={{flex: 1, height: 50}}
                onClick={handleAssignMentor}
              >
                Send Proposal
              </button>
              <button 
                className="trg-btn-generate" 
                style={{flex: 1, height: 50, background: '#f1f5f9', color: '#0f172a'}}
                onClick={() => setShowMentorModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalRecordGenerator;
