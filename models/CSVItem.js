// models/CSVItem.js
const mongoose = require("mongoose");

const CSVItemSchema = new mongoose.Schema({
  agent: { type: mongoose.Schema.Types.ObjectId, ref: "Agent", required: true },
  FirstName: { type: String, required: true },
  Phone: { type: String, required: true },
  Notes: { type: String },
});

module.exports = mongoose.model("CSVItem", CSVItemSchema);
