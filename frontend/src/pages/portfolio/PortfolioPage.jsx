import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { fileUrl } from "../../utils/fileUrl";
import "./PortfolioPage.css";
import { 
  User, Cpu, BookOpen, Database, Award, 
  MapPin, Star, Sparkles, Hash, ArrowLeft, 
  Download, ExternalLink, FileText, UploadCloud,
  CheckCircle2, Briefcase
} from "lucide-react";

const PortfolioPage = () => {
  const { user, setUser } = useAuth();
  const { studentId } = useParams();
  const navigate = useNavigate();
  const isViewOnly = !!studentId && (studentId !== user?.id);

  const [portfolio, setPortfolio] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [resumePath, setResumePath] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadPortfolio = async () => {
    try {
      if (isViewOnly) {
        const res = await api.get(`/portfolio/${studentId}`);
        setPortfolio(res.data.portfolio);
        setTargetUser(res.data.targetUser);
      } else {
        const res = await api.get("/portfolio/me");
        setPortfolio(res.data.portfolio);
        setTargetUser(user);
      }
    } catch {
      setPortfolio(null);
    } finally {
      setLoading(false);
    }
  };

  const loadResume = async () => {
    try {
      const endpoint = isViewOnly ? `/users/${studentId}/resume` : "/users/me/resume";
      const res = await api.get(endpoint);
      setResumePath(res.data.resumePath || "");
    } catch {
      setResumePath("");
    }
  };

  useEffect(() => {
    loadPortfolio();
    loadResume();
  }, [studentId]);

  const generatePortfolio = async () => {
    try {
      setGenerating(true);
      const res = await api.post("/portfolio/generate");
      setPortfolio(res.data.portfolio);
    } catch {
      alert("Portfolio generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const changePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("photo", file);

    try {
      const res = await api.post("/users/me/photo", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser({ ...user, profilePhoto: res.data.photo });
    } catch {
      alert("Photo upload failed");
    }
  };

  const downloadResume = async () => {
    try {
      const filename = resumePath.split("/").pop();
      const res = await api.get(`/users/resume/download/${filename}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Resume download failed");
    }
  };

  const uploadResume = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("resume", file);

    try {
      const res = await api.post("/users/me/resume", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // ✅ Synchronize with global context
      setUser({ ...user, resumePath: res.data.resumePath });
      setResumePath(res.data.resumePath);
      alert("Resume deployed successfully to the Vault.");
    } catch {
      alert("Resume deployment protocol failed.");
    }
  };

  if (loading) return (
    <div className="vp-loader-container">
      <div className="vp-shimmer-text">Synchronizing Portfolio Records...</div>
    </div>
  );

  return (
    <div className="vp-portfolio-solid-root">
      
      {/* ── PREMIUM SOLID HERO ── */}
      <div className="vp-solid-hero">
        <button className="vp-solid-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> BACK
        </button>

        <div className="vp-solid-hero-layout">
          <div className="vp-solid-photo-frame">
            <div className="vp-solid-orb">
              <img
                src={targetUser?.profilePhoto ? fileUrl(targetUser.profilePhoto) : "/avatar.png"}
                alt="Researcher"
                className="vp-solid-img"
              />
              {!isViewOnly && (
                <label className="vp-solid-photo-edit">
                  <UploadCloud size={16} />
                  <input type="file" hidden onChange={changePhoto} />
                </label>
              )}
            </div>
          </div>

          <div className="vp-solid-persona">
            <div className="vp-solid-badge"><Sparkles size={14} /> {isViewOnly ? "INSTITUTIONAL AUDIT" : "PREMIUM RESEARCHER PROFILE"}</div>
            <h1 className="vp-solid-name">{targetUser?.name}</h1>
            <div className="vp-solid-meta">
              <span className="vp-solid-tag"><Database size={16} /> {targetUser?.department}</span>
              <span className="vp-solid-tag"><Award size={16} /> SEMESTER {targetUser?.semester}</span>
            </div>

            {!isViewOnly && (
              <div className="vp-solid-hero-actions">
                <button 
                  onClick={generatePortfolio} 
                  disabled={generating} 
                  className="vp-btn-solid-pink"
                >
                  {generating ? "SYNTHESIZING..." : <><Sparkles size={18} /> SYNTHESIZE AI DOSSIER</>}
                </button>
              </div>
            )}
          </div>

          <div className="vp-solid-kpis">
             <div className="vp-solid-kpi-box">
               <span className="vp-kpi-val">{portfolio?.projects?.length || 0}</span>
               <span className="vp-kpi-lab">RESEARCH TRACKS</span>
             </div>
             <div className="vp-solid-kpi-box">
               <span className="vp-kpi-val">{portfolio?.skills?.length || 0}</span>
               <span className="vp-kpi-lab">CORE SKILLS</span>
             </div>
          </div>
        </div>
      </div>

      {/* ── UNIFIED SOLID DOSSIER SHEET ── */}
      <div className="vp-portfolio-sheet-container">
        <div className="vp-solid-dossier-sheet">
          {portfolio ? (
            <>
              {/* SECTION: SYNOPSIS */}
              <div className="vp-sheet-item">
                <div className="vp-label-mini"><FileText size={16} /> PROFESSIONAL SYNOPSIS</div>
                <h2 className="vp-solid-tagline">"{portfolio.tagline}"</h2>
                <p className="vp-solid-about">{portfolio.about}</p>
              </div>

              <div className="vp-sheet-line" />

              {/* SECTION: COMPETENCIES */}
              <div className="vp-sheet-item">
                <div className="vp-label-mini"><Cpu size={16} /> CORE COMPETENCIES</div>
                <div className="vp-solid-skills-grid">
                  {(portfolio.skills || []).map((s) => (
                    <div key={s} className="vp-solid-skill-item">
                      <CheckCircle2 size={16} className="vp-pink-bullet" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="vp-sheet-line" />

              {/* SECTION: RESEARCH TRACKS */}
              <div className="vp-sheet-item">
                <div className="vp-label-mini"><BookOpen size={16} /> ACADEMIC RESEARCH TRACKS</div>
                <div className="vp-solid-projects-grid">
                  {(portfolio.projects || portfolio.projectsSummary || []).map((p, idx) => (
                    <div key={p.title || idx} className="vp-solid-project-box">
                      <div className="vp-proj-box-hdr">
                        <span className="vp-solid-status-tag">{p.status || "Verified"}</span>
                        <h3>{p.title}</h3>
                      </div>
                      <p>{p.aiSummary}</p>
                      <div className="vp-proj-box-foot">
                         <Link to="/student" className="vp-solid-link">AUDIT TRACK <ExternalLink size={14} /></Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="vp-sheet-item">
              <div className="vp-vibe-empty-state">
                <Hash size={48} className="vp-gray-ico" />
                <h3>REPOSITORY EMPTY</h3>
                <p>No research records found. Initialize your AI Dossier to begin tracking.</p>
                {!isViewOnly && (
                  <button onClick={generatePortfolio} className="vp-btn-solid-pink" style={{ marginTop: '24px' }}>
                    INITIALIZE SYNTHESIS
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="vp-sheet-line" />

          {/* SECTION: RESUME VAULT */}
          <div className="vp-sheet-item">
            <div className="vp-label-mini"><Briefcase size={16} /> THE RESUME VAULT</div>
            <div className="vp-solid-vault-box">
              {!isViewOnly && (
                <div className="vp-vault-upload-cta">
                  <div className="vp-vault-orb-vibrant"><UploadCloud size={32} /></div>
                  <div className="vp-vault-cta-txt">
                    <strong>DEPLOY RESUME</strong>
                    <span>PDF ONLY • 5MB LIMIT</span>
                  </div>
                  <label className="vp-vault-select-btn">
                    SELECT SOURCE
                    <input type="file" accept="application/pdf" hidden onChange={uploadResume} />
                  </label>
                </div>
              )}

              {resumePath ? (
                <div className={`vp-solid-record-box ${isViewOnly ? 'full-span' : ''}`}>
                  <div className="vp-record-info-vibrant">
                    <div className="vp-pdf-square"><FileText size={24} /></div>
                    <div className="vp-pdf-titles">
                      <strong>ACTIVE_DOSSIER.PDF</strong>
                      <span className="vp-verified-tag">VERIFIED ARCHIVE ACTIVE</span>
                    </div>
                  </div>
                  <div className="vp-record-btns">
                    <a href={fileUrl(resumePath)} target="_blank" rel="noreferrer" className="vp-btn-outline-pink">
                      PREVIEW <ExternalLink size={14} />
                    </a>
                    <button onClick={downloadResume} className="vp-btn-solid-pink-small">
                      <Download size={14} /> PULL PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="vp-solid-vault-empty">
                  <FileText size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                  <p>No active dossier found in high-security registry.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="vp-solid-footer-spacer" />
    </div>
  );
};

export default PortfolioPage;