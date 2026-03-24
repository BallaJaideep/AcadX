// import mongoose from "mongoose";

// const milestoneSchema = new mongoose.Schema(
//   {
//     projectId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Project",
//       required: true,
//     },

//     title: { type: String, required: true },
//     description: String,

//     weekNumber: {
//       type: Number,
//       required: true,
//       immutable: true, // 🔒 important
//     },

//     orderIndex: {
//       type: Number,
//       required: true,
//       immutable: true,
//     },

//     status: {
//       type: String,
//       enum: ["todo", "completed"],
//       default: "todo",
//     },

//     completedAt: Date,
//     completedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Milestone", milestoneSchema);
import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    weekNumber: {
      type: Number,
      required: true,
    },

    orderIndex: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["todo", "completed"],
      default: "todo",
    },

    completedAt: Date,

    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    youtubeLinks: {
      type: [String],
      default: [],
    },

    tutorialLinks: {
      type: [String],
      default: [],
    },

    documentLinks: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// ✅ PREVENT OverwriteModelError (CRITICAL)
const Milestone =
  mongoose.models.Milestone ||
  mongoose.model("Milestone", milestoneSchema);

export default Milestone;
