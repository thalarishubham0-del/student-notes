const express = require("express");
const router = express.Router();
const multer = require("multer");

const Note = require("../models/Note");
const authMiddleware = require("../middleware/authMiddleware");

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

/* =========================
   CLOUDINARY CONFIG
========================= */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* =========================
   MULTER + CLOUDINARY STORAGE
   IMPORTANT: resource_type: "raw"
========================= */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "student-notes",
    resource_type: "raw", // REQUIRED for PDFs, PPT, DOC
    allowed_formats: ["pdf", "ppt", "pptx", "doc", "docx"],
  },
});

const upload = multer({ storage });

/* =========================
   UPLOAD NOTE
========================= */
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const note = new Note({
        filename: req.file.filename,              // Cloudinary filename
        originalName: req.file.originalname,      // Original file name
        fileUrl: req.file.path,                   // ✅ Cloudinary URL
        userId: req.user.id,
      });

      await note.save();

      res.status(201).json(note);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Server error during upload" });
    }
  }
);

/* =========================
   GET ALL NOTES (USER)
========================= */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({
      uploadDate: -1,
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   DELETE NOTE
========================= */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Delete from Cloudinary
    if (note.filename) {
      await cloudinary.uploader.destroy(note.filename, {
        resource_type: "raw",
      });
    }

    await note.deleteOne();

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
