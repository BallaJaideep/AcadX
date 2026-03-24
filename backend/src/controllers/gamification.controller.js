import User from "../models/user.model.js";
import Milestone from "../models/Milestone.model.js";
import PointsHistory from "../models/PointsHistory.model.js";

/* ======================================================
   APPLY WEEK COMPLETION REWARD
   (Milestone = Week)
   POST /api/gamification/week-complete
====================================================== */
export const applyWeeklyReward = async (req, res) => {
  try {
    const { milestoneId } = req.body;
    const userId = req.user._id;

    if (!milestoneId) {
      return res.status(400).json({ message: "milestoneId is required" });
    }

    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: "Week not found" });
    }

    if (milestone.status !== "COMPLETED") {
      return res.status(400).json({
        message: "Week must be completed before reward",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    /* ======================================
       PREVENT DUPLICATE REWARD
    ====================================== */
    const alreadyRewarded = await PointsHistory.findOne({
      studentId: user._id,
      sourceType: "weekly_milestone",
      sourceId: milestone._id,
    });

    if (alreadyRewarded) {
      return res.status(400).json({
        message: "Reward already applied for this week",
      });
    }

    /* ======================================
       SAFE DEFAULTS
    ====================================== */
    user.points = Number(user.points) || 0;
    user.weekStreak = Number(user.weekStreak) || 0;
    user.badges = Array.isArray(user.badges) ? user.badges : [];

    /* ======================================
       POINTS + STREAK LOGIC
    ====================================== */
    const POINTS = 50;
    user.points += POINTS;
    user.weekStreak += 1;

    /* ======================================
       BADGE LOGIC
    ====================================== */
    if (user.weekStreak === 3 && !user.badges.includes("Consistent Performer")) {
      user.badges.push("Consistent Performer");
    }

    if (user.weekStreak === 6 && !user.badges.includes("Project Champion")) {
      user.badges.push("Project Champion");
    }

    await user.save();

    await PointsHistory.create({
      studentId: user._id,
      points: POINTS,
      reason: `Completed week: ${milestone.title}`,
      sourceType: "weekly_milestone",
      sourceId: milestone._id,
    });

    return res.json({
      message: "Weekly reward applied successfully",
      points: user.points,
      badges: user.badges,
      streak: user.weekStreak,
    });
  } catch (error) {
    console.error("Gamification error:", error);
    return res.status(500).json({ message: "Failed to apply reward" });
  }
};

/* ======================================================
   LEADERBOARD
   GET /api/gamification/leaderboard
====================================================== */
export const getLeaderboard = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("name department points badges")
      .sort({ points: -1 })
      .limit(20);

    return res.json({
      leaderboard: students,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return res.status(500).json({
      message: "Failed to load leaderboard",
    });
  }
};
