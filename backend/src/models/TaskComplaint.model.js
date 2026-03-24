import mongoose from "mongoose";

const taskComplaintSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    weeklyMilestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WeeklyMilestone",
      required: true,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WeeklyTask",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    aiSuggestions: {
      videos: [
        {
          title: String,
          url: String,
        },
      ],
      articles: [
        {
          title: String,
          url: String,
        },
      ],
    },

    facultyReply: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open",
    },
  },
  { timestamps: true }
);

export default mongoose.model("TaskComplaint", taskComplaintSchema);
