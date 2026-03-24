import mongoose from "mongoose";
import MentorRequest from "./src/models/MentorRequest.model.js";
import User from "./src/models/user.model.js";
import dotenv from "dotenv";
dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");
    
    const request = await MentorRequest.findOne({ status: "PENDING" });
    if (!request) {
      console.log("No pending requests found to test.");
    } else {
      console.log("Found pending request:", request._id);
      console.log("Model fields:", Object.keys(MentorRequest.schema.paths));
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error("Diagnostic failed:", err);
  }
}

check();
