import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { 
  ShieldCheck, 
  ArrowLeft, 
  TrendingUp, 
  Briefcase, 
  Users, 
  Zap, 
  Trash2,
  Calendar,
  Layers,
  ExternalLink
} from "lucide-react";
import "./AuditPages.css";

const FacultyDetails = () => {
  const { facultyId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/hod/faculty/${facultyId}`);
        setData(res.data);
      } catch (err) {
        setError("Failed to retrieve faculty audit records.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [facultyId]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this faculty member? This action is irreversible.")) return;
    try {
      await api.delete(`/hod/faculty/${facultyId}`);
      navigate("/hod/faculty-directory");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to terminate faculty entry.");
    }
  };

  if (loading) return (
    <div className="hod-loader-container">
      <div className="executive-spinner"></div>
      <div className="shimmer-text">Compiling Faculty Intelligence Dossier...</div>
    </div>
  );

  if (error) return (
    <div className="audit-root">
       <div className="error-state-panel">
          <ShieldCheck size={48} className="error-icon" />
          <h3>Audit Extraction Failed</h3>
          <p>{error}</p>
          <button className="reauth-btn" onClick={() => navigate("/hod/faculty-directory")}>Return to Directory</button>
       </div>
    </div>
  );

  const { faculty, mentoredStudents = [] } = data;
  const completionRate = mentoredStudents.length > 0
    ? Math.round((mentoredStudents.filter(s => (s.points || 0) > 0).length / mentoredStudents.length) * 100)
    : 0;

  return (
    <div className="audit-root">
      
      {/* PANORAMIC DOSSIER HEADER */}
      <header className="audit-header-panoramic">
        <div className="audit-back-btn" onClick={() => navigate("/hod/faculty-directory")}>
          <ArrowLeft size={16} /> FACULTY DIRECTORY ARCHIVE
        </div>
        
        <div className="audit-profile-row">
          <div className="audit-avatar-frame">
            {faculty.profilePhoto ? (
              <img src={`http://localhost:5000/${faculty.profilePhoto}`} alt="" />
            ) : faculty.name?.charAt(0)}
          </div>
          <div className="audit-identity">
            <h1>{faculty.name}</h1>
            <p>{faculty.email} — {faculty.department} Department</p>
            <div className="audit-tag-row">
              <span className={`audit-badge ${faculty.isActive ? 'active' : 'inactive'}`}>
                {faculty.isActive ? "ACTIVE" : "DEACTIVATED"}
              </span>
              <span className="audit-badge role">Faculty</span>
            </div>
          </div>
        </div>

        <div className="audit-actions">
           <button className="audit-btn-danger" onClick={handleDelete}>
              <Trash2 size={14} style={{ marginRight: 8, verticalAlign: 'middle' }} /> 
              DELETE FACULTY
           </button>
        </div>
      </header>

      {/* TACTICAL METRIC GRID */}
      <div className="audit-metrics-grid">
         <div className="audit-metric-card">
            <span className="amc-label">Students Mentored</span>
            <span className="amc-value">{mentoredStudents.length}</span>
            <div className="amc-footer blue">Active roster</div>
         </div>
         <div className="audit-metric-card">
            <span className="amc-label">Current Load</span>
            <span className="amc-value">{faculty.currentLoad || 0}/10</span>
            <div className="amc-footer gold">Capacity utilized</div>
         </div>
         <div className="audit-metric-card">
            <span className="amc-label">Engagement Rate</span>
            <span className="amc-value">{completionRate}%</span>
            <div className="amc-footer green">Target: 80%</div>
         </div>
         <div className="audit-metric-card">
            <span className="amc-label">Expertise Areas</span>
            <span className="amc-value">{(faculty.skills || []).length}</span>
            <div className="amc-footer">Listed skills</div>
         </div>
      </div>

      <div className="audit-main-layout">
        
        {/* MENTORSHIP ROSTER DOSSIER */}
        <section className="dossier-card">
          <div className="dossier-header">
             <h3 className="dossier-title">Mentorship Roster</h3>
             <span className="registry-count">{mentoredStudents.length} Students</span>
          </div>
          
          <div className="dossier-table-wrap">
             <table className="dossier-table">
                <thead>
                   <tr>
                      <th>Student</th>
                      <th>Semester</th>
                      <th>Department</th>
                      <th>Points</th>
                      <th>Action</th>
                   </tr>
                </thead>
                <tbody>
                   {mentoredStudents.map(s => (
                      <tr key={s._id}>
                         <td>
                            <div className="entity-info-group">
                               <span className="entity-name-main">{s.name}</span>
                               <span className="entity-id-sub">{s.email}</span>
                            </div>
                         </td>
                         <td><span className="semester-pill">S{s.semester || "—"}</span></td>
                         <td><span className="status-pill-small">{s.department || "General"}</span></td>
                         <td><span className="points-gold">{s.points || 0} pts</span></td>
                         <td>
                            <button className="registry-audit-btn" onClick={() => navigate(`/hod/student/${s._id}`)}>
                               Dossier ➔
                            </button>
                         </td>
                      </tr>
                   ))}
                   {mentoredStudents.length === 0 && (
                     <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>
                           <Users size={32} style={{ marginBottom: 16 }} />
                           <p>No student entities found in this faculty's roster.</p>
                        </td>
                     </tr>
                   )}
                </tbody>
             </table>
          </div>
        </section>

        <aside className="audit-sidebar-panel">
          {/* FACULTY PROFILE SIDEBAR */}
          <section className="audit-info-card">
             <h3 className="aic-title">Faculty Profile</h3>
             <div className="aic-row">
               <span className="aic-label">Account Status</span>
               <span className="aic-value" style={{ color: faculty.isActive ? "#10B981" : "#F87171" }}>
                 {faculty.isActive ? "✓ Active" : "✗ Deactivated"}
               </span>
             </div>
             <div className="aic-row">
               <span className="aic-label">Joined On</span>
               <span className="aic-value">
                 {faculty.createdAt ? new Date(faculty.createdAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}
               </span>
             </div>
             <div className="aic-row" style={{ borderBottom: 'none' }}>
               <span className="aic-label">Current Load</span>
               <div className="load-monitor-wrap">
                  <div className="resource-rail-bg">
                     <div 
                       className="resource-rail-fill" 
                       style={{ background: '#0F172A', transition: 'width 1s ease', width: `${Math.min(((faculty.currentLoad || 0) / 10) * 100, 100)}%` }} 
                     />
                  </div>
                  <div className="aic-subtext" style={{ marginTop: 12 }}>
                     <span>Load Intensity</span>
                     <span style={{ color: '#000', fontWeight: 950 }}>{faculty.currentLoad || 0} / 10 Units</span>
                  </div>
               </div>
             </div>

             {(faculty.skills || []).length > 0 && (
               <div className="aic-row" style={{ marginTop: 20 }}>
                  <span className="aic-label">TECHNICAL ASSET CLOUD</span>
                  <div className="skill-cloud">
                     {faculty.skills.map((sk, i) => (
                       <span key={i} className="skill-tag">{sk}</span>
                     ))}
                  </div>
               </div>
             )}
          </section>

          {/* QUICK LINKS */}
          <section className="audit-info-card">
             <h3 className="aic-title">Executive Protocol</h3>
             <button className="registry-audit-btn" style={{ width: '100%', marginBottom: 12, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Zap size={14} /> GENERATE AUDIT REPORT
             </button>
             <button className="registry-audit-btn" style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Layers size={14} /> CROSS-DEPT COMPARISON
             </button>
          </section>
        </aside>

      </div>
    </div>
  );
};

export default FacultyDetails;
