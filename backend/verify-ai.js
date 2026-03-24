import dotenv from "dotenv";
import { generateAIMilestones } from "./src/services/aiMilestone.service.js";

dotenv.config();

const mockProject = {
  title: "AI-Powered Smart Irrigation System",
  domain: "IoT & Agriculture",
  techStack: ["Node.js", "ESP32", "React", "MongoDB"],
  department: "Computer Science",
  semester: 6,
  projectType: "major"
};

async function testGeneration() {
  console.log("🚀 Testing AI Milestone Generation with Links...");
  try {
    const milestones = await generateAIMilestones(mockProject);
    console.log("✅ AI Response Received!");
    
    milestones.forEach((m, i) => {
      console.log(`\n--- Week ${m.weekNumber}: ${m.title} ---`);
      console.log(`Description: ${m.description}`);
      console.log(`Tasks: ${m.tasks.length}`);
      console.log(`YouTube Links: ${m.youtubeLinks?.length || 0}`);
      console.log(`Tutorial Links: ${m.tutorialLinks?.length || 0}`);
      console.log(`Document Links: ${m.documentLinks?.length || 0}`);
      
      if (m.youtubeLinks?.[0]) console.log(`Sample YT: ${m.youtubeLinks[0]}`);
    });
    
    const hasLinks = milestones.every(m => 
      m.youtubeLinks?.length > 0 && 
      m.tutorialLinks?.length > 0 && 
      m.documentLinks?.length > 0
    );
    
    if (hasLinks) {
      console.log("\n🔥 VERIFICATION SUCCESS: All weeks have recommended links!");
    } else {
      console.log("\n⚠️ VERIFICATION PARTIAL: Some weeks are missing links.");
    }
    
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
  }
}

testGeneration();
