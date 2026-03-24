import { useState } from "react";
import api from "../../api/client";
import "./RaiseHodComplaint.css";
import { AlertCircle, Send, MessageSquare, ShieldAlert } from "lucide-react";

const RaiseHodComplaint = () => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!reason.trim()) {
      alert("Please provide a detailed reason for your complaint.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/hod-complaints", { reason });
      alert("Grievance officially submitted to HOD registry.");
      setReason("");
    } catch (err) {
      alert("Failed to transmit complaint. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rhc-viewport">
      <div className="rhc-container">
        {/* Header Section */}
        <div className="rhc-header">
          <div className="rhc-tag">
            <ShieldAlert size={14} /> Official Grievance
          </div>
          <h1 className="rhc-title">Raise Complaint to HOD</h1>
          <p className="rhc-subtitle">
            Submit your concerns directly to the Head of Department for official review and resolution.
          </p>
        </div>

        {/* Complaint Form */}
        <div className="rhc-form-group">
          <div className="rhc-label-row">
            <MessageSquare size={16} /> STATEMENT OF REASON
          </div>
          <textarea
            className="rhc-textarea"
            placeholder="Describe your issue or grievance in detail..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        {/* Action Area */}
        <div className="rhc-cta-box">
          <div className="rhc-info-note">
            <AlertCircle size={14} />
            <span>Formal submission requires descriptive details.</span>
          </div>
          <button
            className="rhc-submit-btn"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "TRANSMITTING..." : (
              <>
                SUBMIT COMPLAINT <Send size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RaiseHodComplaint;
