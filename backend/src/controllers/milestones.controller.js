import Milestone from "../models/Milestone.model.js";
import Task from "../models/Task.model.js";
import Project from "../models/Project.model.js";
import Complaint from "../models/MilestoneComplaint.model.js";

import { generateAIMilestones } from "../services/aiMilestone.service.js";
import { generateHelpSuggestions } from "../services/aiHelp.service.js";

/* ======================================================
   GET MY MILESTONES (STUDENT / FACULTY)
====================================================== */
export const getMyMilestones = async (req, res) => {
  try {
    const projectFilter =
      req.user.role === "student"
        ? { studentId: req.user._id }
        : { mentorId: req.user._id };

    const projects = await Project.find(projectFilter).lean();
    const response = [];

    for (const project of projects) {
      const milestones = await Milestone.find({
        projectId: project._id,
      })
        .sort({ orderIndex: 1 })
        .lean();

      let projectProgressSum = 0;

      const enrichedMilestones = [];

      for (const m of milestones) {
        const tasks = await Task.find({
          milestoneId: m._id,
        }).lean();

        const totalTasks = tasks.length;
        const doneTasks = tasks.filter(
          (t) => t.status === "completed"
        ).length;

        const progress =
          totalTasks === 0
            ? 0
            : Math.round((doneTasks / totalTasks) * 100);

        projectProgressSum += progress;

        let complaints = [];
        if (req.user.role === "student") {
          complaints = await Complaint.find({
            milestoneId: m._id,
            studentId: req.user._id,
          })
            .sort({ createdAt: -1 })
            .lean();
        }

        enrichedMilestones.push({
          ...m,
          tasks,
          progress,
          complaints,
        });
      }

      /* 🔥 Update project progress and status */
      const projectProgress =
        milestones.length === 0
          ? 0
          : Math.round(projectProgressSum / milestones.length);

      let newStatus = project.status;
      if (projectProgress === 100) {
        newStatus = "completed";
      } else if (projectProgress > 0) {
        newStatus = "in_progress";
      } else {
        newStatus = "not_started";
      }

      await Project.findByIdAndUpdate(project._id, {
        progress: projectProgress,
        status: newStatus,
      });

      response.push({
        projectId: project._id,
        project: {
          ...project,
          progress: projectProgress,
          status: newStatus,
        },
        milestones: enrichedMilestones,
      });
    }

    res.json({ projects: response });
  } catch (error) {
    console.error("❌ getMyMilestones error:", error);
    res.status(500).json({ message: "Failed to load milestones" });
  }
};

/* ======================================================
   AI GENERATE WEEKLY MILESTONES
====================================================== */
export const generateMilestonesByAI = async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId)
      return res.status(400).json({ message: "Project ID missing" });

    const project = await Project.findById(projectId);
    if (!project)
      return res.status(404).json({ message: "Project not found" });

    // Prevent regenerating if milestones already exist
    const existingMilestones = await Milestone.find({ projectId });
    if (existingMilestones.length > 0) {
      return res.status(400).json({ message: "Milestones have already been generated for this project." });
    }

    const weeks = await generateAIMilestones(project);
    if (!weeks?.length)
      return res.status(500).json({ message: "AI returned empty milestones" });

    /* 🧹 Clear previous data */
    const oldMilestones = await Milestone.find({ projectId });
    const milestoneIds = oldMilestones.map((m) => m._id);

    await Task.deleteMany({ milestoneId: { $in: milestoneIds } });
    await Complaint.deleteMany({ milestoneId: { $in: milestoneIds } });
    await Milestone.deleteMany({ projectId });

    let index = 1;

    for (const week of weeks) {
      const milestone = await Milestone.create({
        projectId,
        title: week.title,
        description: week.description,
        weekNumber: index,
        phase: `Week ${index}`,
        orderIndex: index,
        status: "todo",
        youtubeLinks: week.youtubeLinks || [],
        tutorialLinks: week.tutorialLinks || [],
        documentLinks: week.documentLinks || [],
      });

      for (const taskTitle of week.tasks) {
        await Task.create({
          projectId,
          milestoneId: milestone._id,
          title: taskTitle,
          status: "todo",
        });
      }

      index++;
    }

    res.json({
      message: "Milestones generated successfully",
      totalWeeks: weeks.length,
    });
  } catch (error) {
    console.error("❌ AI milestone generation error:", error);
    res.status(500).json({ message: "Milestone generation failed" });
  }
};

/* ======================================================
   COMPLETE MILESTONE (STUDENT)
====================================================== */
export const completeMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone)
      return res.status(404).json({ message: "Milestone not found" });

    if (milestone.status === "completed")
      return res.json({ message: "Already completed" });

    milestone.status = "completed";
    milestone.completedAt = new Date();
    milestone.completedBy = req.user._id;

    await milestone.save();

    /* 🔄 RECALCULATE PROJECT PROGRESS IMMEDIATELY */
    const allMilestones = await Milestone.find({ projectId: milestone.projectId });
    const totalMilestones = allMilestones.length;
    const completedMS = allMilestones.filter(m => m.status === "completed").length;
    
    // Check tasks for accuracy (optional but safer)
    let totalTasksCount = 0;
    let doneTasksCount = 0;
    
    for(const ms of allMilestones) {
        const tasks = await Task.find({ milestoneId: ms._id });
        totalTasksCount += tasks.length;
        doneTasksCount += tasks.filter(t => t.status === "completed").length;
    }

    const tasksProgress = totalTasksCount === 0 ? 100 : Math.round((doneTasksCount / totalTasksCount) * 100);
    const msProgress = totalMilestones === 0 ? 100 : Math.round((completedMS / totalMilestones) * 100);
    
    // Average both or take tasksProgress as source of truth
    const finalProg = Math.round((tasksProgress + msProgress) / 2);

    await Project.findByIdAndUpdate(milestone.projectId, {
      progress: finalProg,
      status: finalProg === 100 ? "completed" : "in_progress"
    });

    res.json({ message: "Milestone completed successfully", projectStatus: finalProg === 100 ? "completed" : "in_progress" });
  } catch (error) {
    console.error("❌ completeMilestone error:", error);
    res.status(500).json({ message: "Failed to complete milestone" });
  }
};

