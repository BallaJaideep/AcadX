// src/server.js
import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

// Load ENV variables
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB (Atlas or Local depending on MONGO_URI)
    console.log("🔄 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ Successfully connected to MongoDB!");

    // Create HTTP server
    const server = http.createServer(app);

    // Start listening
    server.listen(PORT, () => {
      console.log(`🚀 AcadX backend running at: http://localhost:${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
    });

    // Handle unexpected server errors
    server.on("error", (err) => {
      console.error("❌ Server Error:", err.message);
      process.exit(1);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

