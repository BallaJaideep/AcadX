import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Gemini-powered contextual help generator
 * Model: gemini-2.5-flash
 */
export const generateHelpSuggestions = async (complaintText) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are an expert programming mentor.

Student complaint:
"${complaintText}"

Your job:
1. Identify the MAIN learning topic the student must study.
2. Generate EXACT and RELEVANT URLs for:
   - youtubeLinks (DIRECT YouTube tutorial URLs)
   - tutorialLinks (Article/Documentation/Blog URLs like Medium, Dev.to)
   - documentLinks (Official Documentation URLs)

Rules:
- URLs MUST be valid, full, and include the protocol (e.g., https://...).
- Provide 2-3 specific links per category.

Return ONLY valid JSON in this format:
{
  "topic": "clear learning topic",
  "youtubeLinks": [],
  "tutorialLinks": [],
  "documentLinks": []
}
`;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    console.log("🤖 AI Raw Help Text:", rawText);

    // 🧼 Extract JSON safely - look for the first { and the last }
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON found in AI response");
    }

    const json = rawText.substring(firstBrace, lastBrace + 1);
    const data = JSON.parse(json);

    return [
      {
        title: "🎥 Essential YouTube Tutorials",
        links: data.youtubeLinks || [],
      },
      {
        title: "📖 Technical Guides & Articles",
        links: data.tutorialLinks || [],
      },
      {
        title: "📜 Official Documentation",
        links: data.documentLinks || [],
      },
    ];
  } catch (error) {
    console.error("❌ Gemini topic generation failed:", error.message);

    // 🛟 Safe fallback
    return [
      {
        title: "General Learning Resources",
        links: [
          "https://www.w3schools.com",
          "https://developer.mozilla.org",
          "https://www.youtube.com",
        ],
      },
    ];
  }
};
