import { useEffect, useState } from "react";
import api from "../../api/client";
import "./FacultyComplaints.css";

const FacultyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get("/faculty/complaints");
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error("Failed to load grievances registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleReplyChange = (id, text) => {
    setReplies(prev => ({ ...prev, [id]: text }));
  };

  const resolveComplaint = async (id) => {
    const text = replies[id];
    if (!text || text.trim().length < 5) {
      return alert("A formal resolution narrative is required.");
    }

    try {
      setIsSubmitting(true);
      await api.patch(`/faculty/complaints/${id}/resolve`, {
        response: text,
      });
      setReplies(prev => ({ ...prev, [id]: "" }));
      loadComplaints();
    } catch (err) {
      alert("Transmission failed. System synchronization error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="exe-wrapper">
      <div className="exe-view-container">
        
        {/* EXECUTIVE HEADER */}
        <header className="exe-view-header">
          <div className="title-area">
            <span className="exe-tag danger">Administrative Oversight</span>
            <h1 className="exe-title">Student Grievances</h1>
          </div>
          <div className="header-stats">
            <div className="stat-pill danger">
              <span className="pulse-dot"></span>
              {complaints.length} Pending Actions
            </div>
          </div>
        </header>

        {loading ? (
          <div className="exe-loader-container">
            <div className="shimmer-text">Accessing Dispute Registry...</div>
          </div>
        ) : (
          <div className="exe-complaint-stack">
            {complaints.length === 0 ? (
              <div className="exe-card-medium empty-state">
                <div className="success-icon">✓</div>
                <h3>Registry Clear</h3>
                <p>All departmental grievances have been officially resolved.</p>
              </div>
            ) : (
              complaints.map((c) => (
                <div key={c._id} className="exe-card-medium grievance-dossier">
                  
                  {/* MASTERFILE INFO */}
                  <div className="dossier-header">
                    <div className="project-meta">
                      <span className="label-tiny">Project Masterfile</span>
                      <h3 className="dossier-project-title">{c.projectId?.title || "Direct Action"}</h3>
                      <div className="petitioner-link">
                        Petitioner: <strong>{c.studentId?.name}</strong>
                      </div>
                    </div>
                    <div className="dossier-timeline">
                      <span className="week-tag">Week {c.milestoneId?.weekNumber}</span>
                    </div>
                  </div>

                  {/* GRIEVANCE STATEMENT */}
                  <div className="statement-zone">
                    <div className="statement-content">
                      <span className="label-tiny">Statement of Reason</span>
                      <p className="statement-text">"{c.reason}"</p>
                      <div className="statement-path">
                        Module: {c.milestoneId?.title}
                      </div>
                    </div>
                  </div>

                  {/* RESOLUTION PORTAL */}
                  <div className="resolution-zone">
                    <div className="input-group">
                      <label className="label-tiny">Formal Resolution Narrative</label>
                      <textarea
                        className="exe-refined-textarea"
                        placeholder="Outline the official resolution or instructional feedback..."
                        value={replies[c._id] || ""}
                        onChange={(e) => handleReplyChange(c._id, e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <footer className="dossier-footer">
                      <p className="footer-disclaimer">
                        Closing this record notifies the student and updates the institutional audit trail.
                      </p>
                      <button 
                        className="exe-btn-primary danger" 
                        onClick={() => resolveComplaint(c._id)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Transmitting..." : "Dispatch Resolution"}
                      </button>
                    </footer>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyComplaints;