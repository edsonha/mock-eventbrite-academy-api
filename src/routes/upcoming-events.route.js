const express = require("express");
const mongoose = require("mongoose");
const upcomingEventsRouter = express.Router();
const moment = require("moment");
require("../models/event.model");
const EventModel = mongoose.model("Event");
const UserModel = mongoose.model("user");

upcomingEventsRouter.get("/", async (req, res, next) => {
  try {
    const foundEvents = await EventModel.find();
    foundEvents
      .sort((a, b) => {
        return moment(a.time) - moment(b.time);
      })
      .map(event => {
        return {
          _id: event._id,
          title: event.title,
          description: event.description,
          time: event.time,
          speaker: event.speaker,
          duration: event.duration,
          location: event.location,
          availableSeats: event.availableSeats,
          image: event.image
        };
      });
    res.status(200).json(foundEvents);
  } catch (err) {
    /* istanbul ignore next */
    next(err);
  }
});

upcomingEventsRouter.param("id", async (req, res, next, id) => {
  try {
    const event = await EventModel.findOne({ _id: id });
    if (event) {
      req.event = event;
      next();
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

upcomingEventsRouter.get("/:id", async (req, res, next) => {
  const event = req.event;
  return res.status(200).json({
    _id: event._id,
    title: event.title,
    description: event.description,
    time: event.time,
    speaker: event.speaker,
    duration: event.duration,
    location: event.location,
    availableSeats: event.availableSeats,
    image: event.image
  });
});

upcomingEventsRouter.put("/:id/user/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const registeredEvent = req.event;
    const loggedInUser = await UserModel.findOne({ _id: userId });
    if (registeredEvent && loggedInUser) {
      registeredEvent.attendees.push(userId);
      await registeredEvent.save();
      res.sendStatus(200);
    } else if (!loggedInUser) {
      return res.status(404).send({ message: "User does not exist" });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = upcomingEventsRouter;
