import Project from "../models/Project.model.js";
import Milestone from "../models/Milestone.model.js";

/* ======================================================
   BUILD CHAT CONTEXT (STUDENT / FACULTY)
   → Optimized for Gemini reasoning
====================================================== */
export const buildChatContext = async (user) => {
  /* =========================
     FACULTY / HOD / ADMIN
  ========================= */
  if (
    user.role === "faculty" ||
    user.role === "hod" ||
    user.role === "admin"
  ) {
    return `
ROLE: ${user.role.toUpperCase()}
Name: ${user.name}
Department: ${user.department || "N/A"}

INSTRUCTIONS FOR AI:
- You assist faculty in mentoring students
- Provide guidance on project progress, milestones, and evaluation
- Keep responses professional and concise
- Avoid generic theory unless explicitly asked
`;
  }

  /* =========================
     STUDENT CONTEXT
  ========================= */
  const projects = await Project.find({ studentId: user._id }).lean();

  if (projects.length === 0) {
    return `
ROLE: STUDENT
Name: ${user.name}
Department: ${user.department}
Semester: ${user.semester}

PROJECT STATUS:
The student has not created any projects yet.

INSTRUCTIONS FOR AI:
- Guide the student to create their first project
- Suggest how to plan milestones
- Answer doubts related to studies, coding, and career
`;
  }

  let projectContextText = "";

  for (const project of projects) {
    const milestones = await Milestone.find({
      projectId: project._id,
    }).lean();

    const completedCount = milestones.filter(
      (m) => m.status === "completed"
    ).length;

    const pendingCount = milestones.length - completedCount;

    projectContextText += `
Project: ${project.title}
Project Status: ${project.status}
Total Milestones: ${milestones.length}
Completed Milestones: ${completedCount}
Pending Milestones: ${pendingCount}

`;
  }

  return `
ROLE: STUDENT
Name: ${user.name}
Department: ${user.department}
Semester: ${user.semester}

IMPORTANT PROJECT & MILESTONE STATUS:
${projectContextText}

INSTRUCTIONS FOR AI (VERY IMPORTANT):
- Always analyze milestones before answering
- If the student asks "What should I do next?", suggest the NEXT pending milestone
- If milestones are all completed, suggest improvements or next projects
- Answer coding doubts, project help, resume/ATS questions, and career guidance
- Avoid generic explanations; keep answers specific to this student
`;
};

