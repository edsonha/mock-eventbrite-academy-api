const express = require("express");
const mongoose = require("mongoose");
const coursesRouter = express.Router();
require("../models/courses.model");
const CourseModel = mongoose.model("Course");

coursesRouter.get("/", async (req, res, next) => {
  try {
    const findCourses = await CourseModel.find();
    res.status(200).json(
      findCourses.map(course => {
        return {
          _id: course._id,
          title: course.title,
          description: course.description,
          objectiveHeader: course.objectiveHeader,
          objectives: course.objectives,
          level: course.level
        };
      })
    );
  } catch (err) {
    next(err);
  }
});

module.exports = coursesRouter;
