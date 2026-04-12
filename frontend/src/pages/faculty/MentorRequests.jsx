import React, { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { RotateCcw, CheckCircle2, XCircle, Users, Zap } from "lucide-react";
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
            {requests.map((request) => (
              <div key={request._id} className="exe-card-medium request-item">
                <div className="request-card-grid">
                  <div className="request-project-hdr">
                    <h3 className="request-project-title">
                      {request.projectId?.title || "Project Title Unavailable"}
                    </h3>
                    <div className="request-counter">
                      ID: {request.projectId?.projectId || "N/A"}
                    </div>
                  </div>

                  <div className="petitioner-info">
                    <div className="info-text">
                      <Users size={14} /> 
                      <strong>{request.studentId?.name || "Unknown Student"}</strong>
                    </div>
                    <div className="info-text">
                      <Zap size={14} /> 
                      Sem {request.studentId?.semester || "N/A"} • {request.studentId?.department || "N/A"}
                    </div>
                  </div>

                  <div className="proposal-box">
                    <span className="proposal-label">Project Proposal Excerpt</span>
                    <p className="proposal-text">
                      {request.projectId?.description 
                        ? (request.projectId.description.length > 200 
                            ? request.projectId.description.substring(0, 200) + "..." 
                            : request.projectId.description)
                        : "No description provided for this project."
                      }
                    </p>
                  </div>

                  <div className="request-actions-container" style={{ gridColumn: "1 / -1", marginTop: "20px" }}>
                    {rejectForm.id === request._id ? (
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
                            onClick={() => handleDecision(request._id, "REJECT_AND_RECREATE", { reason: rejectForm.reason, suggestions: rejectForm.suggestions })}
                            className="exe-btn exe-btn-success-sm"
                            style={{ background: "#f59e0b" }}
                            disabled={busyId === request._id}
                          >
                            Confirm & Recreate
                          </button>
                          <button
                            onClick={() => setRejectForm({ id: null, reason: "", suggestions: "" })}
                            className="exe-btn exe-btn-danger-sm"
                            style={{ background: "transparent", color: "#64748b", border: "1px solid #e2e8f0" }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="request-actions">
                        <button
                          onClick={() => handleDecision(request._id, "APPROVE")}
                          className="exe-btn exe-btn-success-sm"
                          disabled={busyId === request._id}
                        >
                          <CheckCircle2 size={16} /> Accept Mentorship
                        </button>
                        <button
                          onClick={() => handleDecision(request._id, "REJECT")}
                          className="exe-btn exe-btn-danger-sm"
                          disabled={busyId === request._id}
                        >
                          <XCircle size={16} /> Decline
                        </button>
                        <button
                          onClick={() => setRejectForm({ id: request._id, reason: "", suggestions: "" })}
                          className="exe-btn exe-btn-success-sm"
                          style={{ background: "#f59e0b", flex: '1.2' }}
                          disabled={busyId === request._id}
                        >
                          <RotateCcw size={16} /> Re-do
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