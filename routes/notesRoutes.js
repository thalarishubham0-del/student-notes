const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const Note = require("../models/Note");

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
  {
    resource_type: "raw",
    public_id: req.file.originalname.replace(/\.[^/.]+$/, ""), // remove .pdf
    use_filename: true,
    unique_filename: false
  },
  (error, result) => {
    if (error) reject(error);
    else resolve(result);
  }
)
        .end(req.file.buffer);
    });

    const note = await Note.create({
      filename: req.file.originalname,
      url: result.secure_url,
      user:req.user.id
    });

    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

router.get("/", async (req, res) => {
  const notes = await Note.find().sort({ uploadedAt: -1 });
  res.json(notes);
});
// DELETE NOTE
router.delete("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    await note.deleteOne();
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
