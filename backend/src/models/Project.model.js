// src/models/Project.model.js
import mongoose from "mongoose";
import { PROJECT_STATUS } from "../constants/projectStatus.js";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    problemStatement: {
      type: String,
      default: "",
    },

    objective: {
      type: String,
      default: "",
    },

    outcome: {
      type: String,
      default: "",
    },

    budget: {
      type: String,
      default: "Minimal",
    },

    department: {
      type: String,
      default: "",
    },

    domain: {
      type: String, // e.g. "Web Development", "AI/ML", "IoT"
      default: "",
    },

    techStack: {
      type: [String], // ["React", "Node.js", "MongoDB"]
      default: [],
    },

    // project owner
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // optional team members
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.DRAFT,
    },

    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: 1,
    },

    projectType: {
      type: String, // "mini", "major", etc.
      default: "mini",
    },

    ideaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Idea",
      default: null,
    },
  },
  { timestamps: true }
);

/* ======================================================
   SAFE MODEL EXPORT (PREVENT OVERWRITE ERROR)
 ====================================================== */
const Project =
  mongoose.models.Project ||
  mongoose.model("Project", projectSchema);

export default Project;
