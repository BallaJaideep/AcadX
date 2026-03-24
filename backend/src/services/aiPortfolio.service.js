import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ===== SAFE JSON PARSER ===== */
const extractJSON = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
};

export const generatePortfolioFromAI = async ({
  student,
  projects,
  regenerationId,
}) => {
  const prompt = `
You are a senior software recruiter.

Regeneration ID: ${regenerationId}

Create a PROFESSIONAL STUDENT PORTFOLIO.

Student:
Name: ${student.name}
Department: ${student.department}
Semester: ${student.semester}
Known Skills: ${student.skills.join(", ")}

Projects:
${JSON.stringify(projects, null, 2)}

RULES:
- Respond in STRICT JSON ONLY
- No markdown
- Professional, confident language
- Infer skills from projects
- Mention ongoing vs completed clearly

Return JSON exactly in this format:
{
  "tagline": "",
  "about": "",
  "skills": [],
  "projects": [
    {
      "title": "",
      "status": "In Progress | Completed",
      "aiSummary": ""
    }
  ]
}
`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt);
    const parsed = extractJSON(result.response.text());

    if (!parsed) throw new Error("Invalid AI JSON");

    return parsed;
  } catch (err) {
    console.error("❌ Gemini error:", err.message);

    /* === HARD FALLBACK (NEVER FAILS) === */
    return {
      tagline: `${student.name} | Student Developer`,
      about:
        "A motivated student actively building technical skills through academic and real-world projects.",
      skills: student.skills.slice(0, 8),
      projects: projects.map((p) => ({
        title: p.title,
        status: p.status,
        aiSummary:
          p.status === "Completed"
            ? "Completed project demonstrating applied technical knowledge."
            : "Ongoing project focused on practical learning and implementation.",
      })),
    };
  }
};
