import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateAIFeedback = async () => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
You are an academic assistant.

Analyze a project PPT and document and give:
- PPT clarity suggestions
- Document structure improvement suggestions

Do NOT approve or reject.
Do NOT grade.
Only suggestions.

Give response as bullet points.
`;

  const result = await model.generateContent(prompt);
  return result.response.text().split("\n").filter(Boolean);
};
