const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema(
  {
    customName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    targetUrl: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Link", linkSchema);