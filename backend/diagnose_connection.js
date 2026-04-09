
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const verifyConnection = async () => {
  try {
    const uri = process.env.MONGO_URI;
    console.log("Checking connection to:", uri?.split("@")[1] || "No URI found");
    
    if (!uri) {
      console.error("❌ MONGO_URI is missing");
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log("✅ MongoDB Connection Successful!");
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Found collections:", collections.map(c => c.name));
    
    process.exit(0);
  } catch (err) {
    console.error("❌ MongoDB Connection FAILED:", err.message);
    process.exit(1);
  }
};

verifyConnection();
