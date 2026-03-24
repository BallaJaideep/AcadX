import { useEffect, useState } from "react";
import api from "../../api/client";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  TrendingUp, 
  Search, 
  FileText, 
  Zap, 
  Command,
  ArrowUpRight,
  MoreVertical,
  Activity
} from "lucide-react";
import "./HodDashboard.css";

const HodDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/hod/dashboard");
        setData(res.data);
      } catch (err) {
        setError("Unable to retrieve departmental analytics. Please verify your administrative session.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="hod-loader-container">
      <div className="executive-spinner"></div>
      <div className="shimmer-text">Establishing Executive Protocol...</div>
    </div>
  );

  if (error) return (
    <div className="dashboard-page fade-in">
        <div className="error-state-panel">
            <ShieldCheck size={48} className="error-icon" />
            <h3>Administrative Access Restricted</h3>
            <p>{error}</p>
            <button className="reauth-btn" onClick={() => window.location.reload()}>Retry Authentication</button>
        </div>
    </div>
  );

  if (!data) return null;

  const { metrics, allStudents, topStudents, facultyLoad } = data;

  const filteredStudents = (allStudents || []).filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="hod-root">
        {/* EXECUTIVE PANORAMIC HEADER */}
        <header className="hod-header-panoramic">
          <div className="header-meta">
            <div className="auth-badge">
              <Command size={14} /> <span>Senior Administrative Node</span>
            </div>
            <h1 className="hod-main-title">Departmental <span className="gold-text">Intelligence Command</span></h1>
            <p className="hod-subtitle">High-impact oversight for {metrics?.department || "Departmental"} operations, student progression, and institutional resource management.</p>
          </div>
          
          <div className="header-stats-minimal">
            <div className="min-stat">
              <span className="lab">SYSTEM STATUS</span>
              <span className="val healthy">OPERATIONAL</span>
            </div>
            <div className="min-stat">
              <span className="lab">ACTIVE AUDIT</span>
              <span className="val ivory">WEEKLY SYNC</span>
            </div>
          </div>
        </header>

        {/* COMMAND TILES GRID */}
        <div className="hod-command-grid">
           <div className="command-tile stat-glow navy">
              <div className="tile-top">
                <Users size={24} className="tile-icon" />
                <ArrowUpRight size={16} className="tile-trend" />
              </div>
              <div className="tile-main">
                <span className="tile-label">STUDENT CAPACITY</span>
                <span className="tile-value">{metrics?.totalStudents || 0}</span>
              </div>
              <div className="tile-footer">Institutional Enrollment Active</div>
           </div>

           <div className="command-tile stat-glow gold">
              <div className="tile-top">
                <Briefcase size={24} className="tile-icon" />
                <Zap size={16} className="tile-trend" />
              </div>
              <div className="tile-main">
                <span className="tile-label">FACULTY RESOURCE</span>
                <span className="tile-value">{metrics?.totalFaculty || 0}</span>
              </div>
              <div className="tile-footer">Mentorship Load Synchronized</div>
           </div>

           <div className="command-tile stat-glow ivory">
              <div className="tile-top">
                <CheckCircle2 size={24} className="tile-icon" />
                <Activity size={16} className="tile-trend" />
              </div>
              <div className="tile-main">
                <span className="tile-label">FINALIZED PROJECTS</span>
                <span className="tile-value">{metrics?.completedProjects || 0}</span>
              </div>
              <div className="tile-footer">Registry Audit Ready</div>
           </div>

           <div className="command-tile stat-glow vibrant">
              <div className="tile-top">
                <TrendingUp size={24} className="tile-icon" />
                <span className="vibrant-badge">ELITE</span>
              </div>
              <div className="tile-main">
                <span className="tile-label">EFFICIENCY RATE</span>
                <span className="tile-value">{metrics?.completionRate || 0}%</span>
              </div>
              <div className="tile-footer">Above Institutional Target</div>
           </div>
        </div>

        <div className="hod-main-layout">
          
          {/* ADMINISTRATIVE DOSSIER REGISTRY */}
          <section className="hod-content-section registry-card">
            <div className="registry-header">
               <div className="registry-title-group">
                 <h3 className="section-title">Administrative Dossier Registry</h3>
                 <span className="registry-count">{(allStudents || []).length} Entities Identified</span>
               </div>
               <div className="registry-actions">
                 <div className="search-bar-executive">
                   <Search size={16} />
                   <input 
                      type="text" 
                      placeholder="Identify student entity..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                   />
                 </div>
                 <button className="export-btn-minimal" onClick={() => window.print()}>
                    <FileText size={16} /> Export Dossier
                 </button>
               </div>
            </div>
            
            <div className="dossier-table-wrap">
               <table className="dossier-table">
                  <thead>
                     <tr>
                        <th>STUDENT ENTITY</th>
                        <th>SEMESTER</th>
                        <th>RESEARCH PROGRESS</th>
                        <th>ENGAGEMENT</th>
                        <th>PROTOCOL</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredStudents.map(student => (
                        <tr key={student._id}>
                           <td>
                              <div className="entity-info-group">
                                 <span className="entity-name-main">{student.name}</span>
                                 <span className="entity-id-sub">{student.email}</span>
                              </div>
                           </td>
                           <td><span className="semester-pill">S{student.semester}</span></td>
                           <td>
                              <div className="dossier-progress-block">
                                 <div className="progress-text-row">
                                    <span className="proj-name-mini">{student.projects?.[0]?.title || "Null Research Track"}</span>
                                    {student.projects?.[0] && <span className="proj-percent">{student.projects[0].progress || 0}%</span>}
                                 </div>
                                 {student.projects?.[0] && (
                                    <div className="dossier-progress-rail">
                                       <div className="dossier-progress-fill" style={{width: `${student.projects[0].progress || 0}%`}}></div>
                                    </div>
                                 )}
                              </div>
                           </td>
                           <td><span className="engagement-value">{student.points || 0} PTS</span></td>
                           <td>
                              <button 
                                 className="registry-audit-btn"
                                 onClick={() => navigate(`/hod/student/${student._id}`)}
                              >
                                 Audit Track
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </section>

          <aside className="hod-sidebar-intelligence">
            {/* FACULTY RESOURCE ANALYSIS */}
            <section className="hod-sidebar-card">
              <div className="sidebar-card-header">
                <h3 className="sidebar-title">Faculty Resource load</h3>
                <MoreVertical size={16} className="header-more" />
              </div>
              <div className="faculty-intelligence-stack">
                {(facultyLoad || []).map((f, i) => (
                  <div key={i} className="faculty-resource-tile" onClick={() => navigate(`/hod/faculty/${f._id}`)}>
                    <div className="resource-meta">
                      <span className="resource-name">{f.name}</span>
                      <span className="resource-load">{f.currentLoad || 0} Active</span>
                    </div>
                    <div className="resource-rail-bg">
                      <div 
                        className="resource-rail-fill" 
                        style={{ width: `${Math.min(((f.currentLoad || 0) / 10) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ACADEMIC LEADERSHIP RANKING */}
            <section className="hod-sidebar-card leadership-card">
                <div className="sidebar-card-header">
                  <h3 className="sidebar-title">Academic Leadership</h3>
                  <TrendingUp size={16} className="text-gold" />
                </div>
                <div className="leadership-stack">
                  {(topStudents || []).map((s, i) => (
                    <div key={i} className="leadership-row">
                      <div className="rank-badge">{i + 1}</div>
                      <div className="leader-info">
                        <span className="leader-name">{s.name}</span>
                        <span className="leader-dept">{s.department || "General"}</span>
                      </div>
                      <span className="leader-points">{s.points}</span>
                    </div>
                  ))}
                </div>
            </section>
          </aside>
        </div>
    </div>
  );
};

export default HodDashboard;