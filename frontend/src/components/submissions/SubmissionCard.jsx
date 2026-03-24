import { useState } from "react";
import { reviewSubmission } from "../../api/submissions";

const SubmissionCard = ({ submission, reload }) => {
  const [feedback, setFeedback] = useState("");

  return (
    <div style={card}>
      <p><b>Student:</b> {submission.studentId?.name}</p>

      <a href={submission.liveDemoLink} target="_blank">
        🔗 Live Demo
      </a>
      <br />
      <a href={submission.documentLink} target="_blank">
        📄 Document
      </a>

      <p>Status: <b>{submission.status}</b></p>

      <textarea
        placeholder="Faculty feedback"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        style={textarea}
      />

      <div>
        <button
          onClick={async () => {
            await reviewSubmission(submission._id, "ACCEPTED", feedback);
            reload();
          }}
          style={btn("#16a34a")}
        >
          Accept
        </button>

        <button
          onClick={async () => {
            await reviewSubmission(submission._id, "REJECTED", feedback);
            reload();
          }}
          style={btn("#dc2626")}
        >
          Reject
        </button>
      </div>
    </div>
  );
};

const card = {
  background: "#fff",
  padding: 14,
  borderRadius: 10,
  marginBottom: 12,
};

const textarea = {
  width: "100%",
  minHeight: 60,
  marginTop: 8,
};

const btn = (bg) => ({
  background: bg,
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  marginRight: 6,
  borderRadius: 6,
  cursor: "pointer",
});

export default SubmissionCard;
