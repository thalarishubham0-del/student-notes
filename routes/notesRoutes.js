const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const auth = require("../middleware/authMiddleware");

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

/* ================= CLOUDINARY CONFIG ================= */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/* ================= MULTER STORAGE ================= */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "student-notes",
    resource_type: "raw",
    allowed_formats: ["pdf", "ppt", "pptx", "doc", "docx"]
  }
});

const upload = multer({ storage });

/* ================= UPLOAD NOTE ================= */
router.post(
  "/upload",
  auth,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const note = new Note({
        filename: req.file.originalname,
        fileUrl: req.file.path, // Cloudinary URL
        userId: req.user.id
      });

      await note.save();
      res.json(note);

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

/* ================= GET NOTES ================= */
router.get("/", auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: "Failed to load notes" });
  }
});

/* ================= DELETE NOTE ================= */
router.delete("/:id", auth, async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
