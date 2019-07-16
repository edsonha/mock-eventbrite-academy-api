const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  speaker: { type: String, required: true, default: "TBD" },
  duration: { type: Number, required: true },
  location: { type: String, required: true, default: "TBD" },
  availableSeats: { type: Number, required: true },
  image: {
    type: String,
    required: true,
    default: "https://via.placeholder.com/150.png?text=_"
  }
});

mongoose.model("events", eventSchema);
