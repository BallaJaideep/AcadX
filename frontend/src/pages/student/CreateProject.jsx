import React, { useState, useEffect, useMemo } from "react";
import api from "../../api/client";
import { useNavigate } from "react-router-dom";
import { 
  Search, Filter, FolderOpen, ArrowRight, CheckCircle, 
  Clock, XCircle, RotateCcw, Zap, Target, Activity, Layout
} from "lucide-react";
import "./CreateProject.css";

/* ── Status config (Synced with MyProjects) ── */
const STATUS_CFG = {
  active: { label: "Active", cls: "active", bar: "linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)" },
  completed: { label: "Completed", cls: "completed", bar: "#10B981" },
  pending: { label: "Pending", cls: "pending", bar: "#F59E0B" },
};

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    department: "",
    domain: "",
    techStack: "",
    semester: "1",
    projectType: "mini",
  });

  /* ── Inventory State ── */
  const [projects, setProjects] = useState([]);
  const [invLoading, setInvLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const loadProjects = async () => {
    setInvLoading(true);
    try {
      const res = await api.get("/projects/my");
      setProjects(res.data.projects || []);
    } catch (e) {
      console.error("Inventory load failed:", e);
    } finally {
      setInvLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => projects.filter(p => {
    const titleMatch = (p.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const status = (p.status || "pending").toLowerCase();
    const filterMatch = filterStatus === "all" || status === filterStatus;
    return titleMatch && filterMatch;
  }), [projects, searchQuery, filterStatus]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    setLoading(true);

    try {
      await api.post("/projects", {
        department: form.department,
        domain: form.domain,
        techStack: form.techStack.split(",").map((t) => t.trim()),
        semester: parseInt(form.semester),
        projectType: form.projectType,
      });

      setMsg("Project details generated and registered successfully!");
      loadProjects(); // Refresh inventory after creation
      setTimeout(() => navigate("/student/projects"), 1500);
    } catch (err) {
      setErr(err.response?.data?.message || "Generation failed. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vp-root">
      <div className="vp-header-wrapper" style={{ paddingBottom: '0' }}>
        <header className="vp-header-box" style={{ padding: '60px', marginBottom: '40px' }}>
          <div className="vp-hero-badge">
            <Zap size={14} /> AI-Powered Implementation Registry
          </div>
          <h1 className="vp-hero-h1">
            Intelligent <span className="vp-hero-name">Project Initiation</span>
          </h1>
          <p className="vp-hero-p">
            Provide your core technical parameters and institutional domain. 
            Our neural engine will synthesize your project architecture, problem statement, and outcomes in real-time.
          </p>

          <div className="vp-academic-identity" style={{ marginTop: '20px' }}>
             <div className="vp-id-badge">
                <span className="label">Synthesis Engine</span>
                <span className="value">AcadX AI v4.2</span>
             </div>
             <div className="vp-id-badge">
                <span className="label">Estimated Latency</span>
                <span className="value">5–10 Seconds</span>
             </div>
          </div>
        </header>

        <section className="vp-container">
          <div className="vp-card" style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px' }}>
            <div className="vp-card-hd" style={{ marginBottom: '32px' }}>
              <div className="vp-card-ico vp-ico-purple"><Target size={20} /></div>
              <div>
                <h3>Technical Parameters</h3>
                <p>Define the core identity of your research track</p>
              </div>
            </div>

            {msg && <div className="vp-status-pill active" style={{ width: '100%', marginBottom: '24px', textAlign: 'center', padding: '12px' }}>{msg}</div>}
            {err && <div className="vp-status-pill error" style={{ width: '100%', marginBottom: '24px', textAlign: 'center', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>{err}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                <div className="vp-input-group">
                  <label className="vp-kpi-lbl">Department / Faculty</label>
                  <input
                    name="department"
                    className="vp-premium-input"
                    placeholder="e.g., Computer Science, IT, ECE"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="vp-input-group">
                  <label className="vp-kpi-lbl">Industry Domain</label>
                  <input
                    name="domain"
                    className="vp-premium-input"
                    placeholder="e.g., AI/ML, Web Systems, IoT"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="vp-input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="vp-kpi-lbl">Core Tech Stack (Comma separated)</label>
                  <div style={{ position: 'relative' }}>
                    <Activity size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#7C3AED' }} />
                    <input
                      name="techStack"
                      className="vp-premium-input"
                      style={{ paddingLeft: '48px' }}
                      placeholder="e.g., React, Node.js, OpenAI API, TensorFlow"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="vp-input-group">
                  <label className="vp-kpi-lbl">Current Semester</label>
                  <select name="semester" className="vp-premium-input" onChange={handleChange} value={form.semester}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>

                <div className="vp-input-group">
                  <label className="vp-kpi-lbl">Project Classification</label>
                  <select name="projectType" className="vp-premium-input" onChange={handleChange} value={form.projectType}>
                    <option value="mini">Mini Project</option>
                    <option value="major">Major Project</option>
                    <option value="research">Research Thesis</option>
                    <option value="innovation">Innovation Lab</option>
                  </select>
                </div>
              </div>

              <div className="vp-ai-tip" style={{ marginBottom: '40px' }}>
                <div className="vp-tip-icon"><Layout size={20} /></div>
                <div className="vp-tip-text">
                  <h4>Automated Document Synthesis</h4>
                  <p>Our AI will automatically generate your Title, Abstract, Objectives, and Expected Outcomes based on the parameters provided above.</p>
                </div>
              </div>

              <button type="submit" className="vp-btn-vibrant" style={{ width: '100%', height: '60px', borderRadius: '20px', fontSize: '16px' }} disabled={loading}>
                {loading ? (
                  <>
                    <div className="vp-spin" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                    Synthesizing Architecture...
                  </>
                ) : (
                  <>
                    <Zap size={20} /> Initialize with AI
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </div>

        {/* ── OPERATIONAL INVENTORY ── */}
        <section className="vp-inventory-section" style={{ marginTop: '60px' }}>
          <div className="vp-inv-hd">
            <div className="vp-inv-ttl">
              <h2>Operational Inventory</h2>
              <p>Institutional record of your active research tracks</p>
            </div>
            <div className="vp-inv-controls">
              <div className="vp-search-box">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Filter by title..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="vp-filter-box">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">Global Status</option>
                  <option value="pending">Pending</option>
                  <option value="active">In Progress</option>
                  <option value="completed">Verified</option>
                </select>
              </div>
            </div>
          </div>

          {invLoading ? (
            <div className="vp-loader" style={{ minHeight: '200px' }}>
              <div className="vp-spin" />
              <span>Syncing Registry...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="vp-empty-box-best">
              <div className="vp-empty-ico-frame">
                <FolderOpen size={64} className="vp-empty-ico-vibrant" />
              </div>
              <h3>No entities found</h3>
              <p>Your search or filter returned no matches in the institutional record.</p>
            </div>
          ) : (
            <div className="vp-project-grid">
              {filteredProjects.map(p => {
                const s = (p.status || "pending").toLowerCase();
                const cfg = s === "completed" ? STATUS_CFG.completed : s === "active" ? STATUS_CFG.active : STATUS_CFG.pending;

                return (
                  <div key={p._id} className="vp-proj-card">
                    <div className="vp-proj-accent" style={{ color: cfg.bar }} />
                    <div className="vp-proj-hd">
                      <span className={`vp-status-pill ${cfg.cls}`}>{cfg.label}</span>
                      <span className="vp-proj-id">ID-{p._id.slice(-6).toUpperCase()}</span>
                    </div>

                    <div className="vp-proj-body">
                      <h3>{p.title}</h3>
                      <p>{p.description || "No research abstract available for this entity."}</p>
                    </div>

                    <div className="vp-proj-prog">
                      <div className="vp-prog-info">
                        <span>Validation Progress</span>
                        <span>{p.progress || 0}%</span>
                      </div>
                      <div className="vp-prog-track">
                        <div className="vp-prog-fill" style={{ width: `${p.progress || 0}%`, background: cfg.bar }} />
                      </div>
                    </div>

                    <div className="vp-proj-foot">
                      <button className="vp-btn-details" onClick={() => navigate(`/student/project/${p._id}`)}>
                        Enterprise View <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
    </div>
  );
};

export default CreateProject;