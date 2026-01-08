const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },

  originalName: {
    type: String,
    required: true,
  },

  fileUrl: {
    type: String,
    required: true, // Cloudinary URL
  },

  uploadDate: {
    type: Date,
    default: Date.now,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Note", noteSchema);
