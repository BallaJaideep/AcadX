import React, { useEffect, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { 
  ArrowLeft, Activity, Github, AlertCircle, BarChart2, GitCommit, GitPullRequest, Layout, BrainCircuit, Radar
} from "lucide-react";
import "./ProjectAnalytics.css";

const ProjectAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  
  const isAuthenticated = auth ? auth.isAuthenticated : false;
  const user = auth ? auth.user : null;

  const [project, setProject] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdatingGithub, setIsUpdatingGithub] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projRes, healthRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/analytics/project/${id}`).catch(() => ({ data: null }))
        ]);
        
        const proj = projRes.data.project || projRes.data;
        setProject(proj);
        
        const hData = healthRes.data;
        setHealthData(hData);
        setGithubUrl(proj.githubUrl || (hData ? hData.githubUrl : "") || "");
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };
    if (id) loadData();
  }, [id]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (loading) return (
    <div className="pa-loader">
      <div className="vp-spin" />
      <span>Initializing Analytics Engine...</span>
    </div>
  );

  if (error || !project) return (
    <div className="pa-root">
      <div className="pa-error-card">
        <AlertCircle size={48} color="#ef4444" />
        <h2>Intelligence Failure</h2>
        <p>{error || "Metrics cannot be displayed at this time."}</p>
        <button onClick={() => navigate(-1)} className="vp-btn-vibrant">
          <ArrowLeft size={18} /> Return
        </button>
      </div>
    </div>
  );

  const isProjectCompleted = (project.status || project.derivedStatus || "pending").toLowerCase() === "completed";
  const hasSnapshots = healthData && healthData.snapshots && healthData.snapshots.length > 0;
  
  let scoreColor = '#94a3b8'; // default gray N/A
  let statusText = "Establishing baseline...";
  if (hasSnapshots) {
    if (healthData.currentHealthScore < 50) { scoreColor = '#ef4444'; statusText = "Critical Dropout Risk"; }
    else if (healthData.currentHealthScore < 80) { scoreColor = '#f59e0b'; statusText = "Warning - Low Engagement"; }
    else { scoreColor = '#10b981'; statusText = "Healthy Velocity"; }
  }

  // Engine for UI display of Pattern and Anomaly
  const analyzePatterns = (snapshots) => {
    if (!snapshots || snapshots.length === 0) return { type: "pending", title: "Waiting for Data", text: "We need more data from your GitHub to learn how you work." };

    const recent = snapshots.slice(0, 3);
    const zeroCommitsStreak = recent.every(s => s && s.commitsCount === 0);
    
    if (zeroCommitsStreak && recent.length === 3) {
      return { type: "anomaly", title: "Looks Quiet!", text: "You haven't pushed any code for 3 days! Remember to stay consistent to keep your project moving forward." };
    }

    const totalRecent = snapshots.slice(0, 7).reduce((acc, curr) => acc + (curr ? curr.commitsCount : 0), 0);
    if (totalRecent > 15) {
      return { type: "pattern", title: "Great Momentum!", text: "You are pushing code very consistently. Keep up this amazing energy!" };
    }

    if (totalRecent > 0 && totalRecent <= 15) {
       return { type: "healthy", title: "On Track", text: "You are making steady progress and your coding history looks healthy." };
    }

    return { type: "anomaly", title: "A Bit Inconsistent", text: "Your work pattern has been up and down lately. Try pushing smaller amounts of code more often instead of waiting!" };
  };

  const engineResult = analyzePatterns(healthData?.snapshots);
  
  const getEngineColor = (type) => {
    if (type === "anomaly") return "#ef4444";
    if (type === "pattern" || type === "healthy") return "#8b5cf6"; // Purple AI glow
    return "#94a3b8";
  };

  const handleUpdateGithubUrl = async () => {
    if (!githubUrl) return;
    setIsUpdatingGithub(true);
    try {
      await api.put(`/analytics/project/${id}/github`, { githubUrl });
      // Soft refresh metrics
      const healthRes = await api.get(`/analytics/project/${id}`);
      setHealthData(healthRes.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to link GitHub repository");
    } finally {
      setIsUpdatingGithub(false);
    }
  };

  return (
    <div className="pa-root">
      <div className="pa-container">
        {/* HEADER */}
        <header className="pa-header">
          <button className="vp-back-btn-minimal" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="pa-title">Performance Analytics</h1>
            <p className="pa-subtitle">Real-time developer velocity and intelligence tracking for <strong>{project.title}</strong></p>
          </div>
        </header>

        {isProjectCompleted && !githubUrl && (
          <div className="pa-warning-banner">
            <AlertCircle size={24} />
            <div>
              <h3>Project Completion Flagged</h3>
              <p>This project is officially marked completed, but no GitHub repository is linked. Please link your repository below to verify your work.</p>
            </div>
          </div>
        )}

        <div className="pa-grid">
          {/* MAIN SCORE CARD */}
          <div className="pa-card pa-score-card">
            <div className="pa-card-header">
              <Activity size={20} /> <h2>Overall Health Score</h2>
            </div>
            
            <div className="pa-score-display">
              <svg className="pa-score-circle" viewBox="0 0 100 100">
                <circle className="pa-circle-bg" cx="50" cy="50" r="45" />
                {hasSnapshots && (
                  <circle 
                    className="pa-circle-progress" 
                    cx="50" cy="50" r="45" 
                    stroke={scoreColor}
                    strokeDasharray={`${(healthData.currentHealthScore / 100) * 283} 283`}
                  />
                )}
                <text x="50" y="55" className="pa-score-text" fill={hasSnapshots ? scoreColor : '#fff'}>
                  {hasSnapshots ? healthData.currentHealthScore : "N/A"}
                </text>
              </svg>
              <div className="pa-score-info">
                <h3 style={{ color: scoreColor }}>{hasSnapshots ? statusText : "No Baseline Data"}</h3>
                <p>This score calculates your weekly commit consistency, PR generation, and issue resolution patterns.</p>
              </div>
            </div>
          </div>

          {/* GITHUB LINKING CARD (STUDENTS ONLY) */}
          {user?.role === 'student' && (
            <div className="pa-card">
              <div className="pa-card-header">
                <Github size={20} /> <h2>Repository Integration</h2>
              </div>
              
              <div className="pa-repo-setup">
                <p>Link your public GitHub repository to enable advanced automated developer analytics.</p>
                <div className="pa-input-group">
                  <input 
                    type="url" 
                    placeholder="https://github.com/owner/repo"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="pa-input"
                  />
                  <button 
                    onClick={handleUpdateGithubUrl}
                    disabled={isUpdatingGithub || !githubUrl}
                    className="pa-btn-primary"
                  >
                    {isUpdatingGithub ? "Linking..." : "Synchronize Repository"}
                  </button>
                </div>
                {healthData?.githubUrl && (
                  <div className="pa-linked-status">
                    <span className="pa-status-dot active"></span>
                    Currently tracking: <a href={healthData.githubUrl} target="_blank" rel="noreferrer">{new URL(healthData.githubUrl).pathname.slice(1)}</a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ACTIVITY HEATMAP */}
          <div className="pa-card pa-heatmap-card">
            <div className="pa-card-header">
              <Layout size={20} /> <h2>30-Day Velocity Map</h2>
            </div>
            
            <div className="pa-heatmap-container">
              {(!healthData || !healthData.githubUrl) ? (
                <div className="pa-empty-state">Connect a repository to view velocity map</div>
              ) : (
                <div className="pa-heatmap-grid">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const count = healthData.snapshots?.[i]?.commitsCount || 0;
                    const bg = count === 0 ? '#e2e8f0' : count < 3 ? '#86efac' : count < 6 ? '#22c55e' : '#166534';
                    
                    // Simple mock date label
                    const d = new Date();
                    d.setDate(d.getDate() - (29 - i));

                    return (
                      <div key={i} className="pa-heatmap-block" style={{ background: bg }}>
                        <div className="pa-tooltip">
                          {count} commits on {d.toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="pa-heatmap-legend">
                <span>Less</span>
                <div style={{background: '#e2e8f0'}} className="pa-legend-box" />
                <div style={{background: '#86efac'}} className="pa-legend-box" />
                <div style={{background: '#22c55e'}} className="pa-legend-box" />
                <div style={{background: '#166534'}} className="pa-legend-box" />
                <span>More</span>
              </div>
            </div>
          </div>

          {/* PATTERN & ANOMALY ENGINE */}
          <div className="pa-card pa-engine-card">
            <div className="pa-card-header">
              <BrainCircuit size={20} color="#8b5cf6" /> <h2>Behavioral & Risk Engine</h2>
            </div>
            
            <div className="pa-engine-display">
              <div className="pa-radar-ring">
                <Radar size={32} color={getEngineColor(engineResult.type)} className={engineResult.type === "pending" ? "" : "pulse-anim"} />
              </div>
              <div className="pa-engine-text">
                <h3 style={{ color: getEngineColor(engineResult.type) }}>{engineResult.title}</h3>
                <p>{engineResult.text}</p>
                {engineResult.type !== "pending" && (
                  <div className="pa-engine-scanline" />
                )}
              </div>
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="pa-card pa-stats-card">
            <div className="pa-card-header">
              <BarChart2 size={20} /> <h2>Recent Activity (24h)</h2>
            </div>
            <div className="pa-stats-grid">
              <div className="pa-stat-box">
                <GitCommit size={24} color="#6366f1" />
                <span className="pa-stat-val">{hasSnapshots && healthData.snapshots[0] ? healthData.snapshots[0].commitsCount : 0}</span>
                <span className="pa-stat-lab">Commits</span>
              </div>
              <div className="pa-stat-box">
                <GitPullRequest size={24} color="#ec4899" />
                <span className="pa-stat-val">{hasSnapshots && healthData.snapshots[0] ? healthData.snapshots[0].prsOpened : 0}</span>
                <span className="pa-stat-lab">Pull Requests</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ProjectAnalytics;
