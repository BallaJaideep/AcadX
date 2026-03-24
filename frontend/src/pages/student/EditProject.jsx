import React, { useState, useEffect } from "react";
import api from "../../api/client";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, AlertTriangle, Lightbulb, Save,
  Search, RefreshCw, CheckCircle, Zap, Globe, Cpu
} from "lucide-react";
import "./EditProject.css";

const EditProject = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Faculty feedback (passed via URL or state)
  const feedbackReason = searchParams.get("reason") || "";
  const feedbackSuggestions = searchParams.get("suggestions") || "";
  const requestId = searchParams.get("requestId") || "";

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    domain: "",
    techStack: "",
    department: "",
    projectType: "mini",
    semester: "1",
  });

  useEffect(() => {
    const loadProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        const p = res.data.project || res.data;
        setProject(p);
        setForm({
          domain: p.domain || "",
          techStack: Array.isArray(p.techStack) ? p.techStack.join(", ") : (p.techStack || ""),
          department: p.department || "",
          projectType: p.projectType || "mini",
          semester: String(p.semester || "1"),
        });
      } catch (err) {
        setError("Failed to load project data.");
      } finally {
        setLoading(false);
      }
    };
    if (id) loadProject();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError("");
    setMessage("");
    try {
      await api.put(`/projects/${id}`, {
        domain: form.domain,
        techStack: form.techStack.split(",").map((t) => t.trim()),
        department: form.department,
        projectType: form.projectType,
        semester: parseInt(form.semester),
        regenerate: true, // Signal AI to regenerate content
      });
      setMessage("Project regenerated with AI! Ready to re-submit mentor request.");
      setTimeout(() => navigate("/student/requests"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Regeneration failed.");
    } finally {
      setRegenerating(false);
    }
  };

  const handleSaveOnly = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api.put(`/projects/${id}`, {
        domain: form.domain,
        techStack: form.techStack.split(",").map((t) => t.trim()),
        department: form.department,
        projectType: form.projectType,
        semester: parseInt(form.semester),
      });
      setMessage("Project updated successfully.");
      setTimeout(() => navigate("/student/requests"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="ep-loader">
      <div className="ep-spin" />
      <span>Loading Project Data...</span>
    </div>
  );

  return (
    <div className="ep-root">
      <div className="ep-container">

        {/* HEADER */}
        <div className="ep-header">
          <button className="ep-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Back
          </button>
          <div className="ep-header-content">
            <div className="ep-eyebrow">
              <RefreshCw size={14} /> Project Modification
            </div>
            <h1 className="ep-title">Revise Your <span className="ep-title-accent">Project</span></h1>
            <p className="ep-subtitle">
              Update your project based on faculty feedback. Our AI will regenerate the content.
            </p>
          </div>
        </div>

        <div className="ep-body">

          {/* FACULTY FEEDBACK PANEL */}
          {(feedbackReason || feedbackSuggestions) && (
            <div className="ep-feedback-panel">
              <div className="ep-feedback-header">
                <AlertTriangle size={20} className="ep-feedback-icon" />
                <div>
                  <h3 className="ep-feedback-title">Faculty Feedback</h3>
                  <p className="ep-feedback-sub">Review this guidance carefully before making changes</p>
                </div>
              </div>

              {feedbackReason && (
                <div className="ep-feedback-section reason">
                  <div className="ep-feedback-label">
                    <AlertTriangle size={13} /> Reason for Rejection
                  </div>
                  <p className="ep-feedback-text">{decodeURIComponent(feedbackReason)}</p>
                </div>
              )}

              {feedbackSuggestions && (
                <div className="ep-feedback-section suggestions">
                  <div className="ep-feedback-label suggestions-label">
                    <Lightbulb size={13} /> Suggestions for Improvement
                  </div>
                  <p className="ep-feedback-text">{decodeURIComponent(feedbackSuggestions)}</p>
                </div>
              )}
            </div>
          )}

          {/* CURRENT PROJECT PREVIEW */}
          {project && (
            <div className="ep-current-preview">
              <h4 className="ep-section-heading">Current Project</h4>
              <div className="ep-preview-grid">
                <div className="ep-preview-item">
                  <span className="ep-preview-label">Title</span>
                  <span className="ep-preview-value">{project.title || "—"}</span>
                </div>
                <div className="ep-preview-item">
                  <span className="ep-preview-label">Domain</span>
                  <span className="ep-preview-value">{project.domain || "—"}</span>
                </div>
                <div className="ep-preview-item full-width">
                  <span className="ep-preview-label">Problem Statement</span>
                  <span className="ep-preview-value">{project.problemStatement?.substring(0, 200) || "—"}...</span>
                </div>
              </div>
            </div>
          )}

          {/* ALERTS */}
          {message && (
            <div className="ep-alert success">
              <CheckCircle size={16} /> {message}
            </div>
          )}
          {error && (
            <div className="ep-alert error">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          {/* MODIFICATION FORM */}
          <div className="ep-form-card">
            <h4 className="ep-section-heading">Update Project Parameters</h4>
            <p className="ep-form-note">
              Modify the fields below. Click <strong>"Regenerate with AI"</strong> to create new project content based on your updated inputs.
            </p>

            <div className="ep-form-grid">
              <div className="ep-form-group">
                <label className="ep-label">
                  <Globe size={14} /> Industry Domain
                </label>
                <input
                  name="domain"
                  className="ep-input"
                  placeholder="e.g., AI/ML, Web Systems, IoT"
                  value={form.domain}
                  onChange={handleChange}
                />
              </div>

              <div className="ep-form-group">
                <label className="ep-label">
                  <Cpu size={14} /> Core Tech Stack
                </label>
                <input
                  name="techStack"
                  className="ep-input"
                  placeholder="e.g., React, Node.js, TensorFlow"
                  value={form.techStack}
                  onChange={handleChange}
                />
              </div>

              <div className="ep-form-group">
                <label className="ep-label">
                  <Zap size={14} /> Department
                </label>
                <input
                  name="department"
                  className="ep-input"
                  placeholder="e.g., Computer Science"
                  value={form.department}
                  onChange={handleChange}
                />
              </div>

              <div className="ep-form-group">
                <label className="ep-label">Semester</label>
                <select name="semester" className="ep-input" value={form.semester} onChange={handleChange}>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>

              <div className="ep-form-group">
                <label className="ep-label">Project Type</label>
                <select name="projectType" className="ep-input" value={form.projectType} onChange={handleChange}>
                  <option value="mini">Mini Project</option>
                  <option value="major">Major Project</option>
                  <option value="research">Research Paper</option>
                  <option value="internship">Internship Project</option>
                </select>
              </div>
            </div>

            <div className="ep-actions">
              <button
                className="ep-btn-regenerate"
                onClick={handleRegenerate}
                disabled={regenerating || saving}
              >
                {regenerating ? (
                  <><RefreshCw size={18} className="ep-spin-icon" /> Regenerating...</>
                ) : (
                  <><Zap size={18} /> Regenerate with AI</>
                )}
              </button>

              <button
                className="ep-btn-save"
                onClick={handleSaveOnly}
                disabled={saving || regenerating}
              >
                {saving ? "Saving..." : <><Save size={18} /> Save Changes</>}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EditProject;
