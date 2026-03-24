import Task from "../models/Task.model.js";
import Project from "../models/Project.model.js";
import Milestone from "../models/Milestone.model.js";

/* ======================================================
   CREATE TASK (FACULTY / HOD / ADMIN)
   POST /api/tasks
====================================================== */
export const createTask = async (req, res) => {
  try {
    const {
      projectId,
      milestoneId,
      title,
      description = "",
      dueDate = null,
      priority = "medium",
      assigneeId = null,
    } = req.body;

    if (!projectId || !milestoneId || !title) {
      return res.status(400).json({
        message: "projectId, milestoneId and title are required",
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    if (milestone.projectId.toString() !== projectId) {
      return res.status(400).json({
        message: "Milestone does not belong to this project",
      });
    }

    const task = await Task.create({
      projectId,
      milestoneId,
      title,
      description,
      status: "todo", // ✅ FIXED
      dueDate,
      priority,
      assigneeId,
    });

    return res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("❌ createTask error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   GET TASKS BY PROJECT
====================================================== */
export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const tasks = await Task.find({ projectId }).sort({ createdAt: 1 });

    return res.json({ tasks });
  } catch (error) {
    console.error("❌ getTasksByProject error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   GET TASKS BY MILESTONE
====================================================== */
export const getTasksByMilestone = async (req, res) => {
  try {
    const { milestoneId } = req.params;

    const tasks = await Task.find({ milestoneId }).sort({ createdAt: 1 });

    return res.json({ tasks });
  } catch (error) {
    console.error("❌ getTasksByMilestone error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   UPDATE TASK STATUS (STUDENT)
   PATCH /api/tasks/:id
====================================================== */
export const updateTask = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["todo", "completed"].includes(status)) {
      return res.status(400).json({
        message: "Invalid task status",
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const milestone = await Milestone.findById(task.milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    // 🚫 LOCK TASKS AFTER WEEK COMPLETION
    if (milestone.status === "completed") {
      return res.status(400).json({
        message: "Cannot modify tasks after milestone completion",
      });
    }

    // 🔥 ATOMIC UPDATE (NO .save())
    const updatedTask = await Task.findByIdAndUpdate(
      task._id,
      { status },
      { new: true }
    );

    return res.json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("❌ updateTask error:", error);
    return res.status(500).json({
      message: "Failed to update task",
    });
  }
};

/* ======================================================
   DELETE TASK (FACULTY / HOD / ADMIN)
====================================================== */
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne();

    return res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("❌ deleteTask error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
