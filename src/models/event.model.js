const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  time: { type: String, required: true },
  speaker: { type: String, required: true, default: "TBD" },
  duration: { type: Number, required: true },
  location: { type: String, required: true, default: "TBD" },
  availableSeats: { type: Number, required: true },
  image: {
    type: String,
    required: false
  },
  attendees: [{ type: String }]
});

mongoose.model("Event", eventSchema);
