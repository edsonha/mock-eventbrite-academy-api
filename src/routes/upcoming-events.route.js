const express = require("express");
const upcomingEventsRouter = express.Router();

upcomingEventsRouter.get("/", (req, res, next) => {
  res.sendStatus(200);
});

module.exports = upcomingEventsRouter;
