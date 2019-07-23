const express = require("express");
const mongoose = require("mongoose");
const usersRouter = express.Router();
require("../models/user.model");
const UserModel = mongoose.model("user");
const Joi = require("@hapi/joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secretKey = require("../utils/key");
const authenticateUser = require("../middleware/authenticate-user");

validateRegistration = user => {
  const schema = {
    name: Joi.string()
      .required()
      .regex(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/)
      .min(2)
      .max(20),
    email: Joi.string()
      .email({ minDomainSegments: 2 })
      .required(),
    password: Joi.string()
      .required()
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,30}$/
      ),
    // .min(8)
    // .max(30)
    passwordConfirmation: Joi.string()
  };
  return Joi.validate(user, schema);
};

const generateToken = foundUser =>
  jwt.sign(
    { sub: foundUser.email, user: foundUser.name, iat: new Date().getTime() },
    secretKey,
    { expiresIn: "1h" }
  );

usersRouter.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirmation } = req.body;

    const validation = validateRegistration(req.body);
    if (validation.error) {
      return res.status(400).json({ message: "Cannot create account" });
    }

    if (password !== passwordConfirmation) {
      return res.status(400).json({ message: "Cannot create account" });
    }
    const foundUser = await UserModel.findOne({ email });
    if (foundUser) {
      res.status(400).json({ message: "User already exists" });
    } else {
      const saltround = 10;
      const digest = await bcrypt.hash(password, saltround);
      const userWithDigest = { name, email, password: digest };
      await UserModel.create(userWithDigest);
      const jwtToken = generateToken(userWithDigest);

      res
        .status(201)
        .json({ message: "Account created!", name: name, jwtToken: jwtToken });
    }
  } catch (err) {
    next({ err, message: "Something went wrong, please try again" });
  }
});

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const foundUser = await UserModel.findOne({ email });

    if (!foundUser) {
      return res.status(401).json({ message: "Wrong credentials" });
    }

    const isUser = await bcrypt.compare(password, foundUser.password);

    if (isUser) {
      const jwtToken = generateToken(foundUser);
      res.status(200).json({
        name: foundUser.name,
        registeredEvents: foundUser.registeredEvents,
        jwtToken: jwtToken
      });
    } else {
      res.status(401).json({ message: "Wrong credentials" });
    }
  } catch (err) {
    next(err);
  }
});

usersRouter.get("/secure", authenticateUser, (req, res, next) => {
  res.status(200).json({ name: req.user.name, email: req.user.email });
});

module.exports = usersRouter;
