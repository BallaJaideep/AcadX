import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import { 
  ShieldCheck, 
  Search, 
  Users, 
  UserCheck, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight, 
  Trash2,
  Activity
} from "lucide-react";
import { fileUrl } from "../../utils/fileUrl";
import "./DirectoryPages.css";

const FacultyDirectory = () => {
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
      const res = await api.get("/hod/faculty-directory");
      setData(res.data);
    } catch (err) {
      setError("Strategic retrieval of faculty registry failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("CRITICAL PROTOCOL: Are you sure you want to permanently terminate this faculty entry? This action is irreversible.")) return;
    
    try {
      await api.delete(`/hod/faculty/${id}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Termination protocol aborted.");
    }
  };

  if (loading) return (
    <div className="hod-loader-container">
      <div className="executive-spinner"></div>
      <div className="shimmer-text">Synchronizing Personnel Registry...</div>
    </div>
  );

  if (error) return (
    <div className="registry-root">
       <div className="error-state-panel">
          <ShieldCheck size={48} className="error-icon" />
          <h3>Access Restricted</h3>
          <p>{error}</p>
          <button className="reauth-btn" onClick={() => navigate("/hod/dashboard")}>Back to Command</button>
       </div>
    </div>
  );

  const { faculty = [], total, department } = data;
  const filtered = faculty.filter(f =>
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="registry-root">

      {/* PANORAMIC REGISTRY HEADER */}
      <header className="registry-header-panoramic">
        <div className="registry-title-group">
           <span className="registry-tag"><ShieldCheck size={12} /> Personnel Oversight</span>
           <h1 className="registry-main-title">Faculty Directory</h1>
           <p className="registry-subtitle">{department} Department • {total} Validated Entities</p>
        </div>
        
        <div className="registry-header-actions">
           <div className="registry-search-wrap">
              <Search size={18} color="#B49969" />
              <input
                 type="text"
                 placeholder="Search faculty entries..."
                 value={search}
                 onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>
      </header>

      {/* STRATEGIC METRICS */}
      <div className="registry-stats-grid">
         <div className="registry-stat-tile">
            <span className="rst-label">Total Faculty</span>
            <span className="rst-value">{total}</span>
            <div className="rst-footer blue">Registered Members</div>
         </div>
         <div className="registry-stat-tile">
            <span className="rst-label">Active Profiles</span>
            <span className="rst-value">{faculty.filter(f => f.isActive).length}</span>
            <div className="rst-footer green">Verified Operations</div>
         </div>
         <div className="registry-stat-tile">
            <span className="rst-label">Mentorship Flow</span>
            <span className="rst-value">{faculty.reduce((a, f) => a + (f.studentCount || 0), 0)}</span>
            <div className="rst-footer purple">Student Assignments</div>
         </div>
         <div className="registry-stat-tile">
            <span className="rst-label">Research Completion</span>
            <span className="rst-value">{faculty.reduce((a, f) => a + (f.completedProjects || 0), 0)}</span>
            <div className="rst-footer gold">Finalized Projects</div>
         </div>
      </div>

      {/* REGISTRY CONTENT */}
      <div className="registry-section">
         <div className="rs-header">
            <h3 className="rs-title">Institutional Faculty Registry</h3>
            <span className="rs-count">{filtered.length} Entities Logged</span>
         </div>

         <div className="registry-table-wrap">
            <table className="registry-table">
               <thead>
                  <tr>
                     <th>FACULTY MEMBER</th>
                     <th>CAPACITY STATUS</th>
                     <th>MENTORED</th>
                     <th>OUTPUTS</th>
                     <th>ADMIN PROTOCOL</th>
                  </tr>
               </thead>
               <tbody>
                  {filtered.map(f => (
                     <tr key={f._id} onClick={() => navigate(`/hod/faculty/${f._id}`)} style={{ cursor: "pointer" }}>
                        <td>
                           <div className="entity-cell-executive">
                              <div className="entity-avatar">
                                {f.profilePhoto ? <img src={fileUrl(f.profilePhoto)} alt="" /> : f.name?.charAt(0)}
                              </div>
                              <div className="entity-text">
                                <span className="entity-name">{f.name}</span>
                                <span className="entity-id">{f.email}</span>
                              </div>
                           </div>
                        </td>
                        <td>
                          <div className="registry-progress-info">
                             <span className="rpi-text">{f.currentLoad || 0} / 10 UNITS</span>
                             <div className="rpi-rail">
                                <div className="rpi-rail-fill" style={{ width: `${Math.min(((f.currentLoad||0)/10)*100, 100)}%` }}></div>
                             </div>
                          </div>
                        </td>
                        <td><span className="val-points">{f.studentCount || 0}</span></td>
                        <td><span className="val-points gold">{f.completedProjects || 0}</span></td>
                        <td>
                           <div className="registry-action-group">
                             <button 
                                className="registry-audit-btn"
                                onClick={(e) => { e.stopPropagation(); navigate(`/hod/faculty/${f._id}`); }}
                             >
                                Audit ➔
                             </button>
                             <button 
                                className="btn-delete"
                                onClick={(e) => handleDelete(e, f._id)}
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
                           <p>No faculty entities identified within the specified parameters.</p>
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

export default FacultyDirectory;
