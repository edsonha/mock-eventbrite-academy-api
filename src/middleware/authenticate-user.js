const jwt = require("jsonwebtoken");
const secretKey = require("../utils/key");
const mongoose = require("mongoose");
require("../models/user.model");
const UserModel = mongoose.model("user");

const authenticateUser = async (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (!bearerHeader) {
    res.sendStatus(401);
  }
  try {
    const payload = jwt.verify(bearerHeader.split(" ")[1], secretKey);
    const foundUser = await UserModel.findOne({ email: payload.sub });
    if (foundUser) {
      req.user = foundUser;
      next();
    }
    throw "invalid signature";
  } catch (err) {
    if (err.message === "invalid signature") {
      return res.status(401).json({ message: err.message });
    }
    next(err);
  }
};

module.exports = authenticateUser;
