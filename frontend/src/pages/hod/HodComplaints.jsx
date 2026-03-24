import { useEffect, useState } from "react";
import api from "../../api/client";
import { 
  ShieldAlert, 
  MessageSquare, 
  CheckCircle2, 
  Activity, 
  User,
  Clock,
  Command,
  FileText,
  AlertCircle
} from "lucide-react";
import "./HodComplaints.css";

const HodComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/hod-complaints");
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error("Failed to load grievances.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resolve = async (id) => {
    const response = prompt("OFFICIAL EXECUTIVE RESOLUTION:\nPlease provide the official departmental verdict for this grievance.");
    if (!response) return;

    try {
      await api.patch(`/hod-complaints/${id}/resolve`, {
        hodResponse: response,
      });
      load();
    } catch (err) {
      alert("Resolution transmission failed.");
    }
  };

  return (
    <div className="hod-root">
      <div className="hod-executive-container">
        
        {/* EXECUTIVE HEADER */}
        <header className="hod-panoramic-mini">
          <div className="header-meta">
            <div className="auth-badge-small">
              <ShieldAlert size={14} /> <span>Security Protocol 401</span>
            </div>
            <h1 className="executive-view-title">Grievance <span className="gold-text">Oversight Command</span></h1>
            <p className="executive-view-subtitle">Monitor and resolve departmental conflicts with administrative precision.</p>
          </div>
          <div className="executive-stats-pill">
            <Activity size={18} className="pulse-icon-gold" />
            <div className="stat-v">
              <span className="count">{complaints.length}</span>
              <span className="label">ACTIVE CASES</span>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="executive-loader">
            <div className="loader-ring"></div>
            <span className="shimmer-text">Synchronizing Registry...</span>
          </div>
        ) : complaints.length === 0 ? (
          <div className="executive-empty-state">
            <div className="empty-ico-frame">
              <Command size={64} className="ghost-icon" />
            </div>
            <h3>Grievance Registry Clear</h3>
            <p>No active disciplinary or academic grievances currently require executive intervention.</p>
          </div>
        ) : (
          <div className="protocol-card-stack">
            {complaints.map((c) => (
              <div key={c._id} className={`protocol-card ${c.status.toLowerCase()}`}>
                <div className="protocol-side-accent" />
                
                <div className="protocol-card-header">
                  <div className="petitioner-profile">
                    <div className="profile-orb">
                      {c.studentId?.name?.[0] || "?"}
                    </div>
                    <div className="profile-info">
                      <span className="id-tag">PETITIONER ENTRY</span>
                      <h4 className="petitioner-name">{c.studentId?.name || "Unknown Entity"}</h4>
                    </div>
                  </div>
                  <div className={`protocol-status-badge ${c.status.toLowerCase()}`}>
                    <div className="status-dot-glow"></div>
                    <span>{c.status} STATUS</span>
                  </div>
                </div>

                <div className="protocol-card-body">
                  <div className="statement-metadata">
                    <MessageSquare size={14} className="text-gold" />
                    <span>FORMAL STATEMENT OF REASON</span>
                  </div>
                  <div className="grievance-manifesto">
                    {c.reason}
                  </div>
                </div>

                <div className="protocol-card-footer">
                  {c.status === "PENDING" ? (
                    <div className="action-row">
                      <div className="security-info">
                        <AlertCircle size={14} />
                        <span>Resolution protocol required for case closure</span>
                      </div>
                      <button onClick={() => resolve(c._id)} className="executive-resolve-btn">
                        EXECUTE RESOLUTION <CheckCircle2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="verdict-display">
                      <div className="verdict-label">
                        <FileText size={14} className="text-gold" />
                        <span>OFFICIAL DEPARTMENTAL VERDICT</span>
                      </div>
                      <p className="verdict-text">{c.hodResponse || "Case closed by Administrative Decree."}</p>
                      <div className="timestamp-row">
                        <Clock size={12} />
                        <span>Finalized on {new Date(c.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HodComplaints;