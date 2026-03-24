import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateWeeklyFeedback = async ({
  weekNumber,
  completedTasks,
  pendingTasks,
  techStack,
}) => {
  const prompt = `
You are an academic mentor.

Week ${weekNumber} summary:
Completed tasks: ${completedTasks.join(", ")}
Pending tasks: ${pendingTasks.join(", ")}

Tech stack: ${techStack.join(", ")}

Give:
1. Short feedback (2 lines)
2. One improvement suggestion
3. One learning resource suggestion (video or article)

Respond in JSON:
{
  "feedback": "",
  "improvement": "",
  "resource": {
    "title": "",
    "link": ""
  }
}
`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);

  return JSON.parse(result.response.text());
};