/* ======================================================
   ASK FOR HELP (STUDENT)
====================================================== */
export const raiseMilestoneComplaint = async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const { reason } = req.body;

    if (!reason)
      return res.status(400).json({ message: "Reason required" });

    const milestone = await Milestone.findById(milestoneId);
    if (!milestone)
      return res.status(404).json({ message: "Milestone not found" });

    const aiSuggestions = await generateHelpSuggestions(reason);

    const complaint = await Complaint.create({
      milestoneId,
      projectId: milestone.projectId,
      studentId: req.user._id,
      reason,
      status: "PENDING",
      aiSuggestions,
    });

    res.status(201).json({
      message: "AI help suggestions generated",
      complaint,
    });
  } catch (error) {
    console.error("❌ raiseMilestoneComplaint error:", error);
    res.status(500).json({ message: "Failed to ask for help" });
  }
};

/* ======================================================
   FACULTY RESOLVES COMPLAINT
====================================================== */
export const resolveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    if (complaint.status === "RESOLVED")
      return res.status(400).json({ message: "Already resolved" });

    complaint.status = "RESOLVED";
    complaint.facultyResponse = req.body.response || "";
    complaint.resolvedBy = req.user._id;
    complaint.resolvedAt = new Date();

    await complaint.save();

    res.json({ message: "Complaint resolved", complaint });
  } catch (error) {
    console.error("❌ resolveComplaint error:", error);
    res.status(500).json({ message: "Failed to resolve complaint" });
  }
};

/* ======================================================
   STUDENT ACCEPTS AI HELP
====================================================== */
export const acceptAIHelp = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    if (complaint.studentId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your complaint" });

    complaint.status = "RESOLVED";
    complaint.facultyResponse = "Resolved using AI suggestions";
    complaint.resolvedBy = req.user._id;
    complaint.resolvedAt = new Date();

    await complaint.save();

    res.json({ message: "Resolved using AI help", complaint });
  } catch (error) {
    console.error("❌ acceptAIHelp error:", error);
    res.status(500).json({ message: "Failed to accept AI help" });
  }
};

/* ======================================================
   STUDENT REOPENS COMPLAINT
====================================================== */
export const reopenComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    if (complaint.status !== "RESOLVED")
      return res.status(400).json({
        message: "Only resolved complaints can be reopened",
      });

    if (complaint.studentId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not allowed" });

    complaint.status = "REOPENED";
    complaint.reopenedAt = new Date();

    await complaint.save();

    res.json({ message: "Complaint reopened", complaint });
  } catch (error) {
    console.error("❌ reopenComplaint error:", error);
    res.status(500).json({ message: "Failed to reopen complaint" });
  }
};

/* ======================================================
   DELETE ALL MILESTONES FOR A PROJECT (FACULTY)
====================================================== */
export const deleteMilestonesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Authorization is handled by route middleware
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const milestones = await Milestone.find({ projectId });
    const milestoneIds = milestones.map(m => m._id);

    await Task.deleteMany({ milestoneId: { $in: milestoneIds } });
    await Complaint.deleteMany({ milestoneId: { $in: milestoneIds } });
    await Milestone.deleteMany({ projectId });

    res.json({ message: "Milestones deleted successfully" });
  } catch (error) {
    console.error("❌ deleteMilestonesByProject error:", error);
    res.status(500).json({ message: "Failed to delete milestones" });
  }
};

/* ======================================================
   COMPLETE ALL MILESTONES FOR A PROJECT (STUDENT)
====================================================== */
export const completeAllProjectMilestones = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Authorization is handled by route middleware
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const milestones = await Milestone.find({ projectId });
    for (const m of milestones) {
      if (m.status !== "completed") {
        m.status = "completed";
        m.completedAt = new Date();
        m.completedBy = req.user._id;
        await m.save();
      }
      
      // Complete any incomplete tasks
      await Task.updateMany({ milestoneId: m._id, status: { $ne: "completed" } }, { status: "completed" });
    }

    // 🔥 Explicitly marked as submitted/completed
    project.status = "completed";
    project.progress = 100;
    await project.save();

    res.json({ message: "All milestones completed and project finalized successfully" });
  } catch (error) {
    console.error("❌ completeAllProjectMilestones error:", error);
    res.status(500).json({ message: "Failed to complete all milestones" });
  }
};

/* ======================================================
   COMPLETE ALL TASKS IN A MILESTONE (STUDENT)
====================================================== */
export const completeAllMilestoneTasks = async (req, res) => {
  try {
    const { id: milestoneId } = req.params;
    
    // Authorization is handled by route middleware
    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) return res.status(404).json({ message: "Milestone not found" });

    // Mark all pending tasks as completed
    await Task.updateMany(
      { milestoneId, status: { $ne: "completed" } }, 
      { status: "completed" }
    );

    res.json({ message: "All tasks completed successfully" });
  } catch (error) {
    console.error("❌ completeAllMilestoneTasks error:", error);
    res.status(500).json({ message: "Failed to complete all tasks" });
  }
};
