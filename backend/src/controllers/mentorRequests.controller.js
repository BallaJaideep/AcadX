// src/controllers/mentorRequests.controller.js
import MentorRequest from "../models/MentorRequest.model.js";
import Project from "../models/Project.model.js";
import User from "../models/user.model.js";

const isFacultyLike = (role) => ["faculty", "hod", "admin"].includes(role);

/**
 * STUDENT: create mentor request
 * POST /api/mentor-requests
 */
export const createMentorRequest = async (req, res) => {
  try {
    const { projectId, requestedFacultyId, message } = req.body;
    console.log("[createMentorRequest] Body:", { projectId, requestedFacultyId });

    if (!projectId || !requestedFacultyId) {
      return res.status(400).json({ message: "projectId and requestedFacultyId are required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      console.log("[createMentorRequest] Project not found:", projectId);
      return res.status(404).json({ message: "Project not found" });
    }

    const studentId = project.studentId?._id || project.studentId;
    if (studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only request mentor for your own project" });
    }

    const faculty = await User.findById(requestedFacultyId);
    if (!faculty || !isFacultyLike(faculty.role)) {
      console.log("[createMentorRequest] Invalid faculty:", requestedFacultyId, faculty?.role);
      return res.status(400).json({ message: "Invalid faculty selected" });
    }

    // Check if this faculty previously gave a REJECTED_RECREATE decision for this project
    // If yes — the student has revised and is allowed to re-request the SAME faculty
    const previousRecreateRequest = await MentorRequest.findOne({
      projectId,
      studentId: req.user._id,
      requestedFacultyId,
      status: "REJECTED_RECREATE",
    });

    const isResubmissionAfterReCreate = !!previousRecreateRequest;

    // Only block if project already has a DIFFERENT mentor assigned
    // (If re-submitting to the same mentor who said REJECTED_RECREATE, skip this check)
    if (
      project.mentorId &&
      project.mentorId.toString() === requestedFacultyId.toString() &&
      !isResubmissionAfterReCreate
    ) {
      return res.status(400).json({ message: "This faculty is already the mentor for this project" });
    }

    // If a completely different mentor is already assigned (not the one being requested), block
    if (
      project.mentorId &&
      project.mentorId.toString() !== requestedFacultyId.toString()
    ) {
      return res.status(400).json({ message: "This project already has an assigned mentor" });
    }

    // Prevent duplicate PENDING request to the same faculty for the same project
    const existingPending = await MentorRequest.findOne({
      projectId,
      studentId: req.user._id,
      requestedFacultyId,
      status: "PENDING",
    });

    if (existingPending) {
      console.log("[createMentorRequest] Duplicate pending request found:", existingPending._id);
      return res.status(400).json({ message: "You already have a pending request to this faculty for this project" });
    }

    const mentorRequest = await MentorRequest.create({
      projectId,
      studentId: req.user._id,
      requestedFacultyId,
      message: message || "",
      status: "PENDING",
    });

    const populated = await MentorRequest.findById(mentorRequest._id)
      .populate("projectId", "title")
      .populate("studentId", "name email semester")
      .populate("requestedFacultyId", "name email role");

    console.log("[createMentorRequest] Created successfully:", mentorRequest._id);
    return res.status(201).json({ message: "Mentor request created", mentorRequest: populated });
  } catch (error) {
    console.error("[createMentorRequest] ERROR:", error.name, error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * STUDENT: view own mentor requests
 * GET /api/mentor-requests/my
 */
export const getMyMentorRequests = async (req, res) => {
  try {
    const requests = await MentorRequest.find({ studentId: req.user._id })
      .populate("projectId", "title")
      .populate("requestedFacultyId", "name email department")
      .populate("studentId", "name email semester")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ requests });
  } catch (error) {
    console.error("[getMyMentorRequests] ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * FACULTY: view incoming requests
 * GET /api/mentor-requests/incoming
 */
export const getIncomingRequestsForFaculty = async (req, res) => {
  try {
    const requests = await MentorRequest.find({
      requestedFacultyId: req.user._id,
      status: "PENDING",
    })
      .populate("projectId", "title description domain")
      .populate("studentId", "name email semester department")
      .sort({ createdAt: -1 })
      .lean();

    console.log(`[getIncomingRequestsForFaculty] Found ${requests.length} pending for ${req.user._id}`);
    return res.json({ requests });
  } catch (error) {
    console.error("[getIncomingRequestsForFaculty] ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * FACULTY: decide on a request (APPROVE / REJECT / REJECT_AND_RECREATE)
 * POST /api/mentor-requests/:id/decision
 */
export const decideMentorRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, reason, suggestions } = req.body;

    console.log(`[decideMentorRequest] id=${id} decision=${decision} faculty=${req.user._id}`);

    // Step 1: Validate decision value
    const validDecisions = ["APPROVE", "REJECT", "REJECT_AND_RECREATE"];
    if (!validDecisions.includes(decision)) {
      console.log(`[decideMentorRequest] Invalid decision: "${decision}"`);
      return res.status(400).json({ message: `Invalid decision "${decision}". Must be one of: ${validDecisions.join(", ")}` });
    }

    // Step 2: Find the request
    const request = await MentorRequest.findById(id);
    if (!request) {
      console.log(`[decideMentorRequest] Request ${id} not found`);
      return res.status(404).json({ message: "Mentor request not found" });
    }

    console.log(`[decideMentorRequest] Request status: ${request.status}, target faculty: ${request.requestedFacultyId}`);

    // Step 3: Verify this faculty owns the request
    if (request.requestedFacultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized for this request" });
    }

    // Step 4: Guard — only act on PENDING requests
    if (request.status !== "PENDING") {
      console.log(`[decideMentorRequest] Already processed: ${request.status}`);
      return res.status(400).json({ message: `This request has already been ${request.status}. Cannot process again.` });
    }

    // ── REJECT ──────────────────────────────────────────────────────────────
    if (decision === "REJECT") {
      request.status = "REJECTED";
      request.reason = reason || "";
      request.suggestions = "";
      await request.save();
      console.log(`[decideMentorRequest] REJECTED ${id}`);

      const populated = await MentorRequest.findById(id)
        .populate("projectId", "title")
        .populate("studentId", "name email")
        .populate("requestedFacultyId", "name email department");

      return res.json({ message: "Request rejected", request: populated });
    }

    // ── REJECT & RECREATE ────────────────────────────────────────────────────
    if (decision === "REJECT_AND_RECREATE") {
      request.status = "REJECTED_RECREATE";
      request.reason = reason || "Please revise your proposal.";
      request.suggestions = suggestions || "";
      await request.save();
      console.log(`[decideMentorRequest] REJECTED_RECREATE ${id}`);

      const populated = await MentorRequest.findById(id)
        .populate("projectId", "title")
        .populate("studentId", "name email")
        .populate("requestedFacultyId", "name email department");

      return res.json({ message: "Rejected with recreate instructions sent to student", request: populated });
    }

    // ── APPROVE ──────────────────────────────────────────────────────────────
    if (decision === "APPROVE") {
      const project = await Project.findById(request.projectId);
      if (!project) {
        return res.status(404).json({ message: "Associated project not found" });
      }

      // Block only if a DIFFERENT mentor is already assigned
      if (project.mentorId && project.mentorId.toString() !== req.user._id.toString()) {
        console.log(`[decideMentorRequest] Project ${project._id} already has mentor ${project.mentorId}`);
        // Auto-reject this request since project already has a different mentor
        request.status = "REJECTED";
        request.reason = "Project has already been assigned to another mentor.";
        await request.save();
        return res.status(400).json({ message: "Project already has a different mentor assigned. This request has been auto-rejected." });
      }

      // Assign this faculty as the mentor
      await Project.findByIdAndUpdate(
        project._id,
        { $set: { mentorId: req.user._id } },
        { new: true, runValidators: false }
      );
      console.log(`[decideMentorRequest] Assigned mentor ${req.user._id} to project ${project._id}`);

      // Mark request as APPROVED
      request.status = "APPROVED";
      await request.save();

      // Update faculty's currentLoad
      await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { currentLoad: 1 } },
        { runValidators: false }
      );

      // Auto-reject any other PENDING requests for this same project
      const autoRejected = await MentorRequest.updateMany(
        {
          _id: { $ne: request._id },
          projectId: request.projectId,
          status: "PENDING",
        },
        {
          $set: {
            status: "REJECTED",
            reason: "Another mentor has been approved for this project.",
          },
        }
      );
      console.log(`[decideMentorRequest] Auto-rejected ${autoRejected.modifiedCount} other requests`);

      const populated = await MentorRequest.findById(id)
        .populate("projectId", "title")
        .populate("studentId", "name email")
        .populate("requestedFacultyId", "name email department");

      return res.json({ message: "Mentor approved and assigned to project successfully", request: populated });
    }

  } catch (error) {
    console.error("[decideMentorRequest] UNHANDLED ERROR:", error.name, error.message);
    if (error.stack) console.error(error.stack);

    if (error.name === "ValidationError") {
      const fieldErrors = Object.keys(error.errors).map(k => `${k}: ${error.errors[k].message}`);
      return res.status(400).json({ message: "Validation Error", details: fieldErrors });
    }

    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
