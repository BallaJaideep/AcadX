import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

/* ======================================================
   GEMINI SETUP
====================================================== */
const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);

let model = null;
if (hasGeminiKey) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

/* ======================================================
   INTERNAL FALLBACK (PRIVATE)
====================================================== */
const getFallbackMilestones = () => [
  {
    title: "Project Planning",
    description: "Understand problem and plan execution",
    tasks: [
      "Define problem statement",
      "Finalize project scope",
      "Choose tech stack",
    ],
  },
  {
    title: "System Design",
    description: "Design system architecture",
    tasks: [
      "Design database schema",
      "Create UI wireframes",
      "Define API structure",
    ],
  },
  {
    title: "Development Phase",
    description: "Build application features",
    tasks: [
      "Develop backend APIs",
      "Develop frontend UI",
      "Integrate frontend and backend",
    ],
  },
  {
    title: "Testing Phase",
    description: "Test and stabilize application",
    tasks: ["Perform unit testing", "Fix bugs", "Optimize performance"],
  },
  {
    title: "Deployment & Documentation",
    description: "Deploy project and prepare documentation",
    tasks: ["Deploy application", "Prepare documentation", "Final review"],
  },
];

/* ======================================================
   ✅ NAMED EXPORT (THIS FIXES YOUR ERROR)
====================================================== */
export const generateAIMilestones = async (project) => {
  if (!project) {
    throw new Error("Project missing");
  }

  // 🔹 If Gemini key missing → fallback
  if (!model) {
    console.warn("⚠️ GEMINI_API_KEY missing → using fallback milestones");
    return getFallbackMilestones();
  }

  try {
    const prompt = `
You are an academic project mentor.

Generate a WEEKLY PROJECT PLAN.

Project Title: ${project.title}
Domain: ${project.domain}
Tech Stack: ${project.techStack.join(", ")}

Rules:
- Return STRICT JSON only
- Generate 6–8 weeks
- Each week must include:
  - weekNumber
  - title
  - description
  - 6–10 practical tasks
  - youtubeLinks (Array of 2-3 specific FULL tutorial URLs starting with https://)
  - tutorialLinks (Array of 2-3 specific FULL article/tutorial URLs starting with https:// like Medium/Dev.to)
  - documentLinks (Array of 2-3 official documentation FULL URLs starting with https://)
- Tasks must be technical and stack-specific
- Do NOT repeat week numbers

JSON format:
[
  {
    "weekNumber": 1,
    "title": "",
    "description": "",
    "tasks": [],
    "youtubeLinks": [],
    "tutorialLinks": [],
    "documentLinks": []
  }
]
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("🤖 AI Raw Milestones Text:", text);

    const firstBrace = text.indexOf('[');
    const lastBrace = text.lastIndexOf(']');
    
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON array found in AI response");
    }

    const json = text.substring(firstBrace, lastBrace + 1);
    const milestones = JSON.parse(json);

    if (!Array.isArray(milestones) || milestones.length === 0) {
      throw new Error("Gemini returned empty milestones");
    }

    return milestones;
  } catch (error) {
    console.error("⚠️ Gemini AI failed → using fallback:", error.message);
    return getFallbackMilestones();
  }
};
