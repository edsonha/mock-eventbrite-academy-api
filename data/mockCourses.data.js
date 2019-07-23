const mongoose = require("mongoose");

module.exports = [
  {
    _id: mongoose.Types.ObjectId("5d36d83d2f4672145ca87dbf"),
    title: "Financial Planning Basics",
    description: "Lorum Ipsum.",
    objectiveHeader: "Objective",
    objectives: ["Obj 1", "Obj 2"],
    level: "Basic"
  },
  {
    _id: mongoose.Types.ObjectId("5d36d8492f4672145ca87dc0"),
    title: "Investing Basics",
    description: "Lorum Ipsum2.",
    objectiveHeader: "Objective2",
    objectives: ["Obj 3", "Obj 4"],
    level: "Basic"
  },
  {
    _id: mongoose.Types.ObjectId("5d36d8552f4672145ca87dc1"),
    title: "Advanced investing",
    description: "Lorum Ipsum3.",
    objectiveHeader: "Objective3",
    objectives: ["Obj 5", "Obj 6"],
    level: "Advanced"
  },
  {
    _id: mongoose.Types.ObjectId("5d36d8552f4672145ca87dc2"),
    title: "StashAway: An Inside Look",
    description: "Lorum Ipsum3.",
    objectiveHeader: "Objective3",
    objectives: ["5", "6"],
    level: "Elective"
  }
];
