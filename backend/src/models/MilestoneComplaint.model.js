// import mongoose from "mongoose";

// const milestoneComplaintSchema = new mongoose.Schema(
//   {
//     milestoneId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Milestone",
//       required: true,
//     },
//     projectId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Project",
//       required: true,
//     },
//     studentId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     reason: {
//       type: String,
//       required: true,
//     },

//     aiSuggestions: [
//       {
//         title: String,
//         url: String,
//       },
//     ],

//     status: {
//       type: String,
//       enum: ["PENDING", "AI_ACCEPTED", "ESCALATED", "RESOLVED"],
//       default: "PENDING",
//     },

//     response: String,
//     resolvedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model(
//   "MilestoneComplaint",
//   milestoneComplaintSchema
// );
import mongoose from "mongoose";

const milestoneComplaintSchema = new mongoose.Schema(
  {
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Milestone",
      required: true,
    },
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

    reason: { type: String, required: true },

    aiSuggestions: [
      {
        title: String,
        links: [String],
      },
    ],

    status: {
      type: String,
      enum: ["PENDING", "ACKNOWLEDGED", "RESOLVED", "REOPENED"],
      default: "PENDING",
    },

    facultyResponse: String,

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    resolvedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model(
  "MilestoneComplaint",
  milestoneComplaintSchema
);
