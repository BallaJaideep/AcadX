import { useState } from "react";
import { submitWork } from "../../api/submissions";

const SubmitMilestoneWork = ({ projectId, milestoneId, onDone }) => {
  const [form, setForm] = useState({
    liveDemoLink: "",
    documentLink: "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.liveDemoLink || !form.documentLink) {
      alert("Please provide both links");
      return;
    }

    try {
      setLoading(true);
      await submitWork({
        projectId,
        milestoneId,
        liveDemoLink: form.liveDemoLink,
        documentLink: form.documentLink,
      });
      alert("Work submitted successfully");
      onDone?.();
      setForm({ liveDemoLink: "", documentLink: "" });
    } catch (err) {
      alert(err?.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={box}>
      <h4>Submit Work</h4>

      <input
        placeholder="Live Demo Link (https://...)"
        value={form.liveDemoLink}
        onChange={(e) =>
          setForm({ ...form, liveDemoLink: e.target.value })
        }
        style={input}
      />

      <input
        placeholder="Document / Report Link (Google Drive)"
        value={form.documentLink}
        onChange={(e) =>
          setForm({ ...form, documentLink: e.target.value })
        }
        style={input}
      />

      <button onClick={submit} disabled={loading} style={btn}>
        {loading ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
};

const box = {
  background: "#f8fafc",
  padding: 14,
  borderRadius: 10,
  marginTop: 10,
};

const input = {
  width: "100%",
  padding: 10,
  marginTop: 8,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const btn = {
  marginTop: 10,
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
  cursor: "pointer",
};

export default SubmitMilestoneWork;
