import mongoose from "mongoose";

const hodComplaintSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "RESOLVED"],
      default: "PENDING",
    },

    hodResponse: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("HodComplaint", hodComplaintSchema);
