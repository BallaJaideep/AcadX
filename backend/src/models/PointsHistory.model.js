// src/models/PointsHistory.model.js
import mongoose from "mongoose";

const pointsHistorySchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    reason: {
      type: String, // e.g. "Submitted SRS", "Project completed"
      required: true,
    },
    sourceType: {
      type: String, // "submission", "manual", "project", etc.
      default: "manual",
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null, // can link to Submission/Project later
    },
  },
  { timestamps: true }
);

const PointsHistory = mongoose.model("PointsHistory", pointsHistorySchema);

export default PointsHistory;
