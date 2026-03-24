// import { useState } from "react";
// import api from "../../api/client";

// const GenerateMilestonesButton = ({ projectId, onDone }) => {
//   const [loading, setLoading] = useState(false);

//   const generate = async () => {
//     if (!projectId) return;

//     const ok = window.confirm(
//       "Generate weekly milestones using AI? This can be done only once."
//     );
//     if (!ok) return;

//     try {
//       setLoading(true);
//       await api.post("/milestones/ai-generate", { projectId });
//       onDone && onDone();
//     } catch (err) {
//       alert(err?.response?.data?.message || "Failed to generate milestones");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <button
//       onClick={generate}
//       disabled={loading}
//       className="complete-btn"
//       style={{ marginBottom: 12 }}
//     >
//       {loading ? "Generating..." : "⚡ Generate Milestones with AI"}
//     </button>
//   );
// };

// export default GenerateMilestonesButton;
import { useState } from "react";
import api from "../../api/client";
import "./GenerateMilestonesButton.css";

const GenerateMilestonesButton = ({ projectId, onDone }) => {
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!projectId) return;

    // Custom confirm logic could be replaced with a Modal later, 
    // but for now, we'll keep it functional and clean.
    const ok = window.confirm(
      "Initialize Project Roadmap? AI will synthesize weekly milestones based on your project scope. This action is permanent."
    );
    if (!ok) return;

    try {
      setLoading(true);
      await api.post("/milestones/ai-generate", { projectId });
      if (onDone) onDone();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to generate roadmap.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="exe-action-container">
      <button
        onClick={generate}
        disabled={loading}
        className={`exe-btn-ai ${loading ? "is-loading" : ""}`}
      >
        <span className="btn-icon">{loading ? "⏳" : "✨"}</span>
        <span className="btn-text">
          {loading ? "Synthesizing Roadmap..." : "Initialize AI Milestones"}
        </span>
      </button>
      {!loading && (
        <span className="exe-helper-text">One-time AI initialization</span>
      )}
    </div>
  );
};

export default GenerateMilestonesButton;