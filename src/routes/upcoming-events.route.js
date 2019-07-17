const express = require("express");
const mongoose = require("mongoose");
const upcomingEventsRouter = express.Router();
const moment = require("moment");
require("../models/event.model");
const EventModel = mongoose.model("Event");

upcomingEventsRouter.get("/", async (req, res, next) => {
  try {
    const foundEvents = await EventModel.find();
    foundEvents.sort((a, b) => {
      return moment(a.time) - moment(b.time);
    });
    res.status(200).json(foundEvents);
  } catch (err) {
    next(err);
  }
});

module.exports = upcomingEventsRouter;
