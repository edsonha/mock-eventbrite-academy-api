const mongoose = require("mongoose");

const mockEventsWithSeats = [
  {
    _id: mongoose.Types.ObjectId("5d2e798c8c4c740d685e1d3f"),
    title: "Event 1",
    description: "Lorum Ipsum 1.",
    speaker: "Speaker 1",
    time: "2019-08-17T19:00:00+08:00",
    duration: 120,
    location: "Location 1",
    availableSeats: 100,
    image: "https://via.placeholder.com/150.png?text=_"
  },
  {
    _id: mongoose.Types.ObjectId("5d2e7e1aec0f970d68a71465"),
    title: "Event 2",
    description: "Lorum Ipsum 2.",
    speaker: "Speaker 2",
    time: "2019-08-15T19:00:00+08:00",
    duration: 120,
    location: "Location 2",
    availableSeats: 0,
    image: "https://via.placeholder.com/150.png?text=_"
  },
  {
    _id: mongoose.Types.ObjectId("5d2e7e4bec0f970d68a71466"),
    title: "Event 3",
    description: "Lorum Ipsum 3.",
    speaker: "Speaker 3",
    time: "2019-08-15T18:00:00+08:00",
    duration: 90,
    location: "Location 3",
    availableSeats: 100,
    image: "https://via.placeholder.com/150.png?text=_"
  },
  {
    _id: mongoose.Types.ObjectId("5d2e7dd7ec0f970d68a71464"),
    title: "Event 4",
    description: "Lorum Ipsum 4.",
    speaker: "Speaker 4",
    time: "2019-08-19T19:00:00+08:00",
    duration: 90,
    location: "Location 4",
    availableSeats: 0,
    image: "https://via.placeholder.com/150.png?text=_"
  }
];

module.exports = mockEventsWithSeats;
