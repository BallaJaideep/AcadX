import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { fileUrl } from "../../utils/fileUrl";
import "./FacultyDashboard.css"; // Reuse dashboard styling

const EvaluateSubmission = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form State
  const [marks, setMarks] = useState("");
  const [remarks, setRemarks] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/final-submission/project/${projectId}`);
        setSubmission(res.data.submission);
        if (!res.data.submission) {
            setError("The student has not uploaded their PPT and PDF files yet.");
        } else {
            setMarks(res.data.submission.pointsAwarded || "");
            setRemarks(res.data.submission.remarks || "");
        }
      } catch (err) {
        setError("Failed to fetch the student submission.");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [projectId]);

  const handleEvaluation = async (status) => {
    if (status === "approved" && (!marks || isNaN(marks) || marks < 0)) {
        alert("Please assign valid points/marks for this submission before approving.");
        return;
    }

    try {
      setActionBusy(true);
      await api.patch(`/final-submission/review/${submission._id}`, {
        status,
        remarks,
        marks: Number(marks)
      });
      alert(`Submission ${status === "approved" ? "Approved & Points Awarded" : "Rejected"} successfully.`);
      navigate(-1);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit evaluation");
    } finally {
      setActionBusy(false);
    }
  };

  if (loading) return (
    <div className="exe-loader-container">
      <div className="shimmer-text">Loading Submission Data...</div>
    </div>
  );

  return (
    <div className="exe-wrapper">
      <div className="exe-view-container" style={{ maxWidth: 800 }}>
        
        <header className="exe-view-header">
          <div className="header-text">
            <span className="exe-tag" onClick={() => navigate(-1)} style={{cursor: "pointer", display: "inline-block", marginBottom: 10, color: "#6366f1"}}>
              ← Back to Project
            </span>
            <h1 className="exe-title">Evaluate Final Project</h1>
            {submission && (
                <p className="text-body-muted">Student: {submission.studentId?.name} ({submission.studentId?.email})</p>
            )}
          </div>
        </header>

        {error ? (
           <div className="exe-error-container" style={{ marginTop: 20 }}>
             <h2 className="exe-error-title">Submission Not Found</h2>
             <p className="exe-error-msg">{error}</p>
             <button className="exe-btn-primary" onClick={() => navigate(-1)}>Go Back</button>
           </div>
        ) : (
           <div className="exe-dashboard-grid" style={{ gridTemplateColumns: "1fr", marginTop: 20 }}>
              
              {/* Submission Files */}
              <section className="exe-card-medium metric-card">
                 <h3 className="section-label-slate">Student Uploads</h3>
                 <div className="metric-list" style={{ marginTop: 16 }}>
                    <div className="metric-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div>
                         <span className="main-entity">Presentation Deck (PPT)</span>
                         <span className="sub-entity">Submitted: {new Date(submission.createdAt || submission.updatedAt).toLocaleDateString()}</span>
                       </div>
                       <div style={{ display: 'flex', gap: '10px' }}>
                          <a 
                             href={fileUrl(submission.pptPath)}
                             target="_blank" rel="noreferrer"
                             className="exe-btn-ghost-small"
                             style={{ textDecoration: 'none', background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe', padding: '6px 12px', borderRadius: '4px' }}
                          >
                             👁 View Presentation
                          </a>
                          <a 
                             href={fileUrl(submission.pptPath)}
                             download="Project_Presentation"
                             target="_blank" rel="noreferrer"
                             className="exe-btn-primary"
                             style={{ textDecoration: 'none', background: '#475569', padding: '6px 12px', fontSize: '12px' }}
                          >
                             ⬇ Download PPT
                          </a>
                       </div>
                    </div>
                    
                    <div className="metric-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div>
                         <span className="main-entity">Technical Document (PDF)</span>
                         <span className="sub-entity">Submitted: {new Date(submission.createdAt || submission.updatedAt).toLocaleDateString()}</span>
                       </div>
                       <div style={{ display: 'flex', gap: '10px' }}>
                           <a 
                              href={fileUrl(submission.documentPath)}
                              target="_blank" rel="noreferrer"
                              className="exe-btn-ghost-small"
                              style={{ textDecoration: 'none', background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe', padding: '6px 12px', borderRadius: '4px' }}
                           >
                              👁 View Document
                           </a>
                           <a 
                              href={fileUrl(submission.documentPath)}
                              download="Project_Technical_Document"
                              target="_blank" rel="noreferrer"
                              className="exe-btn-primary"
                              style={{ textDecoration: 'none', background: '#475569', padding: '6px 12px', fontSize: '12px' }}
                           >
                              ⬇ Download PDF
                           </a>
                       </div>
                    </div>
                 </div>
              </section>

              {/* Evaluation Panel */}
              <section className="exe-card-medium wide-card" style={{ marginTop: 20 }}>
                 <h3 className="section-label-purple">Assign Marks & Evaluator Feedback</h3>
                 
                 {submission.marksAdministered && (
                    <div className="exe-alert success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 16px", borderRadius: 8, color: "#166534", marginBottom: 20 }}>
                       <div>
                         ✅ <strong>Points Awarded!</strong> Marks have already been finalized for this submission.
                       </div>
                       {!isEditing && (
                         <button 
                            onClick={() => setIsEditing(true)}
                            style={{ background: '#fff', border: '1px solid #166534', color: '#166534', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                         >
                            ✏️ Edit Marks
                         </button>
                       )}
                    </div>
                 )}

                 <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 16 }}>
                    
                    <div>
                       <label className="exe-label" style={{ display: 'block', marginBottom: 8, color: '#94a3b8' }}>Assign Total Project Points (Marks)</label>
                       <input 
                         type="number"
                         min="0"
                         max="1000"
                         value={marks}
                         onChange={e => setMarks(e.target.value)}
                         disabled={submission.marksAdministered && !isEditing}
                         placeholder="e.g. 100"
                         style={{
                            width: "100%",
                            padding: "12px 16px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            background: (submission.marksAdministered && !isEditing) ? "#f1f5f9" : "#fff",
                            color: (submission.marksAdministered && !isEditing) ? "#64748b" : "#0f172a",
                            fontSize: "16px",
                            outline: "none",
                            cursor: (submission.marksAdministered && !isEditing) ? "not-allowed" : "text"
                         }}
                       />
                       <small style={{ color: '#64748b', display: 'block', marginTop: 6 }}>These points will instantly reflect on the HOD/Student leaderboards.</small>
                    </div>

                    <div>
                       <label className="exe-label" style={{ display: 'block', marginBottom: 8, color: '#94a3b8' }}>Evaluator Remarks</label>
                       <textarea 
                         value={remarks}
                         onChange={e => setRemarks(e.target.value)}
                         disabled={submission.marksAdministered && !isEditing}
                         placeholder="Enter feedback for the student..."
                         rows={4}
                         style={{
                            width: "100%",
                            padding: "12px 16px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            background: (submission.marksAdministered && !isEditing) ? "#f1f5f9" : "#fff",
                            color: (submission.marksAdministered && !isEditing) ? "#64748b" : "#0f172a",
                            fontSize: "14px",
                            outline: "none",
                            resize: "vertical",
                            cursor: (submission.marksAdministered && !isEditing) ? "not-allowed" : "text"
                         }}
                       />
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                       {(!submission.marksAdministered || isEditing) && (
                         <button 
                           className="exe-btn-primary"
                           onClick={() => handleEvaluation("approved")}
                           disabled={actionBusy}
                           style={{ background: submission.marksAdministered ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "linear-gradient(135deg, #10b981, #059669)", border: "none", flex: 1 }}
                         >
                           {actionBusy ? "Processing..." : (submission.marksAdministered ? "Save Updated Marks & Recalculate Points" : "Approve & Award Points")}
                         </button>
                       )}

                       {!submission.marksAdministered && (
                          <button 
                            className="exe-btn-ghost-small red"
                            onClick={() => handleEvaluation("changes_requested")}
                            disabled={actionBusy}
                            style={{ flex: 1, color: "#f87171", borderColor: "rgba(239,68,68,0.3)", padding: "12px" }}
                          >
                            {actionBusy ? "Processing..." : "Reject (Request Re-upload)"}
                          </button>
                       )}
                    </div>

                 </div>
              </section>

           </div>
        )}
      </div>
    </div>
  );
};

export default EvaluateSubmission;
