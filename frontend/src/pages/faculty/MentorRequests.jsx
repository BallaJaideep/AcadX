import React, { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import "./MentorRequests.css";

const MentorRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [rejectForm, setRejectForm] = useState({ id: null, reason: "", suggestions: "" });

  if (!user) return <Navigate to="/login" replace />;
  if (!["faculty", "hod", "admin"].includes(user.role)) {
    return <Navigate to="/student/projects" replace />;
  }

  const loadRequests = useCallback(async () => {
    setActionError("");
    setLoading(true);
    try {
      const res = await api.get("/mentor-requests/incoming");
      const arr = Array.isArray(res.data?.requests) ? res.data.requests : (Array.isArray(res.data) ? res.data : []);
      setRequests(arr);
    } catch (err) {
      setActionError("Failed to synchronize with request registry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
    const id = setInterval(loadRequests, 60000); // Polling every 1 minute for executive stability
    return () => clearInterval(id);
  }, [loadRequests]);

  const handleDecision = async (id, decision, extra = {}) => {
    setActionError("");
    setBusyId(id);
    try {
      await api.post(`/mentor-requests/${id}/decision`, { decision, ...extra });
      setRequests((prev) => prev.filter((r) => r._id !== id));
      setRejectForm({ id: null, reason: "", suggestions: "" });
    } catch (err) {
      const msg = err.response?.data?.message || "Decision transmission failed.";
      const details = err.response?.data?.details;
      setActionError(`${msg}${details ? " : " + details.join(", ") : ""}`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="exe-wrapper">
      <div className="exe-view-container">
        
        <header className="exe-view-header">
          <div className="header-text">
            <span className="exe-tag">Advisory Oversight</span>
            <h1 className="exe-title">Incoming Mentor Requests</h1>
          </div>
          <div className="request-counter">
            <span className="count-label">{requests.length} Pending Actions</span>
          </div>
        </header>

        {actionError && <div className="exe-alert error">{actionError}</div>}

        {loading ? (
          <div className="exe-loader-container">
            <div className="shimmer-text">Accessing Secure Queue...</div>
          </div>
        ) : requests.length === 0 ? (
          <div className="exe-empty-state-box">
            <p>Your advisory queue is currently clear.</p>
          </div>
        ) : (
          <div className="exe-request-stack">
            {requests.map((r) => (
              <div key={r._id} className="exe-card-medium request-item">
                <div className="request-card-grid">
                  
                  {/* PROJECT & STUDENT INFO */}
                  <div className="request-details">
                    <span className="label-tiny">Project Title</span>
                    <h3 className="request-project-title">{r.projectId?.title || "Untitled Project"}</h3>
                    
                    <div className="petitioner-info">
                      <div className="info-group">
                        <span className="label-tiny">Student Petitioner</span>
                        <p className="info-text">{r.studentId?.name || "N/A"}</p>
                      </div>
                      <div className="info-group">
                        <span className="label-tiny">Email Identifier</span>
                        <p className="info-text">{r.studentId?.email || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* PROPOSAL MESSAGE */}
                  <div className="request-proposal">
                    <span className="label-tiny">Proposal Brief</span>
                    <p className="proposal-text">"{r.message || "No contextual message provided."}"</p>
                  </div>

                  {/* ACTION FOOTER */}
                  <div className="request-actions-container" style={{ gridColumn: "1 / -1", marginTop: "20px" }}>
                    {rejectForm.id === r._id ? (
                      <div className="reject-recreate-panel" style={{ width: "100%", background: "#fef3c7", padding: "20px", borderRadius: "12px" }}>
                        <textarea 
                          className="acadx-input-mini" 
                          placeholder="Reason for rejection..."
                          style={{ width: "100%", marginBottom: "10px" }}
                          value={rejectForm.reason}
                          onChange={(e) => setRejectForm(f => ({...f, reason: e.target.value}))}
                        />
                        <textarea 
                          className="acadx-input-mini" 
                          placeholder="Suggestions for student..."
                          style={{ width: "100%", marginBottom: "15px" }}
                          value={rejectForm.suggestions}
                          onChange={(e) => setRejectForm(f => ({...f, suggestions: e.target.value}))}
                        />
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            onClick={() => handleDecision(r._id, "REJECT_AND_RECREATE", { reason: rejectForm.reason, suggestions: rejectForm.suggestions })}
                            className="exe-btn-success-sm"
                            style={{ background: "#f59e0b" }}
                            disabled={busyId === r._id}
                          >
                            Confirm & Recreate
                          </button>
                          <button
                            onClick={() => setRejectForm({ id: null, reason: "", suggestions: "" })}
                            className="exe-btn-danger-sm"
                            style={{ background: "transparent", color: "#64748b", border: "1px solid #e2e8f0" }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="request-actions" style={{ display: "flex", gap: "12px" }}>
                        <button
                          onClick={() => handleDecision(r._id, "APPROVE")}
                          className="exe-btn-success-sm"
                          disabled={busyId === r._id}
                        >
                          <CheckCircle2 size={14} style={{ marginRight: 6 }} /> Approve
                        </button>
                        <button
                          onClick={() => handleDecision(r._id, "REJECT")}
                          className="exe-btn-danger-sm"
                          disabled={busyId === r._id}
                        >
                          <XCircle size={14} style={{ marginRight: 6 }} /> Decline
                        </button>
                        <button
                          onClick={() => setRejectForm({ id: r._id, reason: "", suggestions: "" })}
                          className="exe-btn-success-sm"
                          style={{ background: "#f59e0b" }}
                          disabled={busyId === r._id}
                        >
                          <RotateCcw size={14} style={{ marginRight: 6 }} /> Reject & Recreate
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorRequests;