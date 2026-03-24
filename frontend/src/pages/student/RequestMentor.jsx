import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/client";
import { 
  Users, FolderOpen, MessageSquare, Send, 
  Info, Zap, Globe, Shield, ArrowLeft, Hash 
} from "lucide-react";
import "./RequestMentor.css";

const RequestMentor = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedProjectId = searchParams.get("projectId") || "";
  const preselectedFacultyId = searchParams.get("facultyId") || "";
  const isResubmission        = searchParams.get("resubmit") === "1";

  const [projects, setProjects]     = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [form, setForm] = useState({
    projectId: preselectedProjectId,
    facultyId: preselectedFacultyId,
    message: isResubmission ? "I have revised my project based on your feedback and am re-submitting for your consideration." : "",
  });

  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [messageText, setMessageText] = useState("");
  const [error, setError]           = useState("");

  useEffect(() => {
    const loadData = async () => {
      setError("");
      setLoading(true);
      try {
        const [projRes, facRes] = await Promise.all([
          api.get("/projects/my"),
          api.get("/users/faculty"),
        ]);

        const projData = projRes?.data?.projects || projRes?.data || [];
        setProjects(Array.isArray(projData) ? projData : []);

        const facData = facRes?.data?.users || facRes?.data?.faculty || facRes?.data || [];
        setFacultyList(Array.isArray(facData) ? facData : []);

        // Pre-fill both projectId and facultyId from URL
        if (preselectedProjectId || preselectedFacultyId) {
          setForm((prev) => ({
            ...prev,
            projectId: preselectedProjectId || prev.projectId,
            facultyId: preselectedFacultyId || prev.facultyId,
          }));
        }
      } catch (err) {
        setError("System failed to synchronize faculty directories.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [preselectedProjectId]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.projectId || !form.facultyId) {
      setError("Please complete all required selection fields.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/mentor-requests", {
        projectId: form.projectId,
        requestedFacultyId: form.facultyId,
        message: form.message,
      });
      setMessageText("Application transmitted successfully.");
      setTimeout(() => navigate("/student/projects"), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to transmit request.");
    } finally {
      setSaving(false);
    }
  };

  const selectedProject = projects.find(p => p._id === form.projectId);

  return (
    <div className="vp-root">
      <div className="vp-container vp-ticket-flow">
        
        {/* ── INSTITUTIONAL MENTORSHIP TICKET ── */}
        <div className="vp-ticket">
          {/* Flush Accent for Mentorship (Purple/Indigo) */}
          <div className="vp-ticket-accent" style={{ background: 'var(--brand)' }} />
          
          {/* TICKET TOP: DARK GEMINI HEADER */}
          <div className="vp-ticket-header">
            <div className="vp-ticket-nav">
              <button className="vp-back-btn-minimal" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
              </button>
              <div className="vp-ticket-meta-top">
                <span className="vp-ticket-category">Academic Governance</span>
                <span className="vp-ticket-id">PROTOCOL: MNTR-ALLOC</span>
              </div>
            </div>

            <div className="vp-ticket-main-hd">
              <h1 className="vp-ticket-title">Consult <span className="vp-ticket-name">Expert.</span></h1>
              <div className="vp-ticket-status active">
                <div className="status-indicator" /> Formal Request
              </div>
            </div>
            
            <p className="vp-ticket-abstract">
              Submit a formal request for mentorship. Our subject matter experts 
              provide institutional validation and research rigor for your tracks.
            </p>

            <div className="vp-ticket-basic-info">
              <div className="vp-info-blob">
                <Shield size={14} /> 
                <span>Institutional Support</span>
              </div>
              <div className="vp-info-blob">
                <Globe size={14} /> 
                <span>Faculty Directory Active</span>
              </div>
            </div>
          </div>

          {/* TICKET BODY: FORM SECTION */}
          <div className="vp-ticket-body">
            
            {error && <div className="vp-alert error">{error}</div>}
            {messageText && <div className="vp-alert success">{messageText}</div>}

            {/* Re-submission notice */}
            {isResubmission && !messageText && !error && (
              <div className="vp-alert resubmit">
                <Info size={16} />
                <span>You are re-submitting after project revision. The previous mentor is pre-selected — you may change it if you wish.</span>
              </div>
            )}

            {loading ? (
              <div className="vp-loader-inline">
                <div className="vp-spin-small" />
                <span>Synchronizing Faculty Registers...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="vp-modern-form">
                
                <div className="vp-form-grid">
                  <div className="vp-input-group">
                    <label><FolderOpen size={16} /> Project Masterfile</label>
                    <div className="vp-select-wrapper">
                      <select
                        name="projectId"
                        value={form.projectId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Research Track...</option>
                        {projects.map((p) => (
                          <option key={p._id} value={p._id}>{p.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="vp-input-group">
                    <label><Users size={16} /> Requested Faculty</label>
                    <div className="vp-select-wrapper">
                      <select
                        name="facultyId"
                        value={form.facultyId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Expert Advocate...</option>
                        {facultyList.map((f) => (
                          <option key={f._id} value={f._id}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="vp-input-group">
                  <label><MessageSquare size={16} /> Research Abstract</label>
                  <textarea
                    name="message"
                    rows={6}
                    placeholder="Outline your mentorship requirements, research objectives, and specific challenges you wish to address with expert guidance..."
                    value={form.message}
                    onChange={handleChange}
                  />
                </div>

                <div className="vp-ticket-footer">
                  <div className="vp-disclaimer-box">
                    <Info size={18} />
                    <p>Applications are logged to your institutional record. Faculty availability is subject to departmental bandwidth and current research load.</p>
                  </div>
                  <button type="submit" className="vp-ticket-btn-solid" disabled={saving}>
                    {saving ? "Transmitting..." : <><Send size={18} /> Send Formal Request</>}
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>

      </div>
      <div className="vp-bottom-spacer" />
    </div>
  );
};

export default RequestMentor;