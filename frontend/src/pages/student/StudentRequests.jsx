import React, { useEffect, useState, useMemo } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import {
  ClipboardList, Search, User, Users,
  Calendar, Hash, CheckCircle, Clock, XCircle,
  ArrowLeft, PlusCircle, RotateCcw, ChevronRight, ChevronLeft,
  AlertTriangle, Lightbulb, Edit3, Filter
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "./StudentRequests.css";

const PAGE_SIZE = 10;

const StudentRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests]   = useState([]);
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchQ, setSearchQ]     = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [page, setPage]           = useState(1);

  const loadRequests = async () => {
    try {
      const [reqRes, projRes] = await Promise.allSettled([
        api.get("/mentor-requests/my"),
        api.get("/projects/my"),
      ]);
      if (reqRes.status === "fulfilled") {
        const list = Array.isArray(reqRes.value.data?.requests)
          ? reqRes.value.data.requests
          : [];
        setRequests(list);
      }
      if (projRes.status === "fulfilled") {
        setProjects(projRes.value.data?.projects || []);
      }
    } catch (err) {
      console.error("Request load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  // ─── Status Configuration ────────────────────────────────────────────────────
  const statusConfig = {
    APPROVED: {
      cls: "sr-status-approved", cardCls: "sr-card-approved",
      icon: <CheckCircle size={16} />, label: "Approved",
      accentColor: "#10b981", badge: "✓ Mentor Assigned",
    },
    REJECTED: {
      cls: "sr-status-rejected", cardCls: "sr-card-rejected",
      icon: <XCircle size={16} />, label: "Rejected",
      accentColor: "#ef4444", badge: "✗ Not Accepted",
    },
    REJECTED_RECREATE: {
      cls: "sr-status-recreate", cardCls: "sr-card-recreate",
      icon: <RotateCcw size={16} />, label: "Reject & Recreate",
      accentColor: "#f59e0b", badge: "↺ Revision Required",
    },
    PENDING: {
      cls: "sr-status-pending", cardCls: "sr-card-pending",
      icon: <Clock size={16} />, label: "Pending Review",
      accentColor: "#6366f1", badge: "• Awaiting Decision",
    },
  };

  const getStatusCfg = (status) => {
    const s = (status || "PENDING").toUpperCase();
    return statusConfig[s] || statusConfig.PENDING;
  };

  // ─── Filter tabs config ──────────────────────────────────────────────────────
  const filterTabs = [
    { key: "ALL",              label: "All",          icon: <Filter size={13} />,       count: requests.length },
    { key: "APPROVED",         label: "Approved",     icon: <CheckCircle size={13} />,  count: requests.filter(r => r.status === "APPROVED").length },
    { key: "PENDING",          label: "Pending",      icon: <Clock size={13} />,        count: requests.filter(r => r.status === "PENDING").length },
    { key: "REJECTED",         label: "Rejected",     icon: <XCircle size={13} />,      count: requests.filter(r => r.status === "REJECTED").length },
    { key: "REJECTED_RECREATE",label: "Recreated",    icon: <RotateCcw size={13} />,    count: requests.filter(r => r.status === "REJECTED_RECREATE").length },
  ];

  // ─── Filtered + Searched + Paginated ────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...requests];
    if (activeFilter !== "ALL") list = list.filter(r => r.status === activeFilter);
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      list = list.filter(r =>
        (r.projectId?.title || "").toLowerCase().includes(q) ||
        (r.requestedFacultyId?.name || "").toLowerCase().includes(q) ||
        (r._id || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [requests, activeFilter, searchQ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when filter/search changes
  useEffect(() => { setPage(1); }, [activeFilter, searchQ]);

  // ─── Helper: find if a newer request exists for the same project ──────────────
  // A REJECTED_RECREATE is "resolved" if any request for the same project was created AFTER it
  const hasNewerRequestForProject = (recreateReq) =>
    requests.some(
      (other) =>
        other._id !== recreateReq._id &&
        (other.projectId?._id || other.projectId) ===
          (recreateReq.projectId?._id || recreateReq.projectId) &&
        new Date(other.createdAt) > new Date(recreateReq.createdAt)
    );

  // Get the most recent subsequent request for a project (after a recreate)
  const getNewerRequest = (recreateReq) =>
    requests
      .filter(
        (other) =>
          other._id !== recreateReq._id &&
          (other.projectId?._id || other.projectId) ===
            (recreateReq.projectId?._id || recreateReq.projectId) &&
          new Date(other.createdAt) > new Date(recreateReq.createdAt)
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;

  // ─── Alert box: only show REJECTED_RECREATE with NO subsequent request ───────
  const recreateProjects = requests.filter(
    (r) => r.status === "REJECTED_RECREATE" && !hasNewerRequestForProject(r)
  );

  return (
    <div className="sr-root">
      <div className="sr-container">

        {/* ── HEADER ── */}
        <div className="sr-header">
          <button className="sr-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Back
          </button>
          <div className="sr-header-top">
            <div className="sr-header-content">
              <div className="sr-eyebrow">
                <ClipboardList size={14} /> Mentor Requests
              </div>
              <h1 className="sr-title">Request <span className="sr-title-accent">History</span></h1>
              <p className="sr-subtitle">
                Track your mentor consultation statuses and faculty feedback.
              </p>
              {/* Summary chips */}
              <div className="sr-header-stats">
                <div className="sr-stat-chip approved"><CheckCircle size={13} /> {requests.filter(r => r.status === "APPROVED").length} Approved</div>
                <div className="sr-stat-chip rejected"><XCircle size={13} />     {requests.filter(r => r.status === "REJECTED").length} Rejected</div>
                <div className="sr-stat-chip recreate"><RotateCcw size={13} />   {requests.filter(r => r.status === "REJECTED_RECREATE").length} Rework</div>
                <div className="sr-stat-chip pending"><Clock size={13} />         {requests.filter(r => r.status === "PENDING").length} Pending</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── PROMINENT REQUEST A MENTOR HERO ── */}
        <div className="sr-request-mentor-hero">
          <div className="sr-rmh-left">
            <div className="sr-rmh-eyebrow"><Users size={14} /> Faculty Mentorship</div>
            <h2 className="sr-rmh-title">Request a Mentor</h2>
            <p className="sr-rmh-sub">Connect with a faculty expert for your project. Your mentor will guide, review, and validate your work.</p>
            {/* Live stats strip */}
            <div className="sr-rmh-stats">
              <div className="sr-rmh-stat">
                <span className="sr-rmh-stat-num">{requests.length}</span>
                <span className="sr-rmh-stat-label">Total Requests</span>
              </div>
              <div className="sr-rmh-stat">
                <span className="sr-rmh-stat-num">{requests.filter(r => r.status === "APPROVED").length}</span>
                <span className="sr-rmh-stat-label">Approved</span>
              </div>
              <div className="sr-rmh-stat">
                <span className="sr-rmh-stat-num">{requests.filter(r => r.status === "PENDING").length}</span>
                <span className="sr-rmh-stat-label">Pending</span>
              </div>
            </div>
          </div>
          <Link to="/student/request-mentor" className="sr-rmh-btn">
            <PlusCircle size={18} /> New Mentor Request
          </Link>
        </div>

        {/* ── ACTION REQUIRED: RECREATE PROJECTS ── */}
        {recreateProjects.length > 0 && (
          <div className="sr-recreate-alert-box">
            <div className="sr-recreate-alert-header">
              <RotateCcw size={16} color="#f59e0b" />
              <span>Action Required — Request a Mentor for Revised Projects</span>
            </div>
            <p className="sr-recreate-alert-sub">
              These projects were revised based on faculty feedback. Request a new mentor to proceed.
            </p>
            <div className="sr-recreate-project-list">
              {recreateProjects.map((r) => (
                <div key={r._id} className="sr-recreate-project-row">
                  <div className="sr-recreate-proj-info">
                    <AlertTriangle size={14} color="#f59e0b" />
                    <div>
                      <div className="sr-recreate-proj-title">{r.projectId?.title || "Project"}</div>
                      <div className="sr-recreate-proj-sub">Revised &amp; ready for mentor assignment</div>
                    </div>
                  </div>
                  <button
                    className="sr-recreate-request-btn"
                    onClick={() => navigate(`/student/request-mentor?projectId=${r.projectId?._id || ""}&facultyId=${r.requestedFacultyId?._id || ""}&resubmit=1`)}
                  >
                    <Users size={14} /> Request a Mentor
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SEARCH + FILTER BAR ── */}
        <div className="sr-search-filter-bar">
          {/* Search */}
          <div className="sr-search-box">
            <Search size={16} className="sr-search-icon" />
            <input
              type="text"
              placeholder="Search by project, faculty or ID..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              className="sr-search-input"
            />
            {searchQ && (
              <button className="sr-search-clear" onClick={() => setSearchQ("")}>
                <XCircle size={15} />
              </button>
            )}
          </div>

          <div className="sr-sf-divider" />

          {/* Filter Tabs */}
          <div className="sr-filter-tabs">
            {filterTabs.map(tab => (
              <button
                key={tab.key}
                className={`sr-filter-tab ${activeFilter === tab.key ? "active" : ""} sr-tab-${tab.key.toLowerCase().replace("_", "-")}`}
                onClick={() => setActiveFilter(tab.key)}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className="sr-tab-count">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="sr-content">
          {loading ? (
            <div className="sr-loader">
              <div className="sr-spin" />
              <span>Loading Requests...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="sr-empty">
              <Search size={64} className="sr-empty-icon" />
              <h3>No Requests Yet</h3>
              <p>You haven't sent any mentor requests. Start by requesting a mentor for your project.</p>
              <Link to="/student/request-mentor" className="sr-btn-primary">
                <PlusCircle size={18} /> Request a Mentor
              </Link>
            </div>
          ) : paged.length === 0 ? (
            <div className="sr-empty">
              <Search size={48} className="sr-empty-icon" />
              <h3>No Matches Found</h3>
              <p>No requests match your current search or filter. Try adjusting them.</p>
            </div>
          ) : (
            <>
              {/* Results info */}
              <div className="sr-results-info">
                Showing <strong>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong> requests
              </div>

              <div className="sr-cards">
                {paged.map((r) => {
                  const cfg = getStatusCfg(r.status);
                  const hasRejection = r.status === "REJECTED" || r.status === "REJECTED_RECREATE";
                  const hasRecreate  = r.status === "REJECTED_RECREATE";

                  // For REJECTED_RECREATE cards: check if a newer request was already submitted
                  const newerReq     = hasRecreate ? getNewerRequest(r) : null;
                  const hasNewer     = !!newerReq;
                  const newerCfg     = newerReq ? getStatusCfg(newerReq.status) : null;

                  return (
                    <div
                      key={r._id}
                      className={`sr-card ${cfg.cardCls}`}
                      style={{ "--accent": cfg.accentColor }}
                    >
                      {/* Accent left bar */}
                      <div className="sr-card-accent" style={{ background: cfg.accentColor }} />

                      {/* Card Header */}
                      <div className="sr-card-top">
                        <div className="sr-card-title-area">
                          <div className="sr-card-eyebrow">Project</div>
                          <h3 className="sr-card-project">{r.projectId?.title || "Untitled Project"}</h3>
                        </div>
                        <div className={`sr-status-badge ${cfg.cls}`}>
                          {cfg.icon}
                          <span>{cfg.label}</span>
                        </div>
                      </div>

                      {/* Faculty Info */}
                      <div className="sr-faculty-row" style={{ borderLeftColor: cfg.accentColor }}>
                        <div className="sr-faculty-avatar" style={{ background: cfg.accentColor }}>
                          {r.requestedFacultyId?.name?.[0] || "F"}
                        </div>
                        <div>
                          <div className="sr-faculty-role">Faculty Mentor</div>
                          <div className="sr-faculty-name">{r.requestedFacultyId?.name || "Pending Assignment"}</div>
                          {r.requestedFacultyId?.department && (
                            <div className="sr-faculty-dept">{r.requestedFacultyId.department}</div>
                          )}
                        </div>
                      </div>

                      {/* Message */}
                      {r.message && (
                        <div className="sr-message-box">
                          <div className="sr-section-label">Your Message</div>
                          <p className="sr-message-text">"{r.message}"</p>
                        </div>
                      )}

                      {/* ── APPROVED STATUS BANNER ── */}
                      {r.status === "APPROVED" && (
                        <div className="sr-feedback-approved">
                          <CheckCircle size={20} className="sr-fdbk-icon" />
                          <div>
                            <div className="sr-fdbk-title approved">Mentor Approved!</div>
                            <p className="sr-fdbk-text">Your mentor request has been accepted. Your mentor is now assigned to your project.</p>
                          </div>
                        </div>
                      )}

                      {/* ── REJECTION FEEDBACK ── */}
                      {hasRejection && (r.reason || r.suggestions) && (
                        <div className={`sr-feedback-panel ${hasRecreate ? "recreate" : "rejected"}`}>
                          <div className="sr-fdbk-header">
                            {hasRecreate
                              ? <><RotateCcw size={16} /> <span>Faculty Feedback — Revision Required</span></>
                              : <><XCircle size={16} /> <span>Faculty Feedback — Request Rejected</span></>
                            }
                          </div>
                          {r.reason && (
                            <div className="sr-fdbk-section">
                              <div className="sr-fdbk-section-label reason-label">
                                <AlertTriangle size={11} /> Reason
                              </div>
                              <p className="sr-fdbk-content">{r.reason}</p>
                            </div>
                          )}
                          {r.suggestions && (
                            <div className="sr-fdbk-section">
                              <div className="sr-fdbk-section-label suggestions-label">
                                <Lightbulb size={11} /> Suggestions
                              </div>
                              <p className="sr-fdbk-content">{r.suggestions}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── RECREATE: actions or final status ── */}
                      {hasRecreate && r.projectId?._id && (
                        <>
                          {hasNewer ? (
                            /* New request already submitted — show its final status */
                            <div className="sr-resubmitted-status">
                              <div className={`sr-resubmit-banner sr-resubmit-${newerReq.status.toLowerCase().replace("_", "-")}`}>
                                {newerCfg?.icon}
                                <div>
                                  <div className="sr-resubmit-label">New request submitted</div>
                                  <div className="sr-resubmit-status-text">
                                    {newerReq.status === "APPROVED"  && "✓ Mentor Approved — your revised project is now under mentorship."}
                                    {newerReq.status === "PENDING"   && "• Awaiting faculty decision on your re-submitted request."}
                                    {newerReq.status === "REJECTED"  && "✗ New request rejected. You may request a different mentor."}
                                    {newerReq.status === "REJECTED_RECREATE" && "↺ Further revision required by mentor."}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* No newer request yet — show action buttons */
                            <div className="sr-action-row sr-recreate-actions">
                              {!r.projectRegenerated ? (
                                <button
                                  className="sr-modify-btn"
                                  onClick={() => {
                                    const reason      = encodeURIComponent(r.reason || "");
                                    const suggestions = encodeURIComponent(r.suggestions || "");
                                    navigate(`/student/edit-project/${r.projectId._id}?reason=${reason}&suggestions=${suggestions}&requestId=${r._id}`);
                                  }}
                                >
                                  <Edit3 size={16} /> Modify Project Based on Feedback
                                  <ChevronRight size={16} />
                                </button>
                              ) : (
                                <div className="sr-regenerated-badge">
                                  <CheckCircle size={16} />
                                  <span>Project Revised — Ready for New Mentor Request</span>
                                </div>
                              )}
                              <button
                                className="sr-request-mentor-after-recreate"
                                onClick={() => navigate(`/student/request-mentor?projectId=${r.projectId._id}&facultyId=${r.requestedFacultyId?._id || ""}&resubmit=1`)}
                              >
                                <Users size={15} /> Request a Mentor
                              </button>
                            </div>
                          )}
                        </>
                      )}

                      {/* Footer Meta */}
                      <div className="sr-card-footer">
                        <div className="sr-meta">
                          <Calendar size={13} />
                          <span>{new Date(r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        </div>
                        <div className="sr-meta">
                          <Hash size={13} />
                          <span className="sr-ref-id">{r._id.substring(0, 8).toUpperCase()}</span>
                        </div>
                        <div className={`sr-action-badge ${cfg.cls}`}>{cfg.badge}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── PAGINATION ── */}
              {totalPages > 1 && (
                <div className="sr-pagination">
                  <button
                    className="sr-page-btn"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>

                  <div className="sr-page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        className={`sr-page-num ${n === page ? "active" : ""}`}
                        onClick={() => setPage(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  <button
                    className="sr-page-btn"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentRequests;