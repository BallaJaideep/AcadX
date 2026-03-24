import multer from "multer";
import fs from "fs";
import path from "path";

const dir = "uploads/profile-photos";
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: dir,
  filename: (req, file, cb) => {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

export const uploadPhoto = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

