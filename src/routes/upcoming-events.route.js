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
    /* istanbul ignore next */
    next(err);
  }
});

upcomingEventsRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const foundEvent = await EventModel.findOne({ _id: id });
    if (foundEvent) {
      return res.status(200).json(foundEvent);
    } else {
      return res.status(404).send({ message: "The event does not exist" });
    }
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(404).send({ message: "Event ID not valid" });
    } else {
      next(err);
    }
  }
});

module.exports = upcomingEventsRouter;
