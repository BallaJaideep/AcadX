import Submission from "../models/Submission.model.js";

/* ======================================================
   STUDENT: Submit milestone work (LINK BASED)
====================================================== */
export const submitWork = async (req, res) => {
  try {
    const { projectId, milestoneId, liveDemoLink, documentLink } = req.body;

    if (!projectId || !milestoneId || !liveDemoLink || !documentLink) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const submission = await Submission.create({
      projectId,
      milestoneId,
      studentId: req.user._id,
      liveDemoLink,
      documentLink,
    });

    res.status(201).json({
      message: "Submission successful",
      submission,
    });
  } catch (err) {
    console.error("Submit work error:", err);
    res.status(500).json({ message: "Submission failed" });
  }
};

/* ======================================================
   FACULTY: Review submission
====================================================== */
export const reviewSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.status = status;
    submission.feedback = feedback || "";
    await submission.save();

    res.json({
      message: "Submission reviewed successfully",
      submission,
    });
  } catch (err) {
    console.error("Review submission error:", err);
    res.status(500).json({ message: "Review failed" });
  }
};

/* ======================================================
   STUDENT: Get my submissions
====================================================== */
export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({
      studentId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
};

/* ======================================================
   FACULTY: Get submissions by project
====================================================== */
export const getSubmissionsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const submissions = await Submission.find({ projectId })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch project submissions" });
  }
};
