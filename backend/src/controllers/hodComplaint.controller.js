import HodComplaint from "../models/HodComplaint.model.js";

/* ===========================
   STUDENT: Raise complaint
=========================== */
export const createHodComplaint = async (req, res) => {
  try {
    const { facultyId, projectId, reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Reason is required" });
    }

    const complaint = await HodComplaint.create({
      studentId: req.user._id,
      facultyId: facultyId || null,
      projectId: projectId || null,
      reason,
    });

    res.status(201).json({
      message: "Complaint sent to HOD",
      complaint,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit complaint" });
  }
};

/* ===========================
   HOD: View complaints
=========================== */
export const getHodComplaints = async (req, res) => {
  try {
    const complaints = await HodComplaint.find()
      .populate("studentId", "name email")
      .populate("facultyId", "name email")
      .populate("projectId", "title")
      .sort({ createdAt: -1 });

    res.json({ complaints });
  } catch (err) {
    res.status(500).json({ message: "Failed to load complaints" });
  }
};

/* ===========================
   HOD: Resolve complaint
=========================== */
export const resolveHodComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { hodResponse } = req.body;

    const complaint = await HodComplaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = "RESOLVED";
    complaint.hodResponse = hodResponse || "";
    await complaint.save();

    res.json({
      message: "Complaint resolved",
      complaint,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to resolve complaint" });
  }
};
