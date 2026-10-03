const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Link = require("./models/Link");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

// Test route
app.get("/", (req, res) => {
  res.send("Link Customizer backend is running!");
});

// Create custom link
app.post("/api/links", async (req, res) => {
  try {
    const { customName, targetUrl } = req.body;

    if (!customName || !targetUrl) {
      return res.status(400).json({
        message: "Custom name and target URL are required",
      });
    }

    const existingLink = await Link.findOne({
      customName: customName.toLowerCase(),
    });

    if (existingLink) {
      return res.status(409).json({
        message: "This custom name is already taken",
      });
    }

    const newLink = new Link({
      customName,
      targetUrl,
    });

    await newLink.save();

    res.status(201).json({
      message: "Custom link created successfully",
      link: newLink,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// Check custom name availability
app.get("/api/links/check/:customName", async (req, res) => {
  try {
    const { customName } = req.params;

    const existingLink = await Link.findOne({
      customName: customName.toLowerCase(),
    });

    res.json({
      available: !existingLink,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

app.get("/:customName", async (req, res) => {
  try {
    const { customName } = req.params;

    const link = await Link.findOne({
      customName: customName.toLowerCase(),
    });

    if (!link) {
      return res.status(404).send("Custom link not found");
    }

    res.redirect(link.targetUrl);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
