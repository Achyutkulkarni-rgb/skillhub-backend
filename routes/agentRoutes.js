// routes/agentRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const Agent = require("../models/Agent"); // Your Agent model
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Add a new agent
router.post("/add", protect, async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    // Validate input
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if agent already exists
    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({ message: "Agent already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new agent
    const newAgent = new Agent({
      name,
      email,
      mobile,
      password: hashedPassword,
    });

    await newAgent.save();

    res.status(201).json({ message: "Agent added successfully", agent: newAgent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Get all agents (optional, protected)
router.get("/", protect, async (req, res) => {
  try {
    const agents = await Agent.find().select("-password"); // exclude password
    res.status(200).json(agents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
