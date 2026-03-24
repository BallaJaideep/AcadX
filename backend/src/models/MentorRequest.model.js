// src/models/MentorRequest.model.js
import mongoose from "mongoose";

const mentorRequestSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedFacultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    reason: {
      type: String,
      default: "",
    },
    suggestions: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "REJECTED_RECREATE"],
      default: "PENDING",
    },
    projectRegenerated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const MentorRequest =
  mongoose.models.MentorRequest ||
  mongoose.model("MentorRequest", mentorRequestSchema);

export default MentorRequest;
