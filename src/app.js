require("./utils/db");
require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
const express = require("express");
const app = express();
require("./models/user.model");

const upcomingEventsRouter = require("./routes/upcoming-events.route");
const { usersRouter } = require("./routes/users.route");
const profileRouter = require("./routes/profile.route");
const coursesRouter = require("./routes/courses.route");
const cors = require("cors");

app.use(
  cors({
    origin: function(origin, callback) {
      const allowedOrigins = [
        "http://localhost:3000",
        "https://eventbrite-academy-ui.herokuapp.com"
      ];
      /* istanbul ignore next */
      if (!origin) return callback(null, true);
      /* istanbul ignore next */
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error("Not allowed by CORS"), false);
      } else {
        return callback(null, true);
      }
    }
  })
);

app.use(express.json());
app.use("/courses", coursesRouter);
app.use("/users", usersRouter);
app.use("/profile", profileRouter);
app.use("/upcomingevents", upcomingEventsRouter);

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
