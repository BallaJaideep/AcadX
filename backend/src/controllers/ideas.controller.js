// src/controllers/ideas.controller.js
import Idea from "../models/Idea.model.js";

// FACULTY/ADMIN: create idea
// POST /api/ideas
export const createIdea = async (req, res) => {
  try {
    const {
      title,
      description,
      domain,
      techStack,
      difficulty,
      semesterSuggested,
      projectType,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const idea = await Idea.create({
      title,
      description: description || "",
      domain: domain || "",
      techStack: Array.isArray(techStack) ? techStack : [],
      difficulty: difficulty || "beginner",
      semesterSuggested: semesterSuggested || 1,
      projectType: projectType || "mini",
      createdBy: req.user._id,
      isActive: true,
    });

    return res.status(201).json({
      message: "Idea created successfully",
      idea,
    });
  } catch (error) {
    console.error("createIdea error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// ANY LOGGED-IN USER: list ideas with filters
// GET /api/ideas
export const getIdeas = async (req, res) => {
  try {
    const {
      domain,
      difficulty,
      projectType,
      semesterSuggested,
      search,
    } = req.query;

    const filter = { isActive: true };

    if (domain) filter.domain = domain;
    if (difficulty) filter.difficulty = difficulty;
    if (projectType) filter.projectType = projectType;
    if (semesterSuggested) filter.semesterSuggested = Number(semesterSuggested);

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const ideas = await Idea.find(filter)
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    return res.json({ ideas });
  } catch (error) {
    console.error("getIdeas error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// ANY LOGGED-IN USER: get idea by id
// GET /api/ideas/:id
export const getIdeaById = async (req, res) => {
  try {
    const { id } = req.params;

    const idea = await Idea.findById(id).populate(
      "createdBy",
      "name email role"
    );

    if (!idea || !idea.isActive) {
      return res.status(404).json({ message: "Idea not found" });
    }

    return res.json({ idea });
  } catch (error) {
    console.error("getIdeaById error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// FACULTY/ADMIN: update idea
// PUT /api/ideas/:id
export const updateIdea = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      domain,
      techStack,
      difficulty,
      semesterSuggested,
      projectType,
      isActive,
    } = req.body;

    const idea = await Idea.findById(id);
    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    // optional: only creator or admin can edit
    // if (idea.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") ...

    if (title !== undefined) idea.title = title;
    if (description !== undefined) idea.description = description;
    if (domain !== undefined) idea.domain = domain;
    if (techStack !== undefined)
      idea.techStack = Array.isArray(techStack) ? techStack : [];
    if (difficulty !== undefined) idea.difficulty = difficulty;
    if (semesterSuggested !== undefined)
      idea.semesterSuggested = semesterSuggested;
    if (projectType !== undefined) idea.projectType = projectType;
    if (isActive !== undefined) idea.isActive = isActive;

    await idea.save();

    return res.json({
      message: "Idea updated successfully",
      idea,
    });
  } catch (error) {
    console.error("updateIdea error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// ADMIN/HOD/FACULTY: soft delete idea
// DELETE /api/ideas/:id
export const deleteIdea = async (req, res) => {
  try {
    const { id } = req.params;

    const idea = await Idea.findById(id);
    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    idea.isActive = false;
    await idea.save();

    return res.json({ message: "Idea removed (soft delete)" });
  } catch (error) {
    console.error("deleteIdea error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};
