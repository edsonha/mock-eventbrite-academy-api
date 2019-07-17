const express = require("express");
const upcomingEventsRouter = express.Router();
const mockData = require("../../data/mockEventsWithSeats.mockdata");
const moment = require("moment");
const UpcomingEvents = require("../models/event.model");

upcomingEventsRouter.get("/", (req, res, next) => {
  try {
    mockData.sort((a, b) => {
      return moment(a.time) - moment(b.time);
    });
    res.status(200).json(mockData);
  } catch (err) {
    next(err);
  }
});

module.exports = upcomingEventsRouter;
