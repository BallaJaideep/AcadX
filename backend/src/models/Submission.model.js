import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Milestone",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    liveDemoLink: {
      type: String,
      required: true,
      trim: true,
    },

    documentLink: {
      type: String,
      required: true,
      trim: true,
    },

    feedback: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["SUBMITTED", "ACCEPTED", "REJECTED"],
      default: "SUBMITTED",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Submission", submissionSchema);
