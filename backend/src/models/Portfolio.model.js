import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    tagline: {
      type: String,
      default: "",
    },

    about: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    projects: [
      {
        title: String,
        status: {
          type: String,
          enum: ["In Progress", "Completed"],
        },
        aiSummary: String,
      },
    ],

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Portfolio =
  mongoose.models.Portfolio ||
  mongoose.model("Portfolio", portfolioSchema);

export default Portfolio;
