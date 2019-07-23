const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  objectiveHeader: { type: String, required: true },
  objectives: [{ type: String, required: true }],
  level: { type: String, required: true }
});

mongoose.model("Course", courseSchema);
