import Project from "../models/Project.model.js";
import MentorRequest from "../models/MentorRequest.model.js";
import { PROJECT_STATUS } from "../constants/projectStatus.js";
import { generateProjectDetails } from "../services/aiProject.service.js";
import PDFDocument from "pdfkit";

// POST /api/projects
export const createProject = async (req, res) => {
  try {
    const { domain, techStack, projectType, semester, department: bodyDept } = req.body;

    console.log(`🤖 High-Fidelity AI Generation triggered for studentId: ${req.user._id}`);
    
    // Use department from body or fall back to user profile
    const department = bodyDept || req.user.department || "General Engineering";

    // 1. Generate core details (Title, Problem, Objective, etc.)
    const aiDetails = await generateProjectDetails({
      domain: domain || "Technology",
      techStack: techStack || [],
      semester: semester || req.user.semester || 1,
      projectType: projectType || "mini",
      department
    });

    const project = await Project.create({
      title: aiDetails.title,
      problemStatement: aiDetails.problemStatement,
      objective: aiDetails.objective,
      outcome: aiDetails.outcome,
      budget: aiDetails.budget,
      department,
      domain: domain || "",
      techStack: Array.isArray(techStack) ? techStack : [],
      projectType: projectType || "mini",
      semester: semester || req.user.semester || 1,
      studentId: req.user._id,
      status: PROJECT_STATUS.DRAFT,
    });

    console.log(`✅ AI Project created: ${project._id}`);

    return res.status(201).json({
      message: "Project created successfully with AI assistance",
      project,
    });
  } catch (error) {
    console.error("CreateProject error:", error.message);
    return res.status(500).json({ message: "Server error during AI generation" });
  }
};

// GET /api/projects/my
export const getMyProjects = async (req, res) => {
  try {
    const studentId = req.user._id;

    if (!studentId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    console.log(`Fetching projects for studentId: ${studentId}`);
    const projects = await Project.find({ studentId }).sort({
      createdAt: -1,
    });
    console.log(`Found ${projects.length} projects.`);

    return res.json({
      projects,
    });
  } catch (error) {
    console.error("❌ getMyProjects error:", error);
    return res.status(500).json({
      message: "Failed to load projects",
    });
  }
};



export const getAssignedProjectsForFaculty = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    // Only faculty-like roles allowed
    if (!["faculty", "hod", "admin"].includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const projects = await Project.find({ mentorId: user._id })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    return res.json({ projects });
  } catch (error) {
    console.error("getAssignedProjectsForFaculty error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/projects/:id
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate("studentId", "name email role")
      .populate("mentorId", "name email role");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // For now, we don't block here. Later we can add access rules.
    return res.json({ project });
  } catch (error) {
    console.error("GetProjectById error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["draft", "in_progress", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const project = await Project.findOne({
      _id: id,
      studentId: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.status = status;
    await project.save();

    res.json({
      message: "Project status updated",
      project,
    });
  } catch (error) {
    console.error("❌ updateProjectStatus error:", error);
    res.status(500).json({ message: "Failed to update project status" });
  }
};

// DELETE /api/projects/:id
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({
      _id: id,
      studentId: req.user._id, // Only owner can delete
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found or unauthorized" });
    }

    await Project.findByIdAndDelete(id);

    console.log(`🗑️ Project deleted: ${id}`);

    res.json({
      message: "Project discarded successfully",
    });
  } catch (error) {
    console.error("❌ deleteProject error:", error.message);
    res.status(500).json({ message: "Failed to delete project" });
  }
};

// GET /api/projects/:id/download
export const downloadProjectReport = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).populate("studentId", "name email department");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const doc = new PDFDocument({ margin: 50 });
    let filename = `${project.title.replace(/\s+/g, "_")}_Industrial_Report.pdf`;
    
    // Set response headers
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // --- PDF CONTENT ---
    
    // Header
    doc
      .fillColor("#0f172a")
      .fontSize(20)
      .text("AcadX PORTAL INDUSTRIAL RECORD", { align: "center" })
      .moveDown(0.5);
    
    doc
      .fontSize(10)
      .fillColor("#64748b")
      .text(`PROJECT ID: ${project._id}`, { align: "center" })
      .text(`GENERATED ON: ${new Date().toLocaleDateString()}`, { align: "center" })
      .moveDown(2);

    // Title
    doc
      .fillColor("#0f172a")
      .fontSize(24)
      .text(project.title, { align: "left" })
      .moveDown(1.5);

    // Sections
    const sections = [
      { label: "INDUSTRIAL PROBLEM ANALYSIS", content: project.problemStatement },
      { label: "STRATEGIC TECHNICAL OBJECTIVES", content: project.objective },
      { label: "DELIVERABLE SPECIFICATIONS & OUTCOME", content: project.outcome },
    ];

    sections.forEach(s => {
      doc
        .fillColor("#0f172a")
        .fontSize(12)
        .text(s.label, { underline: true })
        .moveDown(0.5);
      
      doc
        .fillColor("#1e293b")
        .fontSize(11)
        .text(s.content || "N/A", {
          align: "justify",
          lineGap: 4
        })
        .moveDown(1.5);
    });

    // Budget Box (Dynamic Height)
    const budgetTitle = "RESOURCE BREAKDOWN & ESTIMATED BUDGET";
    const budgetText = project.budget || "Minimal";
    const boxWidth = 500;
    const padding = 20;
    
    // Measure content height
    doc.fontSize(12);
    const titleHeight = doc.heightOfString(budgetTitle, { width: boxWidth - padding * 2 });
    doc.fontSize(10);
    const textHeight = doc.heightOfString(budgetText, { width: boxWidth - padding * 2 });
    const totalBoxHeight = titleHeight + textHeight + padding * 3;

    // Draw background rect
    doc
      .rect(50, doc.y, boxWidth, totalBoxHeight)
      .fill("#f8fafc")
      .stroke("#e2e8f0");
    
    // Add text inside the box
    const currentY = doc.y - totalBoxHeight; // Reset Y to top of box for relative positioning if needed, or just use absolute
    doc
      .fillColor("#0f172a")
      .fontSize(12)
      .text(budgetTitle, 60, currentY + padding, { width: boxWidth - padding * 2 })
      .moveDown(0.5);
    
    doc
      .fillColor("#0f172a")
      .fontSize(10)
      .text(budgetText, 60, doc.y, { width: boxWidth - padding * 2 })
      .moveDown(2);

    // Footer
    doc
      .fontSize(10)
      .fillColor("#94a3b8")
      .text(`© ${new Date().getFullYear()} AcadX Portal · Industrial Record Verification`, 50, doc.page.height - 70, { align: "center" });

    doc.end();

  } catch (error) {
    console.error("❌ PDF Export error:", error.message);
    res.status(500).json({ message: "Failed to generate PDF report" });
  }
};

