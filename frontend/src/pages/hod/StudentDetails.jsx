import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Trash2, 
  Zap, 
  FileText, 
  Award, 
  Target, 
  CheckCircle2, 
  Activity,
  User,
  ExternalLink,
  Layers
} from "lucide-react";
import { fileUrl } from "../../utils/fileUrl";
import "./AuditPages.css";

const StudentDetails = () => {
  const { studentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/hod/student/${studentId}`);
        setData(res.data);
      } catch (err) {
        setError("Administrative records inaccessible for this student entity.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId]);

  const handleDelete = async () => {
    if (!window.confirm("CRITICAL WARNING: You are about to permanently delete this student and ALL associated project data. This action cannot be revoked. Proceed?")) return;
    try {
      await api.delete(`/hod/student/${studentId}`);
      navigate("/hod/student-directory");
    } catch (err) {
      alert(err.response?.data?.message || "Termination protocol failed.");
    }
  };

  if (loading) return (
    <div className="hod-loader-container">
      <div className="executive-spinner"></div>
      <div className="shimmer-text">Synchronizing Student Intelligence Dossier...</div>
    </div>
  );

  if (error) return (
    <div className="audit-root">
       <div className="error-state-panel">
          <ShieldCheck size={48} className="error-icon" />
          <h3>Registry Extraction Failed</h3>
          <p>{error}</p>
          <button className="reauth-btn" onClick={() => navigate("/hod/student-directory")}>Back to Student Directory</button>
       </div>
    </div>
  );

  const { student, projects = [] } = data;
  const completedCount = projects.filter(p => p.status === "completed").length;
  const activeProject = projects.find(p => p.status !== "completed");

  return (
    <div className="audit-root">
      
      {/* EXECUTIVE DOSSIER HEADER */}
      <header className="audit-header-panoramic">
        <div className="audit-back-btn" onClick={() => navigate("/hod/student-directory")}>
          <ArrowLeft size={16} /> STUDENT DIRECTORY ARCHIVE
        </div>
        
        <div className="audit-profile-row">
          <div className="audit-avatar-frame">
            {student.profilePhoto ? (
              <img src={fileUrl(student.profilePhoto)} alt="" />
            ) : student.name?.charAt(0)}
          </div>
          <div className="audit-identity">
            <h1>{student.name}</h1>
            <p>{student.email} — {student.department || "General"} Department</p>
            <div className="audit-tag-row">
              <span className="audit-badge role">Semester {student.semester || "X"}</span>
              <span className={`audit-badge ${student.isActive ? 'active' : 'inactive'}`}>
                {student.isActive ? "ACTIVE" : "SUSPENDED"}
              </span>
            </div>
          </div>
        </div>

        <div className="audit-actions">
           <button className="audit-btn-danger" onClick={handleDelete}>
              <Trash2 size={14} style={{ marginRight: 8, verticalAlign: 'middle' }} /> 
              DELETE ENTITY
           </button>
        </div>
      </header>

      {/* STRATEGIC METRICS GRID */}
      <div className="audit-metrics-grid">
         <div className="audit-metric-card">
            <span className="amc-label">Engagement Index</span>
            <span className="amc-value" style={{ color: "#D4AF37" }}>{student.points || 0}</span>
            <div className="amc-footer gold">Platform points</div>
         </div>
         <div className="audit-metric-card">
            <span className="amc-label">Portfolio Modules</span>
            <span className="amc-value">{projects.length}</span>
            <div className="amc-footer blue">Active tracks</div>
         </div>
         <div className="audit-metric-card">
            <span className="amc-label">Finalized Projects</span>
            <span className="amc-value">{completedCount}</span>
            <div className="amc-footer green">Validated units</div>
         </div>
         <div className="audit-metric-card">
            <span className="amc-label">Merit Badges</span>
            <span className="amc-value">{(student.badges || []).length}</span>
            <div className="amc-footer">Institutional awards</div>
         </div>
      </div>

      <div className="audit-main-layout">
        
        {/* PROJECT PORTFOLIO DOSSIER */}
        <section className="dossier-card">
          <div className="dossier-header">
             <h3 className="dossier-title">Project Portfolio</h3>
             <span className="registry-count">{projects.length} Projects</span>
          </div>
          
          <div className="dossier-table-wrap">
             <table className="dossier-table">
                <thead>
                   <tr>
                      <th>Track</th>
                      <th>Status</th>
                      <th>Progress</th>
                      <th>Mentor Assignment</th>
                   </tr>
                </thead>
                <tbody>
                   {projects.map(p => (
                      <tr key={p._id}>
                         <td><span className="entity-name-main">{p.title}</span></td>
                         <td>
                           <span className={`status-pill-small ${p.status}`}>
                             {p.status.toUpperCase()}
                           </span>
                         </td>
                         <td>
                            <div className="dossier-progress-block" style={{ minWidth: '180px' }}>
                               <div className="dossier-progress-rail">
                                  <div className="dossier-progress-fill" style={{width: `${p.progress || 0}%`}} />
                               </div>
                               <span className="proj-percent" style={{ marginTop: 8, display: 'block' }}>{p.progress || 0}% LOGGED</span>
                            </div>
                         </td>
                         <td>
                            {p.mentorId ? (
                               <div className="entity-info-group">
                                  <span className="entity-name-main" style={{ fontSize: '13px' }}>{p.mentorId.name}</span>
                                  <span className="entity-id-sub" style={{ fontSize: '11px' }}>{p.mentorId.email}</span>
                               </div>
                            ) : (
                               <span className="det-sub" style={{ fontStyle: "italic" }}>No Assigned Mentor</span>
                            )}
                         </td>
                      </tr>
                   ))}
                   {projects.length === 0 && (
                     <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>
                           <Layers size={32} style={{ marginBottom: 16 }} />
                           <p>No active project portfolios detected for this entity.</p>
                        </td>
                     </tr>
                   )}
                </tbody>
             </table>
          </div>
        </section>

        <aside className="audit-sidebar-panel">
          {/* STUDENT PROFILE SIDEBAR */}
          <section className="audit-info-card">
             <h3 className="aic-title">Student Profile</h3>
             <div className="aic-row">
               <span className="aic-label">Account Status</span>
               <span className="aic-value" style={{ color: student.isActive ? "#10B981" : "#F87171" }}>
                 {student.isActive ? "✓ Active" : "✗ Suspended"}
               </span>
             </div>
             <div className="aic-row">
               <span className="aic-label">Joined On</span>
               <span className="aic-value">
                 {student.createdAt ? new Date(student.createdAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}
               </span>
             </div>

             {activeProject && (
               <div className="aic-row" style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px', marginTop: '12px', borderBottom: 'none' }}>
                  <span className="aic-label">Priority Track</span>
                  <span className="aic-value" style={{ color: '#0F172A', fontSize: '13px', display: 'block', margin: '8px 0' }}>{activeProject.title}</span>
                  <div className="resource-rail-bg">
                     <div className="resource-rail-fill" style={{ width: `${activeProject.progress || 0}%`, background: '#0F172A' }} />
                  </div>
               </div>
             )}

             {(student.skills || []).length > 0 && (
               <div className="aic-row" style={{ marginTop: 24 }}>
                  <span className="aic-label">ACQUIRED COMPETENCIES</span>
                  <div className="skill-cloud">
                     {student.skills.map((sk, i) => (
                       <span key={i} className="skill-tag" style={{ background: '#F0F9FF', color: '#0369A1' }}>{sk}</span>
                     ))}
                  </div>
               </div>
             )}

             {(student.badges || []).length > 0 && (
               <div className="aic-row" style={{ marginTop: 24 }}>
                  <span className="aic-label">MERIT ACHIEVEMENTS</span>
                  <div className="skill-cloud">
                     {student.badges.map((b, i) => (
                       <span key={i} className="skill-tag" style={{ background: '#FFFBEB', color: '#92400E', border: '1px solid #FEF3C7' }}>
                          🏅 {b}
                       </span>
                     ))}
                  </div>
               </div>
             )}

             <button 
                className="executive-resolve-btn" 
                style={{ width: '100%', marginTop: 20, justifyContent: 'center' }}
                onClick={() => navigate(`/portfolio/${studentId}`)}
             >
                ACCESS FULL PORTFOLIO <ExternalLink size={16} />
             </button>
          </section>

          {/* SYSTEM PROTOCOL */}
          <section className="audit-info-card">
             <h3 className="aic-title">Executive Action</h3>
             <button className="registry-audit-btn" style={{ width: '100%', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                <Activity size={14} /> ENGAGEMENT AUDIT
             </button>
             <button className="registry-audit-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                <Target size={14} /> SEMESTER PREDICTION
             </button>
          </section>
        </aside>

      </div>
    </div>
  );
};

export default StudentDetails;
