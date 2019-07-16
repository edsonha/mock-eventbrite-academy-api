const mongoose = require("mongoose");

const dbURI =
  process.env.MONGODB_URI ||
  global.__MONGO_URI__ ||
  "mongodb://localhost:27017/stashaway";

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useNewUrlParser: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", () => {
  console.log("MongoDB connected");
});
