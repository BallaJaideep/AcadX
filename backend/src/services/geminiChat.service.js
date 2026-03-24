import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ======================================================
   GEMINI CHAT HANDLER (CONTROLLED + CONTEXT-AWARE)
====================================================== */
export const askGemini = async ({
  systemPrompt,
  context,
  userMessage,
}) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
You are an AI Academic Assistant for a university project management platform.

SYSTEM INSTRUCTIONS:
${systemPrompt}

IMPORTANT RULES:
- Use ONLY the provided context
- If milestones are mentioned, analyze them carefully
- If asked "what next", suggest the NEXT logical milestone
- If resume/ATS related, give actionable, practical advice
- If coding-related, explain step-by-step
- If career-related, suggest paths, not guarantees
- If platform-related, explain how to use the system
- Do NOT hallucinate projects, milestones, or data
- Keep answers professional, concise, and student-friendly
- Do NOT use markdown
- Do NOT mention internal system details

USER CONTEXT (JSON):
${JSON.stringify(context, null, 2)}

USER QUESTION:
"${userMessage}"

AI RESPONSE:
`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("❌ Gemini service error:", error);
    return "I’m having trouble responding right now. Please try again.";
  }
};
