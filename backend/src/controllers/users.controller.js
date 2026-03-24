import User from "../models/user.model.js";
import path from "path";
import fs from "fs";

/* ======================================================
   GET FACULTY LIST
   GET /api/users/faculty
====================================================== */
export const getFacultyList = async (req, res) => {
  try {
    const faculty = await User.find({
      role: { $in: ["faculty", "hod"] },
      isActive: true,
    }).select("_id name email department currentLoad skills");

    return res.json({ users: faculty });
  } catch (error) {
    console.error("❌ getFacultyList error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch faculty list",
    });
  }
};

/* ======================================================
   UPLOAD RESUME (STUDENT ONLY)
   POST /api/users/me/resume
====================================================== */
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Resume file is required",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ✅ Persist resume path
    user.resumePath = `/uploads/resumes/${req.file.filename}`;
    await user.save();

    return res.json({
      message: "Resume uploaded successfully",
      resumePath: user.resumePath,
    });
  } catch (error) {
    console.error("❌ uploadResume error:", error.message);
    return res.status(500).json({
      message: "Resume upload failed",
    });
  }
};

/* ======================================================
   GET MY RESUME PATH
   GET /api/users/me/resume
====================================================== */
export const getMyResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ resumePath: user.resumePath });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch resume" });
  }
};

export const getStudentResume = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Authorization check
    if (req.user.role !== "hod" && req.user.role !== "admin" && req.user._id.toString() !== studentId) {
        return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ resumePath: user.resumePath });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch student resume" });
  }
};

/* ======================================================
   DOWNLOAD RESUME
   GET /api/users/resume/download/:filename
====================================================== */
export const downloadResume = async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({
        message: "Filename is required",
      });
    }

    const filePath = path.join(
      process.cwd(),
      "uploads",
      "resumes",
      filename
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    return res.download(filePath);
  } catch (error) {
    console.error("❌ downloadResume error:", error.message);
    return res.status(500).json({
      message: "Resume download failed",
    });
  }
};

/* ======================================================
   UPLOAD PROFILE PHOTO
   POST /api/users/me/photo
====================================================== */
export const uploadProfilePhotoController = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Photo required" });
  }

  req.user.profilePhoto = `/uploads/profile-photos/${req.file.filename}`;
  await req.user.save();

  res.json({ photo: req.user.profilePhoto });
};

