import { useState } from "react";
import api from "../../api/client";
import AISuggestions from "./AISuggestions";
import { CheckCircle2, Zap, MessageSquare, AlertTriangle, ChevronDown, ChevronUp, History } from "lucide-react";
import "./ComplaintBox.css";

/**
 * ComplaintBox Component
 * Handles student doubts, AI diagnostics, and faculty resolutions.
 * Supports multiple doubts and history tracking.
 */
const ComplaintBox = ({ milestoneId, reload, existingComplaints = [] }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeDoubtId, setActiveDoubtId] = useState(null);

  const complaints = Array.isArray(existingComplaints) ? existingComplaints : [];
  const latestComplaint = complaints[0] || null;

  const submitComplaint = async () => {
    if (!text.trim()) return;
    try {
      setLoading(true);
      await api.post(`/milestones/${milestoneId}/complaint`, { reason: text });
      setText("");
      reload();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to submit help request");
    } finally {
      setLoading(false);
    }
  };

  const acceptAI = async (id) => {
    try {
      await api.patch(`/milestones/complaints/${id}/accept-ai`);
      reload();
    } catch (err) {
      alert("Failed to accept AI suggestions");
    }
  };

  const rejectAI = () => {
    alert("Doubt escalated to faculty review.");
    reload();
  };

  return (
    <div className="exe-support-system">
      {/* ── NEW DOUBT INTERFACE ── */}
      <div className="support-request-panel">
        <label className="label-small"><MessageSquare size={12} /> INITIALIZE NEW DOUBT PROTOCOL</label>
        <div className="input-wrapper">
          <textarea
            className="exe-textarea-v2"
            placeholder="Describe your technical challenge or research bottleneck..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={latestComplaint ? 2 : 4}
          />
          <button 
            className="vp-btn-glow" 
            onClick={submitComplaint} 
            disabled={loading || !text.trim()}
          >
            {loading ? "PROCESSING..." : "ASK DOUBT"}
          </button>
        </div>
      </div>

      {/* ── ACTIVE / LATEST DOUBT ── */}
      {latestComplaint && (
        <div className="active-doubt-focus">
          <div className="label-small-muted">ACTIVE GUIDANCE REQUEST</div>
          <DoubtCard 
            complaint={latestComplaint} 
            onAcceptAI={acceptAI} 
            onRejectAI={rejectAI}
            isLatest={true}
          />
        </div>
      )}

      {/* ── HISTORY TOGGLE ── */}
      {complaints.length > 1 && (
        <div className="history-toggle-area">
          <button className="history-btn" onClick={() => setShowHistory(!showHistory)}>
            <History size={14} /> 
            {showHistory ? "HIDE DOUBT HISTORY" : `VIEW PREVIOUS DOUBTS (${complaints.length - 1})`}
            {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      )}

      {/* ── DOUBT HISTORY LIST ── */}
      {showHistory && (
        <div className="doubt-history-list">
          {complaints.slice(1).map((c) => (
            <DoubtCard 
              key={c._id} 
              complaint={c} 
              onAcceptAI={acceptAI} 
              onRejectAI={rejectAI}
              isHistory={true}
              isOpen={activeDoubtId === c._id}
              onToggle={() => setActiveDoubtId(activeDoubtId === c._id ? null : c._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * DoubtCard Sub-component
 * Displays individual doubt, status, and associated guidance.
 */
const DoubtCard = ({ complaint, onAcceptAI, onRejectAI, isLatest, isHistory, isOpen, onToggle }) => {
  const status = complaint.status || "PENDING";
  
  return (
    <div className={`doubt-card ${status.toLowerCase()} ${isHistory ? 'history-item' : ''} ${isOpen ? 'is-open' : ''}`}>
      <div className="doubt-card-header" onClick={isHistory ? onToggle : undefined}>
        <div className="doubt-summary">
          {status === "RESOLVED" ? <CheckCircle2 size={16} className="status-icon resolved" /> : <Zap size={16} className="status-icon pending" />}
          <p className="reason-preview">"{complaint.reason}"</p>
        </div>
        <div className="doubt-meta">
          <span className="timestamp">{new Date(complaint.createdAt).toLocaleDateString()}</span>
          {isHistory && (isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </div>
      </div>

      {(isLatest || isOpen) && (
        <div className="doubt-card-body fade-in">
          {/* AI Suggestions section */}
          {complaint.aiSuggestions?.length > 0 && status === "PENDING" && (
            <div className="ai-diagnostic-result">
              <div className="label-tiny-gold"><Zap size={10} /> AI DIAGNOSTICS</div>
              <AISuggestions
                suggestions={complaint.aiSuggestions}
                onAccept={() => onAcceptAI(complaint._id)}
                onReject={onRejectAI}
              />
            </div>
          )}

          {/* Faculty Response section */}
          {status === "RESOLVED" && complaint.facultyResponse && (
            <div className="faculty-resolution-block">
              <div className="label-tiny-success"><CheckCircle2 size={10} /> FACULTY GUIDANCE</div>
              <p className="resolution-text">{complaint.facultyResponse}</p>
            </div>
          )}

          {/* Escalated state */}
          {status === "PENDING" && complaint.aiSuggestions?.length === 0 && (
            <div className="escalated-notice">
              <AlertTriangle size={14} />
              <span>Awaiting mentor response...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComplaintBox;