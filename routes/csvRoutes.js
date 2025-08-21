// csvRoutes.js
const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const Agent = require("../models/Agent");
const CSVItem = require("../models/CSVItem"); // Model to store distributed items
const { protect } = require("../Middleware/authmiddleware");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ✅ Upload CSV and distribute to agents
router.post("/upload", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const results = [];

    // Read CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        fs.unlinkSync(req.file.path); // delete uploaded file

        // Fetch all agents
        const agents = await Agent.find();
        if (agents.length === 0)
          return res.status(400).json({ message: "No agents found" });

        // Clear previous assignments if needed
        await CSVItem.deleteMany({}); 

        // Distribute items evenly among agents
        for (let i = 0; i < results.length; i++) {
          const agentId = agents[i % agents.length]._id;
          const item = {
            agent: agentId,
            FirstName: results[i].FirstName || "",
            Phone: results[i].Phone || "",
            Notes: results[i].Notes || "",
          };

          // Save each item to DB
          const csvItem = new CSVItem(item);
          await csvItem.save();
        }

        res.status(200).json({ message: "CSV uploaded and distributed successfully" });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Get CSV items for a specific agent
router.get("/agent/:id", protect, async (req, res) => {
  try {
    const agentId = req.params.id;

    // Validate agent exists
    const agent = await Agent.findById(agentId);
    if (!agent) return res.status(404).json({ message: "Agent not found" });

    // Fetch assigned CSV items
    const items = await CSVItem.find({ agent: agentId });
    res.status(200).json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
