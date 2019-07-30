const express = require("express");
const mongoose = require("mongoose");
const upcomingEventsRouter = express.Router();
const moment = require("moment");
require("../models/event.model");
const EventModel = mongoose.model("Event");
const UserModel = mongoose.model("user");

const authenticateUser = require("../middleware/authenticate-user");

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
    fullDescription: event.fullDescription,
    time: event.time,
    speaker: event.speaker,
    speakerBio: event.speakerBio,
    duration: event.duration,
    location: event.location,
    availableSeats: event.availableSeats,
    image: event.image
  });
});

upcomingEventsRouter.post(
  "/:id/user/registerevent",
  authenticateUser,
  async (req, res, next) => {
    try {
      const user = req.user;
      const registeredEvent = req.event;
      // const loggedInUser = await UserModel.findOne({ _id: userId });
      // if (registeredEvent && loggedInUser) {
      if (registeredEvent) {
        registeredEvent.attendees.push({
          _id: user._id,
          name: user.name,
          email: user.email
        });
        await registeredEvent.save();
        res.sendStatus(200);
      } else {
        return res.status(401).send({ message: "Event does not exist" });
      }
      // else if (!loggedInUser) {
      //   return res.status(404).send({ message: "User does not exist" });
      // }
    } catch (err) {
      next(err);
    }
  }
);

module.exports = upcomingEventsRouter;
