import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/final-submissions";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    cb(
      null,
      `${req.user._id}-${Date.now()}${path.extname(
        file.originalname
      )}`
    );
  },
});

const fileFilter = (_, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Invalid file type"), false);
};

export const uploadFinalFiles = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
