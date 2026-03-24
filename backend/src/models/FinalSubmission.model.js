import mongoose from "mongoose";

const finalSubmissionSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    pptPath: String,
    documentPath: String,

    status: {
      type: String,
      enum: ["submitted", "approved", "rejected"],
      default: "submitted",
    },

    remarks: {
      type: String,
      default: "",
    },

    marksAdministered: {
      type: Boolean,
      default: false,
    },

    pointsAwarded: {
      type: Number,
      default: 0,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("FinalSubmission", finalSubmissionSchema);
