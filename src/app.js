require("./utils/db");
const express = require("express");
const morgan = require("morgan");
const app = express();
app.use(morgan("combined"));
app.use(express.json());

app.get("/", (req, res) => res.json("Hello World"));

app.use((err, req, res, next) => {
  console.log("error", err);
  res.sendStatus(500);
});

module.exports = app;