/**
 * UPDATE / REGENERATE PROJECT
 * PUT /api/projects/:id
 */
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { domain, techStack, department, projectType, semester, regenerate } = req.body;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Ownership check
    if (project.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only modify your own project" });
    }

    const techArray = Array.isArray(techStack)
      ? techStack
      : (techStack || "").split(",").map(t => t.trim()).filter(Boolean);

    if (regenerate) {
      // Re-run AI generation with new inputs
      console.log(`🔄 AI Re-generation triggered for project: ${id}`);
      const aiDetails = await generateProjectDetails({
        domain: domain || project.domain,
        techStack: techArray.length > 0 ? techArray : project.techStack,
        semester: semester || project.semester,
        projectType: projectType || project.projectType,
        department: department || project.department,
      });

      await Project.findByIdAndUpdate(id, {
        $set: {
          title: aiDetails.title,
          problemStatement: aiDetails.problemStatement,
          objective: aiDetails.objective,
          outcome: aiDetails.outcome,
          budget: aiDetails.budget,
          domain: domain || project.domain,
          techStack: techArray.length > 0 ? techArray : project.techStack,
          projectType: projectType || project.projectType,
          semester: semester || project.semester,
          department: department || project.department,
        }
      }, { runValidators: false });

      console.log(`✅ AI Regenerated project: ${id}`);

      // Mark the most recent REJECTED_RECREATE request for this project as regenerated
      // so the frontend hides the "Modify Project" button
      try {
        await MentorRequest.findOneAndUpdate(
          { projectId: id, status: "REJECTED_RECREATE", projectRegenerated: { $ne: true } },
          { $set: { projectRegenerated: true } },
          { sort: { createdAt: -1 } }
        );
        console.log(`✅ Marked mentor request as projectRegenerated for project: ${id}`);
      } catch (markErr) {
        // Non-critical — don't block the response
        console.warn(`⚠️ Could not mark request as regenerated: ${markErr.message}`);
      }

      return res.json({ message: "Project regenerated with AI successfully" });
    }

    // Simple field update (no AI)
    await Project.findByIdAndUpdate(id, {
      $set: {
        domain: domain || project.domain,
        techStack: techArray.length > 0 ? techArray : project.techStack,
        department: department || project.department,
        projectType: projectType || project.projectType,
        semester: semester || project.semester,
      }
    }, { runValidators: false });

    return res.json({ message: "Project updated successfully" });
  } catch (error) {
    console.error("updateProject error:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

