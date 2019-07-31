const express = require("express");
const profileRouter = express.Router();
const moment = require("moment");
const mongoose = require("mongoose");
require("../models/event.model");
const EventModel = mongoose.model("Event");

const authenticateUser = require("../middleware/authenticate-user");

profileRouter.get(
  "/registeredevents",
  authenticateUser,
  async (req, res, next) => {
    try {
      const user = req.user;
      const getAllEvents = await EventModel.find();
      const userEvents = getAllEvents
        .filter(event => {
          return event.attendees
            .map(attendee => attendee.email)
            .includes(user.email);
        })
        .sort((a, b) => {
          return moment(a.time) - moment(b.time);
        })
        .map(fileredEvent => {
          return {
            _id: fileredEvent._id,
            title: fileredEvent.title,
            description: fileredEvent.description,
            fullDescription: fileredEvent.fullDescription,
            speaker: fileredEvent.speaker,
            speakerBio: fileredEvent.speakerBio,
            time: fileredEvent.time,
            duration: fileredEvent.duration,
            location: fileredEvent.location,
            availableSeats: fileredEvent.availableSeats,
            image: fileredEvent.image
          };
        });
      res.status(200).json(userEvents);
    } catch (err) {
      console.log("ERROR", err);
      next(err);
    }
  }
);

module.exports = profileRouter;
