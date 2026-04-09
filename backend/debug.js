import mongoose from "mongoose";
import dotenv from "dotenv";
import Project from "./src/models/Project.model.js";

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const projects = await Project.find({ githubUrl: { $ne: "" } });
        for (const p of projects) {
            console.log("-------------------");
            console.log("Title: ", p.title);
            console.log("githubUrl: ", JSON.stringify(p.githubUrl));
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
run();
