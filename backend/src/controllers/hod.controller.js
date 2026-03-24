import User from "../models/user.model.js";
import Project from "../models/Project.model.js";
import mongoose from "mongoose";

/* ======================================================
   HOD DASHBOARD DATA
====================================================== */
export const getHodDashboard = async (req, res) => {
  try {
    const { department } = req.user;
    if (!department) {
       return res.status(400).json({ message: "HOD department not configured. Please update profile." });
    }

    // 1. Department Health Metrics
    const totalStudents = await User.countDocuments({ role: "student", department });
    const totalFaculty = await User.countDocuments({ role: "faculty", department });
    const totalProjects = await Project.countDocuments({ studentId: { $in: await User.find({ department }).distinct("_id") } });
    const completedProjects = await Project.countDocuments({ 
      status: "completed",
      studentId: { $in: await User.find({ department }).distinct("_id") }
    });
    
    const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

    // 2. Student Directory (Strictly Departmental & No Mock Data)
    const allStudents = await User.find({ 
      role: "student", 
      department,
      email: { $not: /@university\.edu$/ } 
    })
      .select("name email department semester points profilePhoto")
      .lean();

    for (const student of allStudents) {
        const studentProjects = await Project.find({ studentId: student._id }).select("title status progress mentorId");
        student.projects = studentProjects;
    }

    // 3. Top performers (Only those with points)
    const topStudents = await User.find({ role: "student", department, points: { $gt: 0 } })
      .sort({ points: -1 })
      .limit(5)
      .select("name points");

    // 4. Faculty workload (Real Departmental Data)
    const facultyLoadArr = await User.find({ role: "faculty", department })
      .select("name email currentLoad")
      .lean();

    res.json({
      metrics: {
        totalStudents,
        totalFaculty,
        totalProjects,
        completedProjects,
        completionRate,
        department: department
      },
      allStudents,
      topStudents,
      facultyLoad: facultyLoadArr,
    });
  } catch (err) {
    console.error("HOD Controller Error:", err);
    res.status(500).json({ message: "Failed to load real-time HOD analytics" });
  }
};

// NEW: Get Faculty Details for HOD Audit
export const getFacultyDetails = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const faculty = await User.findById(facultyId).select("-password").lean();
    
    if (!faculty || faculty.role !== "faculty") {
      return res.status(404).json({ message: "Faculty record not found" });
    }

    // List of students mentored by this faculty
    const mentoredStudents = await User.find({ 
      _id: { $in: await Project.find({ mentorId: facultyId }).distinct("studentId") }
    }).select("name email semester department points");

    res.json({ faculty, mentoredStudents });
  } catch (err) {
    console.error("Faculty Audit Error:", err);
    res.status(500).json({ message: "Audit failed: Personnel records inaccessible" });
  }
};

// NEW: Get Student Admin Details for HOD Oversight
export const getStudentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await User.findById(studentId).select("-password").lean();

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student record not found" });
    }

    const projects = await Project.find({ studentId }).populate("mentorId", "name email");

    res.json({ student, projects });
  } catch (err) {
    console.error("Student Oversight Error:", err);
    res.status(500).json({ message: "Audit failed: Administrative dossier inaccessible" });
  }
};

// HOD: Full Faculty Directory
export const getFacultyDirectory = async (req, res) => {
  try {
    const { department } = req.user;
    if (!department) return res.status(400).json({ message: "HOD department not configured." });

    const facultyList = await User.find({ role: "faculty", department })
      .select("name email profilePhoto skills currentLoad createdAt isActive")
      .lean();

    for (const f of facultyList) {
      f.projectCount = await Project.countDocuments({ mentorId: f._id });
      f.completedProjects = await Project.countDocuments({ mentorId: f._id, status: "completed" });
      const mentored = await Project.find({ mentorId: f._id }).distinct("studentId");
      f.studentCount = mentored.length;
    }

    res.json({ faculty: facultyList, total: facultyList.length, department });
  } catch (err) {
    console.error("Faculty Directory Error:", err);
    res.status(500).json({ message: "Failed to load faculty directory" });
  }
};

// HOD: Full Student Directory
export const getStudentDirectory = async (req, res) => {
  try {
    const { department } = req.user;
    if (!department) return res.status(400).json({ message: "HOD department not configured." });

    const studentList = await User.find({ role: "student", department })
      .select("name email profilePhoto semester points badges skills isActive createdAt")
      .lean();

    for (const s of studentList) {
      const projects = await Project.find({ studentId: s._id })
        .select("title status progress")
        .lean();
      s.projects = projects;
      s.activeProject = projects.find(p => p.status !== "completed") || null;
    }

    res.json({ students: studentList, total: studentList.length, department });
  } catch (err) {
    console.error("Student Directory Error:", err);
    res.status(500).json({ message: "Failed to load student directory" });
  }
};

// HOD: Delete Faculty Account
export const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { department } = req.user;
    
    const faculty = await User.findOne({ _id: id, role: "faculty", department });
    if (!faculty) return res.status(404).json({ message: "Faculty not found in your department." });

    await User.findByIdAndDelete(id);
    // Unassign mentor from projects
    await Project.updateMany({ mentorId: id }, { $unset: { mentorId: "" } });

    res.json({ message: "Faculty account deleted successfully." });
  } catch (err) {
    console.error("Delete Faculty Error:", err);
    res.status(500).json({ message: "Failed to delete faculty." });
  }
};

// HOD: Delete Student Account
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { department } = req.user;

    const student = await User.findOne({ _id: id, role: "student", department });
    if (!student) return res.status(404).json({ message: "Student not found in your department." });

    await User.findByIdAndDelete(id);
    // Delete their projects
    await Project.deleteMany({ studentId: id });

    res.json({ message: "Student account deleted successfully." });
  } catch (err) {
    console.error("Delete Student Error:", err);
    res.status(500).json({ message: "Failed to delete student." });
  }
};
