import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/models/user.model.js";

async function seed() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/elor");
    console.log("Connected to local DB...");

    const existing = await User.findOne({ email: "test@university.edu" });
    if (existing) {
      console.log("Test user already exists. Email: test@university.edu, Password: password123");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("password123", 10);
    
    await User.create({
      name: "Test Student",
      email: "test@university.edu",
      password: hashedPassword,
      role: "student",
      department: "Computer Science",
      semester: 6,
      points: 100
    });

    console.log("✅ Seeded test user!");
    console.log("👉 Email: test@university.edu");
    console.log("👉 Password: password123");

    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
