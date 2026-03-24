import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /* ======================
       BASIC INFO
    ====================== */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["student", "faculty", "hod", "admin"],
      default: "student",
    },

    department: {
      type: String,
      default: null,
    },

    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: 1,
    },

    registrationNumber: {
      type: String,
      default: "",
    },

    currentLoad: {
      type: Number,
      default: 0,
    },

    skills: {
      type: [String],
      default: [],
    },

    /* ======================
       PORTFOLIO SUPPORT
    ====================== */
    profilePhoto: {
      type: String,
      default: "",
    },

    resumePath: {
      type: String,
      default: "",
    },

    /* ======================
       SYSTEM
    ====================== */
    points: {
      type: Number,
      default: 0,
    },

    badges: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    /* ======================
       AUTH ACTIONS
    ====================== */
    resetOtp: {
      type: String,
      default: null,
    },
    
    resetOtpExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/* ======================================================
   SAFE MODEL EXPORT (PREVENT OVERWRITE ERROR)
====================================================== */
const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

export default User;
