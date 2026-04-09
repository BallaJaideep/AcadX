import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import { 
  ShieldCheck, 
  Search, 
  Users, 
  GraduationCap, 
  Activity, 
  Award, 
  ArrowRight, 
  Trash2,
  Layers
} from "lucide-react";
import { fileUrl } from "../../utils/fileUrl";
import "./DirectoryPages.css";

const StudentDirectory = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/hod/student-directory");
      setData(res.data);
    } catch (err) {
      setError("Electronic Student Registry inaccessible.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("CRITICAL WARNING: This student entity and ALL associated research data will be permanently purged. Execute termination?")) return;
    
    try {
      await api.delete(`/hod/student/${id}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Termination protocol failed.");
    }
  };

  if (loading) return (
    <div className="hod-loader-container">
      <div className="executive-spinner"></div>
      <div className="shimmer-text">Compiling Global Student Registry...</div>
    </div>
  );

  if (error) return (
    <div className="registry-root">
       <div className="error-state-panel">
          <ShieldCheck size={48} className="error-icon" />
          <h3>Access Denied</h3>
          <p>{error}</p>
          <button className="reauth-btn" onClick={() => navigate("/hod/dashboard")}>Return to Command</button>
       </div>
    </div>
  );

  const { students = [], total, department } = data;

  const filtered = students.filter(s =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const withProjects = students.filter(s => (s.projects || []).length > 0).length;
  const totalPoints = students.reduce((acc, s) => acc + (s.points || 0), 0);

  return (
    <div className="registry-root">

      {/* PANORAMIC STUDENT HEADER */}
      <header className="registry-header-panoramic">
        <div className="registry-title-group">
           <span className="registry-tag"><GraduationCap size={12} /> Student Oversight</span>
           <h1 className="registry-main-title">Student Registry</h1>
           <p className="registry-subtitle">{department} Department • {total} Logged Student Entities</p>
        </div>
        
        <div className="registry-header-actions">
           <div className="registry-search-wrap">
              <Search size={18} color="#B49969" />
              <input
                 type="text"
                 placeholder="Search student entities..."
                 value={search}
                 onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>
      </header>

      {/* STRATEGIC METRICS */}
      <div className="registry-stats-grid">
         <div className="registry-stat-tile">
            <span className="rst-label">Total Enrollment</span>
            <span className="rst-value">{total}</span>
            <div className="rst-footer blue">Registered Profiles</div>
         </div>
         <div className="registry-stat-tile">
            <span className="rst-label">Active Status</span>
            <span className="rst-value">{students.filter(s => s.isActive).length}</span>
            <div className="rst-footer green">Engaged Entities</div>
         </div>
         <div className="registry-stat-tile">
            <span className="rst-label">Research Participation</span>
            <span className="rst-value">{withProjects}</span>
            <div className="rst-footer purple">Active Portfolios</div>
         </div>
         <div className="registry-stat-tile">
            <span className="rst-label">Departmental Points</span>
            <span className="rst-value">{totalPoints}</span>
            <div className="rst-footer gold">Engagement Accumulation</div>
         </div>
      </div>

      {/* STUDENT REGISTRY CONTENT */}
      <div className="registry-section">
         <div className="rs-header">
            <h3 className="rs-title">Global Student Registry</h3>
            <span className="rs-count">{filtered.length} Entities Logged</span>
         </div>

         <div className="registry-table-wrap">
            <table className="registry-table">
               <thead>
                  <tr>
                     <th>STUDENT ENTITY</th>
                     <th>SEMESTER</th>
                     <th>TRACK STATUS</th>
                     <th>ENGAGEMENT</th>
                     <th>ADMIN PROTOCOL</th>
                  </tr>
               </thead>
               <tbody>
                  {filtered.map(s => (
                     <tr key={s._id} onClick={() => navigate(`/hod/student/${s._id}`)} style={{ cursor: "pointer" }}>
                        <td>
                           <div className="entity-cell-executive">
                              <div className="entity-avatar">
                                {s.profilePhoto ? <img src={fileUrl(s.profilePhoto)} alt="" /> : s.name?.charAt(0)}
                              </div>
                              <div className="entity-text">
                                <span className="entity-name">{s.name}</span>
                                <span className="entity-id">{s.email}</span>
                              </div>
                           </div>
                        </td>
                        <td><span className="status-pill-small">S{s.semester || "—"}</span></td>
                        <td>
                          <div className="registry-progress-info">
                             <span className="rpi-text">{s.activeProject?.title || "No Active Research Track"}</span>
                             {s.activeProject && (
                                <div className="rpi-rail">
                                   <div className="rpi-rail-fill" style={{ width: `${s.activeProject.progress || 0}%`, background: '#B49969' }}></div>
                                </div>
                             )}
                          </div>
                        </td>
                        <td><span className="val-points gold">{s.points || 0} PTS</span></td>
                        <td>
                           <div className="registry-action-group">
                             <button 
                                className="registry-audit-btn"
                                onClick={(e) => { e.stopPropagation(); navigate(`/hod/student/${s._id}`); }}
                             >
                                Audit ➔
                             </button>
                             <button 
                                className="btn-delete"
                                onClick={(e) => handleDelete(e, s._id)}
                             >
                                Delete
                             </button>
                           </div>
                        </td>
                     </tr>
                  ))}
                  {filtered.length === 0 && (
                     <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '100px', opacity: 0.5 }}>
                           <Users size={48} style={{ marginBottom: 20 }} />
                           <p>No student entities found within the departmental registry.</p>
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default StudentDirectory;
