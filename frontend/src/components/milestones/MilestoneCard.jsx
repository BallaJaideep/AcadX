import { useState } from "react";
import TaskItem from "./TaskItem";
import ComplaintBox from "./ComplaintBox";
import api from "../../api/client";
import { CheckCircle2, Info, Plane, Hash, Activity, Zap, MessageSquare, ShieldAlert } from "lucide-react";
import { ensureAbsoluteUrl } from "../../utils/linkUtils";
import "./MilestoneCard.css";

/**
 * MilestoneCard Component
 * Represents a weekly academic phase with tasks, resources, and a dedicated Doubt Portal.
 */
const MilestoneCard = ({ milestone, role, reload }) => {
  const [showDoubtCenter, setShowDoubtCenter] = useState(false);
  
  const tasks = Array.isArray(milestone.tasks) ? milestone.tasks : [];
  const completedTasks = tasks.filter((t) => t.status === "completed" || t.status === "done").length;
  const totalTasks = tasks.length;

  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const allDone = totalTasks > 0 && tasks.every((t) => t.status === "completed" || t.status === "done");
  const isCompleted = milestone.status === "completed";

  const completeWeek = async () => {
    try {
      await api.patch(`/milestones/${milestone._id}/complete`);
      await reload();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to finalize week");
    }
  };

  const selectAllTasks = async () => {
    try {
      await api.patch(`/milestones/${milestone._id}/tasks/complete`);
      await reload();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to validate tasks");
    }
  };

  const getStatusCfg = () => {
    if (isCompleted) return { label: "ARRIVED", cls: "final", color: "#10b981", icon: <CheckCircle2 size={14} /> };
    return { label: "IN FLIGHT", cls: "active", color: "#3B82F6", icon: <Plane size={14} /> };
  };

  const cfg = getStatusCfg();

  return (
    <div className={`vp-milestone-ticket-wrapper ${isCompleted ? "finalized" : ""} ${showDoubtCenter ? "portal-active" : ""}`}>
      {/* MAIN TICKET BODY */}
      <div className="vp-milestone-main-pass">
        <div className="vp-m-card-header">
          <div className="ticket-branding">
            <Hash size={16} />
            <span>ACADX AIRLINES · ACADEMIC DIVISION</span>
          </div>
          <div className="ticket-gate-info">
            <span className="gate-label">PHASE</span>
            <span className="gate-value">{milestone.title.split(' ')[1] || '01'}</span>
          </div>
        </div>

        <div className="vp-m-ticket-content">
          <div className="vp-m-title-row">
            <h4 className="vp-m-ticket-title">{milestone.title}</h4>
            <div className="vp-m-header-actions">
              <div className={`vp-m-boarding-status ${cfg.cls}`}>
                {cfg.icon} <span>{cfg.label}</span>
              </div>
              <button 
                className={`doubt-portal-toggle ${showDoubtCenter ? 'is-active' : ''}`}
                onClick={() => setShowDoubtCenter(!showDoubtCenter)}
              >
                <MessageSquare size={14} /> 
                {showDoubtCenter ? "CLOSE CENTER" : "DOUBT PORTAL"}
                {milestone.complaints?.length > 0 && <span className="doubt-badge">{milestone.complaints.length}</span>}
              </button>
            </div>
          </div>

          <div className={`vp-m-scroll-content ${showDoubtCenter ? 'is-portal' : ''}`}>
            {!showDoubtCenter ? (
              <div className="standard-view fade-in">
                <p className="vp-m-ticket-desc">{milestone.description}</p>

                {/* AI Learning Resources */}
                <div className="vp-m-ai-resources">
                  <div className="label-small-gold"><Zap size={12} /> AI RECOMMENDED RESOURCES</div>
                  <div className="resources-grid">
                    {milestone.youtubeLinks?.map((link, i) => (
                      <a key={i} href={ensureAbsoluteUrl(link)} target="_blank" rel="noopener noreferrer" className="res-link yt">
                        🎥 Video Tutorial
                      </a>
                    ))}
                    {milestone.tutorialLinks?.map((link, i) => (
                      <a key={i} href={ensureAbsoluteUrl(link)} target="_blank" rel="noopener noreferrer" className="res-link tut">
                        📖 Tech Guide
                      </a>
                    ))}
                    {milestone.documentLinks?.map((link, i) => (
                      <a key={i} href={ensureAbsoluteUrl(link)} target="_blank" rel="noopener noreferrer" className="res-link doc">
                        📜 Official Docs
                      </a>
                    ))}
                  </div>
                </div>

                {/* Progress Section */}
                <div className="vp-m-ticket-progress-zone">
                  <div className="progress-meta">
                    <span className="percent">{progress}% COMPLETION</span>
                    <Activity size={12} className="pulse-icon" />
                  </div>
                  <div className="progress-rail">
                    <div className="progress-fill" style={{ width: `${progress}%`, background: cfg.color }} />
                  </div>
                </div>

                {/* Task Directory */}
                <div className="vp-m-task-list">
                  {tasks.map((task) => (
                    <TaskItem
                      key={task._id}
                      task={task}
                      reload={reload}
                      disabled={role !== "student" || isCompleted}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="doubt-portal-view fade-in">
                <div className="center-header">
                  <ShieldAlert size={16} /> 
                  <span>INSTITUTIONAL DOUBT RESOLUTION CENTER</span>
                </div>
                <ComplaintBox 
                  milestoneId={milestone._id} 
                  reload={reload} 
                  existingComplaints={milestone.complaints || []} 
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Protocols */}
        {role === "student" && !isCompleted && !showDoubtCenter && (
          <div className="vp-m-ticket-actions">
            <button className="ticket-btn secondary" onClick={selectAllTasks} disabled={allDone}>
              {allDone ? "ALL TASKS LOGGED" : "VALIDATE ALL TASKS"}
            </button>
            <button className="ticket-btn primary" disabled={!allDone} onClick={completeWeek}>
              {allDone ? "CONFIRM ARRIVAL" : "FINALIZE PHASE"}
            </button>
          </div>
        )}
      </div>

      {/* TICKET STUB (SIDE) */}
      <div className="vp-milestone-stub">
        <div className="perforation-line" />
        <div className="stub-content">
          <div className="stub-top">
            <span className="stub-label">BOARDING PASS</span>
            <span className="stub-id">{milestone._id.slice(-6).toUpperCase()}</span>
          </div>
          <div className="stub-middle">
            <div className="stub-stat">
              <span className="lab">TASKS</span>
              <span className="val">{completedTasks}/{totalTasks}</span>
            </div>
          </div>
          <div className="stub-barcode">
            <div className="barcode-bars">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="bar" style={{ width: `${Math.random() * 3 + 1}px` }} />
              ))}
            </div>
            <span className="barcode-text">ACX-{milestone._id.slice(-4)}</span>
          </div>
          <div className="stub-footer">
            <span className="footer-tag">GATE 402</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneCard;