import { generateProjectIdeas } from "../services/aiProject.service.js";

// POST /api/ai-projects/generate
export const getAIProjectSuggestions = async (req, res) => {
  try {
    const { degree, department, semester, skills, interestArea } = req.body;

    // Optional: We can pull some data from req.user if available
    const studentInfo = {
      degree: degree || "Undergraduate",
      department: department || req.user?.department || "General",
      semester: semester || req.user?.semester || 1,
      skills: skills || req.user?.skills || [],
      interestArea: interestArea || "General Technology"
    };

    console.log("Generating AI ideas for:", studentInfo);
    const ideas = await generateProjectIdeas(studentInfo);

    return res.status(200).json({
      success: true,
      count: ideas.length,
      ideas
    });

  } catch (error) {
    console.error("❌ AI Controller Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to generate project ideas. Please try again later."
    });
  }
};
