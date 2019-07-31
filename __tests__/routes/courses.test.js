const { MongoClient } = require("mongodb");
const request = require("supertest");
const app = require("../../src/app");
const mongoose = require("mongoose");
require("../../src/models/courses.model");
const CourseModel = mongoose.model("Course");
const mockCourses = require("../../data/mockCourses.data");

describe("courses route", () => {
  let connection;
  let db;

  beforeAll(async () => {
    dbURIArray = global.__MONGO_URI__.split("/");
    dbName = dbURIArray[dbURIArray.length - 1];
    connection = await MongoClient.connect(global.__MONGO_URI__, {
      useNewUrlParser: true
    });
    db = await connection.db(dbName);
    console.log(`Connected to DB: ${dbName}.`);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await connection.close();
    await db.close();
  });

  beforeEach(async () => {
    await db.dropDatabase();
  });

  it("GET / should return all courses offered", async () => {
    await CourseModel.insertMany(mockCourses);
    const response = await request(app).get("/courses");
    expect(response.status).toBe(200);

    const mockCoursesWithStringID = [];
    for (let i = 0; i < mockCourses.length; i++) {
      mockCoursesWithStringID.push(JSON.parse(JSON.stringify(mockCourses[i])));
    }
    mockCoursesWithStringID.map(course => {
      course._id = String(course._id);
      return course;
    });

    expect(response.body).toEqual(mockCoursesWithStringID);
  });

  it("GET / should return empty array if no courses offered", async () => {
    const response = await request(app).get("/courses");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
