const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const authMiddleware = require("../middleware/authMiddleware");

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

/* ================= CLOUDINARY CONFIG ================= */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ================= MULTER + CLOUDINARY ================= */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "student_notes",
    resource_type: "raw", // IMPORTANT for PDFs, PPTs
    allowed_formats: ["pdf", "ppt", "pptx", "doc", "docx"],
  },
});

const upload = multer({ storage });

/* ================= UPLOAD NOTE ================= */
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"), // 🔴 FIELD NAME MUST BE "file"
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const note = new Note({
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileUrl: req.file.path, // Cloudinary URL
        userId: req.user.id,
      });

      await note.save();

      res.status(201).json(note);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error during upload" });
    }
  }
);

/* ================= GET NOTES ================= */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({
      uploadDate: -1,
    });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= DELETE NOTE ================= */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
