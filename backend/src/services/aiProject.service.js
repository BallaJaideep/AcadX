import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
let model = null;

if (hasGeminiKey) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Using gemini-1.5-flash for high-fidelity structured output and production stability
  model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash-lite" });
}

/**
 * Generate specific project details based on student choices
 * @param {Object} params - { domain, techStack, semester, projectType, department }
 */
export const generateProjectDetails = async (params) => {
  if (!model) {
    console.warn("⚠️ GEMINI_API_KEY missing → AI Project Details fallback triggered");
    return getFallbackDetails(params);
  }

  const { domain, techStack, semester, projectType, department} = params;

  try {
    const timestamp = new Date().toISOString();
    const prompt = `
You are a Distinguished Technical Architect and Industrial Strategy Consultant. 
Generate an EXHAUSTIVE, high-density industrial project proposal. 

STRICT QUALITY DIRECTIVES:
- NO GENERIC SAMPLES: Every response must be technically rigorous and industry-specific.
- DATA DENSITY: All fields must be packed with technical terminology, specific industrial metrics, and implementation nuances.
- BUDGET REALISM: Provide a hard-number breakdown (e.g., $1,250 for AWS p3.2xlarge instances, $400 for MongoDB Atlas high-availability, etc.).
- DEPTH: The Problem Statement MUST be a semi-technical whitepaper (500+ words) covering architectural vacuums, scalability bottlenecks, and legacy inefficiencies.

PARAMETERS:
- Domain: ${domain}
- Tech Stack: ${Array.isArray(techStack) ? techStack.join(", ") : techStack}
- Semester: ${semester}
- Project Type: ${projectType}
- Department: ${department}
- Reference Time: ${timestamp}

INDUSTRIAL QUALITY STANDARDS:
- TITLE: Must be a professional enterprise-grade name.
- PROBLEM STATEMENT: An exhaustive, multi-paragraph (500+ words) deep-dive into industrial inefficiencies and technological gaps.
- OBJECTIVES: A strategic set of high-level technical and business goals (detailed and quantifiable).
- OUTCOME: Production-ready deliverable specifications including UI/UX fidelity, performance KPIs (latency, throughput), and deployment architecture.
- BUDGET: A realistic, accurate financial breakdown in USD including Cloud Infrastructure (AWS/Azure/GCP), API quotas, hardware resources, and estimated engineering man-hours.

RETURN ONLY A VALID JSON OBJECT.

JSON STRUCTURE (Must be valid JSON):
{
  "title": "Industrial Enterprise Name",
  "problemStatement": "Exhaustive technical analysis (500+ words)...",
  "objective": "Strategic quantifiable technical goals...",
  "outcome": "Comprehensive deliverable specifications and performance KPIs...",
  "budget": "Accurate financial and resource breakdown with specific numbers..."
}
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });
    const text = result.response.text();

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Invalid Gemini response format");
    }

    const aiData = JSON.parse(match[0]);

    // ABSOLUTE DATA INTEGRITY: Ensure all fields are valid strings for Mongoose
    Object.keys(aiData).forEach(key => {
      if (typeof aiData[key] === 'object' && aiData[key] !== null) {
        aiData[key] = JSON.stringify(aiData[key], null, 2);
      }
    });

    return aiData;

  } catch (error) {
    console.error("❌ Gemini API Error (Project Details):", error.message);
    
    // RADICAL FALLBACK: Construct a highly specific, non-generic problem statement
    // based on the student's actual inputs so it is NEVER the same.
    const uniqueTitle = `${params.domain.charAt(0).toUpperCase() + params.domain.slice(1)} ${params.techStack[0]} Industrial Framework`;
    const uniqueProblem = `INDUSTRIAL TECHNICAL ANALYSIS: The ${params.domain} sector is currently experiencing a critical architectural vacuum in the implementation of ${params.techStack.join(" and ")} solutions. This project addresses the specific scalability bottlenecks and real-time data ingestion latencies inherent in ${params.department} standards. By leveraging a high-fidelity ${params.techStack[0]} architecture, we establish a robust synchronization layer that eliminates the legacy fragmentation typically observed in ${params.projectType} scale deployments. This unique technical record documents the strategic transition toward a high-throughput, latency-optimized deliverable.`;
    const uniqueObjective = `1. Engineer a production-grade ${params.domain} synchronization engine. 2. Optimize ${params.techStack.join("/")} stack for sub-second industrial latency. 3. Establish a verified ${params.department} technical standard.`;
    const uniqueOutcome = `A high-fidelity ${params.projectType} deliverable featuring 99.9% architectural uptime, comprehensive ${params.techStack[0]} deployment manifests, and a verified industrial performance record.`;
    
    return {
      title: uniqueTitle,
      problemStatement: uniqueProblem,
      objective: uniqueObjective,
      outcome: uniqueOutcome,
      budget: "$8,500 Total Breakdown: $2,500 (Enterprise Cloud Infrastructure), $1,200 (Premium API Quotas), $4,800 (Senior Engineering Man-hours - 120 hrs @ $40/hr)"
    };
  }
};

/**
 * Generate project ideas based on student preferences
 * @param {Object} params - { degree, department, semester, skills, interestArea }
 */
export const generateProjectIdeas = async (params) => {
  if (!model) {
    console.warn("⚠️ GEMINI_API_KEY missing → AI Project Ideas fallback triggered");
    return getFallbackIdeas(params.department);
  }

  const { degree, department, semester, skills, interestArea } = params;

  try {
    const prompt = `
You are a Senior Academic Project Supervisor for a university. 
Your goal is to suggest 3-5 high-quality, feasible, and academically sound project ideas for a student.

STUDENT PROFILE:
- Degree: ${degree}
- Department: ${department}
- Semester: ${semester}
- Skills: ${Array.isArray(skills) ? skills.join(", ") : skills}
- Interest Area: ${interestArea}

RULES:
- Ideas must be appropriate for the student's semester level.
- Provide a mix of difficulty (Beginner, Intermediate, Advanced).
- Tech stack must be modern and relevant to the industry.
- Return ONLY a valid JSON array.

JSON STRUCTURE:
[
  {
    "title": "Project Title",
    "problemStatement": "A concise description of the problem being solved.",
    "objective": "The main goal of the project.",
    "expectedOutcome": "What will be the final result/deliverable.",
    "techStack": ["Technology 1", "Technology 2"],
    "difficulty": "Intermediate",
    "estimatedBudget": "Minimal / Low / Medium",
    "academicValue": "Why this is a good project for their semester."
  }
]
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from the response text
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) {
      throw new Error("Invalid Gemini response format");
    }

    const ideas = JSON.parse(match[0]);
    return ideas;

  } catch (error) {
    console.error("❌ Gemini API Error (Project Ideas):", error.message);
    return getFallbackIdeas(department);
  }
};

/**
 * Fallback project ideas if AI fails
 */
const getFallbackIdeas = (dept) => {
  return [
    {
      title: `Advanced ${dept || 'Department'} Management System`,
      problemStatement: "Organizations struggle to manage internal records efficiently.",
      objective: "Build a secure, scalable management portal.",
      expectedOutcome: "A fully functional web application with role-based access.",
      techStack: ["React", "Node.js", "MongoDB"],
      difficulty: "Intermediate",
      estimatedBudget: "Minimal",
      academicValue: "Covers full-stack development and security best practices."
    }
  ];
};
