require("./utils/db");
const express = require("express");
const morgan = require("morgan");
const app = express();
require("./models/user.model");

const jwt = require("jsonwebtoken");
const upcomingEventsRouter = require("./routes/upcoming-events.route");
const usersRouter = require("./routes/users.route");
const cors = require("cors");

app.use(
  cors({
    origin: function(origin, callback) {
      const allowedOrigins = [
        "http://localhost:3000",
        "https://stashaway-ui.herokuapp.com"
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

app.use(morgan("combined"));
app.use(express.json());
app.use("/users", usersRouter);
app.use("/upcomingevents", upcomingEventsRouter);

app.get("/", (req, res) => res.json("Hello World"));

app.use((err, req, res, next) => {
  // if (!err.statusCode) {
  //   res.status(500).json({ err: "Internal server error" });
  // } else {
  //   res.status(err.statusCode).json({ err: err.message });
  // }
  // console.log("error", err);
  res.sendStatus(500);
});

module.exports = app;
