import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/client";
import "./FinalSubmission.css";

const FinalSubmission = () => {
  const { projectId: id } = useParams();
  const [ppt, setPpt] = useState(null);
  const [document, setDocument] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadSubmission = async () => {
    try {
      // Note: replaced 'projectId' with 'id' from useParams to match your logic
      const res = await api.get(`/final-submission/project/${id}`);
      setSubmission(res.data.submission);
    } catch {
      setSubmission(null);
    }
  };

  useEffect(() => {
    loadSubmission();
  }, []);

  const submitFinal = async () => {
    if (!ppt || !document) {
      alert("Please upload both PPT and Document");
      return;
    }

    const formData = new FormData();
    formData.append("ppt", ppt);
    formData.append("document", document);
    formData.append("projectId", id);
    
    try {
      setLoading(true);
      await api.post(`/final-submission/submit/${id}`, formData);
      alert("Final submission uploaded successfully");
      loadSubmission();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="exe-wrapper">
      <div className="exe-compact-card">
        <header className="exe-card-header">
          <div className="title-area">
            <span className="exe-tag">Final Requirement</span>
            <h1 className="exe-title">Project Submission Portal</h1>
          </div>
          {submission && (
            <div className={`exe-status-pill ${submission.status}`}>
              {submission.status.replace("_", " ")}
            </div>
          )}
        </header>

        <div className="exe-card-body">
          {/* Status Feedback Messages */}
          {submission?.status === "approved" && (
            <div className="exe-alert success">
              <span className="icon">✅</span>
              <div>
                <strong>Submission Approved</strong>
                <p>Faculty has verified your records. Project lifecycle complete.</p>
              </div>
            </div>
          )}

          {submission?.status === "changes_requested" && (
            <div className="exe-alert warning">
              <span className="icon">🔁</span>
              <div>
                <strong>Revisions Required</strong>
                <p>Faculty has requested updates. Please re-upload corrected files.</p>
              </div>
            </div>
          )}

          {/* Upload Form: Only shows if no submission or if changes are requested */}
          {(!submission || submission.status === "changes_requested") ? (
            <div className="exe-upload-grid">
              <div className="upload-box">
                <label className="exe-label">Presentation Deck (PPT)</label>
                <div className="custom-file-input">
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx"
                    onChange={(e) => setPpt(e.target.files[0])}
                  />
                  <div className="file-dummy">
                    {ppt ? ppt.name : "Select PPTX File"}
                  </div>
                </div>
              </div>

              <div className="upload-box">
                <label className="exe-label">Technical Document (PDF)</label>
                <div className="custom-file-input">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setDocument(e.target.files[0])}
                  />
                  <div className="file-dummy">
                    {document ? document.name : "Select PDF Document"}
                  </div>
                </div>
              </div>

              <div className="exe-form-footer">
                <p className="exe-disclaimer">
                  By submitting, you certify that this work is original and adheres to university placement guidelines.
                </p>
                <button
                  onClick={submitFinal}
                  disabled={loading}
                  className="exe-btn-primary"
                >
                  {loading ? "Processing..." : "Submit Final Project"}
                </button>
              </div>
            </div>
          ) : (
            <div className="exe-dashboard-grid" style={{ gridTemplateColumns: "1fr", marginTop: 20 }}>
               
               {/* Read-Only Submitted Files */}
               <section className="exe-card-medium metric-card">
                  <h3 className="section-label-slate">Your Uploads</h3>
                  <div className="metric-list" style={{ marginTop: 16 }}>
                     <div className="metric-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <span className="main-entity">Presentation Deck (PPT)</span>
                          <span className="sub-entity">Submitted: {new Date(submission.createdAt || submission.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                           <a 
                              href={`http://localhost:5000${submission.pptPath}`}
                              target="_blank" rel="noreferrer"
                              className="exe-btn-ghost-small"
                              style={{ textDecoration: 'none', background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe', padding: '6px 12px', borderRadius: '4px' }}
                           >
                              👁 View PPT
                           </a>
                           <a 
                              href={`http://localhost:5000${submission.pptPath}`}
                              download="Project_Presentation"
                              target="_blank" rel="noreferrer"
                              className="exe-btn-primary"
                              style={{ textDecoration: 'none', background: '#475569', padding: '6px 12px', fontSize: '12px' }}
                           >
                              ⬇ Download PPT
                           </a>
                        </div>
                     </div>
                     
                     <div className="metric-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                        <div>
                          <span className="main-entity">Technical Document (PDF)</span>
                          <span className="sub-entity">Submitted: {new Date(submission.createdAt || submission.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                           <a 
                              href={`http://localhost:5000${submission.documentPath}`}
                              target="_blank" rel="noreferrer"
                              className="exe-btn-ghost-small"
                              style={{ textDecoration: 'none', background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe', padding: '6px 12px', borderRadius: '4px' }}
                           >
                              👁 View PDF
                           </a>
                           <a 
                              href={`http://localhost:5000${submission.documentPath}`}
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

               {/* Evaluation Details */}
               {submission.marksAdministered && (
                 <section className="exe-card-medium wide-card" style={{ marginTop: 20 }}>
                    <h3 className="section-label-purple">Faculty Evaluation Details</h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 16 }}>
                       <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px' }}>Points Awarded</span>
                          <div style={{ fontSize: '28px', color: '#10b981', fontWeight: 800, marginTop: '4px' }}>
                            {submission.pointsAwarded} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>pts</span>
                          </div>
                       </div>

                       {submission.remarks && (
                         <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px' }}>Evaluator Remarks</span>
                            <p style={{ margin: '8px 0 0', color: '#334155', lineHeight: 1.5 }}>
                              {submission.remarks}
                            </p>
                         </div>
                       )}
                    </div>
                 </section>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinalSubmission;