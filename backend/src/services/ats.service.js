export const checkATSScore = async (portfolio) => {
  let score = 20; // Base score
  const feedback = [];

  // Project Quantity & Status Guide
  const completed = portfolio.projectsSummary.filter(p => p.status === 'completed').length;
  if (completed >= 2) {
    score += 30;
    feedback.push("✅ Strong Project Completion: Having multiple completed projects is excellent for ATS ranking.");
  } else {
    feedback.push("💡 Resume Guide: Convert 'In Progress' projects to 'Completed'. Recruiters prioritize finished outcomes.");
  }

  // Skill Density Guide
  if (portfolio.skills.length >= 8) {
    score += 25;
    feedback.push("✅ High Keyword Density: Your skill cloud contains high-value industry keywords.");
  } else {
    feedback.push("💡 Resume Guide: Add more specific framework keywords (e.g., Node.js, React, MongoDB) to pass automated filters.");
  }

  // Content Length Guide
  if (portfolio.about.length > 300) {
    score += 25;
    feedback.push("✅ Narrative Depth: Your professional summary is detailed enough to be indexed well.");
  } else {
    feedback.push("💡 Resume Guide: Elaborate on your 'About Me'. Mention specific tools you used to solve problems.");
  }

  return { score: Math.min(score, 100), feedback };
};