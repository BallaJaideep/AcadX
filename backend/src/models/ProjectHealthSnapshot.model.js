import mongoose from "mongoose";

const projectHealthSnapshotSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // --- GitHub Metrics ---
    commitsCount: {
      type: Number,
      default: 0,
    },
    
    prsOpened: {
      type: Number,
      default: 0,
    },

    issuesActivity: {
      type: Number, 
      default: 0, // General metric for issue comments/creation
    },

    // --- Health Metrics ---
    dailyHealthScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },

    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

/* ======================================================
   SAFE MODEL EXPORT (PREVENT OVERWRITE ERROR)
 ====================================================== */
const ProjectHealthSnapshot =
  mongoose.models.ProjectHealthSnapshot ||
  mongoose.model("ProjectHealthSnapshot", projectHealthSnapshotSchema);

export default ProjectHealthSnapshot;
