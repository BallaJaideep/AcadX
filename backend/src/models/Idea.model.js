// src/models/Idea.model.js
import mongoose from "mongoose";

const ideaSchema = new mongoose.Schema(
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
    domain: {
      type: String, // e.g., "Web Development", "AI/ML", "IoT"
      default: "",
    },
    techStack: {
      type: [String], // ["React", "Node.js", "MongoDB"]
      default: [],
    },
    difficulty: {
      type: String, // "beginner", "intermediate", "advanced"
      default: "beginner",
    },
    semesterSuggested: {
      type: Number, // recommended semester (e.g. 3, 4, 5)
      default: 1,
    },
    projectType: {
      type: String, // "mini", "major", "domain"
      default: "mini",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // faculty/admin who created this idea
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Idea = mongoose.model("Idea", ideaSchema);

export default Idea;
