const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  filename: String,
  url: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Note", noteSchema);
