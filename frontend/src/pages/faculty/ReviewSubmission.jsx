import { useState } from "react";
import api from "../../api/client";

const FacultyReview = ({ submission, reload }) => {
  const [comment, setComment] = useState("");

  const act = async (action) => {
    await api.patch(
      `/final-submission/review/${submission._id}`,
      { action, comment }
    );
    reload();
  };

  return (
    <div
      style={{
        marginTop: 12,
        padding: 10,
        background: "#f8fafc",
        borderRadius: 6,
      }}
    >
      <textarea
        placeholder="Faculty comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        style={{ width: "100%", minHeight: 60 }}
      />

      <div style={{ marginTop: 8 }}>
        <button
          onClick={() => act("approve")}
          style={{
            background: "#16a34a",
            color: "#fff",
            padding: "6px 12px",
            border: "none",
            borderRadius: 4,
            marginRight: 8,
          }}
        >
          Approve
        </button>

        <button
          onClick={() => act("changes")}
          style={{
            background: "#dc2626",
            color: "#fff",
            padding: "6px 12px",
            border: "none",
            borderRadius: 4,
          }}
        >
          Request Changes
        </button>
      </div>
    </div>
  );
};

export default FacultyReview;
