const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Note = require("../models/Note");
const auth = require("../middleware/authMiddleware");

// ===============================
// MULTER STORAGE
// ===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

// ===============================
// ALLOWED DOCUMENT TYPES
// ===============================
const allowedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];

// ===============================
// MULTER CONFIG
// ===============================
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Unsupported file type"), false);
    }
    cb(null, true);
  }
});

// ===============================
// GET ALL NOTES (PUBLIC)
// ===============================
router.get("/all", async (req, res) => {
  try {
    const notes = await Note.find()
      .populate("userId", "name email")
      .sort({ uploadDate: -1 });

    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notes" });
  }
});

// ===============================
// UPLOAD NOTE (PROTECTED)
// ===============================
router.post("/upload", auth, upload.single("note"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const note = new Note({
      filename: req.file.filename,
      originalName: req.file.originalname,
      userId: req.user.id
    });

    await note.save();
    res.status(201).json({ message: "File uploaded successfully" });

  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
});

// ===============================
// DELETE NOTE (OWNER ONLY)
// ===============================
router.delete("/:id", auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // OWNER CHECK
    if (note.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // DELETE FILE FROM UPLOADS
    const filePath = path.join("uploads", note.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await note.deleteOne();
    res.json({ message: "Note deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
