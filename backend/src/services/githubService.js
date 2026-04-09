import axios from "axios";
import ProjectHealthSnapshot from "../models/ProjectHealthSnapshot.model.js";
import Project from "../models/Project.model.js";

/**
 * Extracts the owner and repo name from a standard GitHub URL.
 * @param {string} githubUrl - e.g., "https://github.com/facebook/react"
 * @returns {object|null} - { owner: "facebook", repo: "react" }
 */
const parseGithubUrl = (githubUrl) => {
  try {
    const url = new URL(githubUrl);
    if (url.hostname !== "github.com") return null;
    
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      let repoName = parts[1];
      if (repoName.endsWith('.git')) {
        repoName = repoName.slice(0, -4);
      }
      return { owner: parts[0], repo: repoName };
    }
    return null;
  } catch (err) {
    return null;
  }
};

/**
 * Fetches recent GitHub activity (commits, PRs) from a public repository
 * for the last 24 hours.
 * 
 * @param {string} githubUrl - Repository URL
 * @returns {Promise<object>} - Activity counts
 */
export const fetchRecentGithubActivity = async (githubUrl) => {
  const result = {
    commitsCount: 0,
    prsOpened: 0,
    issuesActivity: 0,
  };

  if (!githubUrl) return result;

  const repoInfo = parseGithubUrl(githubUrl);
  if (!repoInfo) return result;

  const { owner, repo } = repoInfo;
  
  // Calculate timestamp for 24 hours ago
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  try {
    // 1. Fetch Commits
    const commitsResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      {
        params: { since },
        headers: {
          Accept: "application/vnd.github.v3+json",
          // Add auth header if we ever hit rate limits for public repos
          // Authorization: `token ${process.env.GITHUB_PAT}`,
        },
      }
    );

    result.commitsCount = commitsResponse.data.length || 0;

    // 2. Fetch Pull Requests opened in last 24 hours
    // Simplified by using issues API endpoint (PRs are technically issues in GitHub API)
    const issuesResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        params: { 
          state: "all",
          since 
        },
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    const recentIssues = issuesResponse.data;
    
    let prCount = 0;
    let issueCount = 0;

    for (const item of recentIssues) {
      // Check if it's a Pull Request
      if (item.pull_request) {
        prCount++;
      } else {
        issueCount++;
      }
    }

    result.prsOpened = prCount;
    result.issuesActivity = issueCount;

    return result;

  } catch (error) {
    console.error(`❌ Failed to fetch GitHub activity for ${owner}/${repo}:`, error.message);
    // Return zeros so the job doesn't completely crash for a single invalid repo
    return result;
  }
};

/**
 * Backfills exactly 14 days of commit history immediately when a student links a repository.
 * Generates 14 ProjectHealthSnapshots dynamically so the Dev Pulse heatmap reflects past work.
 */
export const backfillGithubHistory = async (projectId, githubUrl) => {
  const repoInfo = parseGithubUrl(githubUrl);
  if (!repoInfo) return { success: false, reason: "Invalid GitHub URL format." };
  const { owner, repo } = repoInfo;

  try {
    console.log(`⏳ Backfilling 30 days of GitHub history for ${owner}/${repo}...`);
    // Delete any existing snapshots for this project so we have a clean slate of 30 days
    await ProjectHealthSnapshot.deleteMany({ projectId });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      {
        params: { since: thirtyDaysAgo.toISOString(), per_page: 100 },
        headers: { Accept: "application/vnd.github.v3+json" },
      }
    );

    const commits = response.data || [];

    // Group commits by Date string (YYYY-MM-DD)
    const commitCountsByDate = {};
    for (const commit of commits) {
        const dateStr = new Date(commit.commit.author.date).toISOString().split('T')[0];
        commitCountsByDate[dateStr] = (commitCountsByDate[dateStr] || 0) + 1;
    }

    const snapshotsToInsert = [];
    let baseScore = 100; // Start perfect

    // Generate historical snapshots in chronological order
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = commitCountsByDate[dateStr] || 0;
        
        // Calculate rolling 7-day commit sum
        let sevenDaySum = count;
        for (let j = 1; j < 7; j++) {
            const pastDate = new Date(d);
            pastDate.setDate(pastDate.getDate() - j);
            const pastStr = pastDate.toISOString().split('T')[0];
            sevenDaySum += (commitCountsByDate[pastStr] || 0);
        }

        // Strict Weekly Consistency Rule: At least 3 commits per week
        if (sevenDaySum < 3) {
            baseScore -= 10; // Heavy penalty for failing weekly quota
        } else {
            baseScore += 5;  // Reward for maintaining velocity
        }
        baseScore = Math.max(0, Math.min(100, baseScore));

        snapshotsToInsert.push({
            projectId,
            date: d,
            commitsCount: count,
            prsOpened: 0,
            issuesActivity: 0,
            dailyHealthScore: baseScore
        });
    }

    await ProjectHealthSnapshot.insertMany(snapshotsToInsert);

    // Apply the final calculated score directly to the primary Project document!
    let finalStatus = "Healthy";
    if (baseScore < 50) finalStatus = "Critical";
    else if (baseScore < 80) finalStatus = "Warning";

    await Project.updateOne(
        { _id: projectId },
        { $set: { currentHealthScore: baseScore, healthStatus: finalStatus } }
    );

    console.log(`✅ Successfully backfilled 30 days of history for ${owner}/${repo}.`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to backfill github history for ${owner}/${repo}:`, error.message);
    if (error.response) {
      if (error.response.status === 404) return { success: false, reason: "GitHub returned 404 Not Found. This means the repository is set to PRIVATE or the URL is mistyped." };
      if (error.response.status === 403) return { success: false, reason: "GitHub API Rate Limit Exceeded. Please try again in an hour." };
      if (error.response.status === 409) return { success: false, reason: "GitHub returned 409 Conflict. The repository exists but contains no commits." };
    }
    return { success: false, reason: error.message };
  }
};
