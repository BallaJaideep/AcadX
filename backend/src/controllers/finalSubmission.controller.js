import FinalSubmission from "../models/FinalSubmission.model.js";
import Project from "../models/Project.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

/* ======================================================
   STUDENT — SUBMIT FINAL PROJECT
   POST /api/final-submission/submit/:projectId
====================================================== */
export const submitFinalProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const studentId = req.user._id;

    // ✅ Validate projectId
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        message: "Valid project ID is required",
      });
    }

    // ✅ Validate files
    if (!req.files?.ppt || !req.files?.document) {
      return res.status(400).json({
        message: "Both PPT and document files are required",
      });
    }

    // ✅ Ensure project exists and belongs to student
    const project = await Project.findOne({
      _id: projectId,
      studentId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or access denied",
      });
    }

    // ✅ File paths (Matches multer uploadDir)
    const pptPath = `/uploads/final-submissions/${req.files.ppt[0].filename}`;
    const documentPath = `/uploads/final-submissions/${req.files.document[0].filename}`;

    // ✅ Upsert final submission (re-submission allowed)
    const submission = await FinalSubmission.findOneAndUpdate(
      { projectId },
      {
        projectId,
        studentId,
        pptPath,
        documentPath,
        status: "submitted",
        remarks: "",
        reviewedBy: null,
        reviewedAt: null,
        submittedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return res.json({
      message: "Final project submitted successfully",
      submission,
    });
  } catch (error) {
    console.error("❌ submitFinalProject error:", error);
    return res.status(500).json({
      message: "Failed to submit final project",
    });
  }
};

/* ======================================================
   FACULTY / HOD — REVIEW FINAL SUBMISSION
   PATCH /api/final-submission/review/:submissionId
====================================================== */
export const reviewFinalSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { status, remarks } = req.body;
    const reviewerId = req.user._id;

    // ✅ Validate submissionId
    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({
        message: "Invalid submission ID",
      });
    }

    // ✅ Validate status
    const allowedStatuses = ["approved", "changes_requested"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid review status",
      });
    }

    const submission = await FinalSubmission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({
        message: "Final submission not found",
      });
    }

    const marksToAward = Number(req.body.marks) || 0;

    if (status === "approved" && marksToAward >= 0) {
       // If giving marks for the first time
       if (!submission.marksAdministered) {
          await User.findByIdAndUpdate(submission.studentId, {
             $inc: { points: marksToAward }
          });
       } 
       // If updating previously awarded marks
       else {
          const pointDifference = marksToAward - submission.pointsAwarded;
          if (pointDifference !== 0) {
             await User.findByIdAndUpdate(submission.studentId, {
                $inc: { points: pointDifference }
             });
          }
       }
       submission.marksAdministered = true;
       submission.pointsAwarded = marksToAward;
    } else if (status === "changes_requested") {
       // Optional: Could deduct points if sent back to changes, but typically we keep them until re-approved
    }

    submission.status = status;
    submission.remarks = remarks || "";
    submission.reviewedBy = reviewerId;
    submission.reviewedAt = new Date();

    await submission.save();

    return res.json({
      message: "Final submission reviewed successfully",
      submission,
    });
  } catch (error) {
    console.error("❌ reviewFinalSubmission error:", error);
    return res.status(500).json({
      message: "Failed to review final submission",
    });
  }
};

/* ======================================================
   GET FINAL SUBMISSION BY PROJECT
   GET /api/final-submission/project/:projectId
====================================================== */
export const getFinalSubmissionByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const submission = await FinalSubmission.findOne({ projectId })
      .populate("studentId", "name email")
      .populate("reviewedBy", "name role")
      .lean();

    return res.json({
      submission: submission || null,
    });
  } catch (error) {
    console.error("❌ getFinalSubmissionByProject error:", error);
    return res.status(500).json({
      message: "Failed to fetch final submission",
    });
  }
};
