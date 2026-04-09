import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { Activity, ArrowRight } from "lucide-react";

/**
 * Empty redirector page that figures out which project's analytics to show
 * when the student clicks "My Velocity" in the global navbar.
 */
const GlobalAnalyticsRedirect = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActiveProject = async () => {
      try {
        const res = await api.get("/projects");
        const projects = res.data.projects || res.data || [];
        
        // Find the first eligible project (created after feature rollout approx 2026-03-31)
        // Or if they just have 1 project, pick that one.
        const activeProject = projects.find(p => {
          const status = (p.status || p.derivedStatus || "pending").toLowerCase();
          return status !== "completed";
        }) || projects[0];

        if (activeProject) {
          // Immediately redirect to the specific project's analytics page
          navigate(`/student/project/${activeProject._id}/analytics`, { replace: true });
        } else {
          setError("No active projects found. Initiate a project track first to view Developer Velocity metrics.");
          setLoading(false);
        }
      } catch (err) {
        setError("Failed to fetch projects to route you to your analytics.");
        setLoading(false);
      }
    };

    fetchActiveProject();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', color: '#94a3b8' }}>
        <p>Routing to your Developer Velocity dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', color: '#f8fafc', background: '#020617', padding: '24px' }}>
        <Activity size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Analytics Unavailable</h2>
        <p style={{ color: '#94a3b8', maxWidth: '400px', textAlign: 'center', marginBottom: '24px', lineHeight: 1.5 }}>{error}</p>
        <button 
          onClick={() => navigate("/student/create-project")}
          style={{ background: 'var(--brand)', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          Initiate Track <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return null;
};

export default GlobalAnalyticsRedirect;
