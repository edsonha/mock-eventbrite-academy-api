const express = require("express");
const userRouter = express.Router();

const mongoose = require("mongoose");
require("../models/event.model");
const EventModel = mongoose.model("Event");

const authenticateUser = require("../middleware/authenticate-user");

userRouter.get(
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
      console.log("ERRO", err);
      next(err);
    }
  }
);

module.exports = userRouter;
