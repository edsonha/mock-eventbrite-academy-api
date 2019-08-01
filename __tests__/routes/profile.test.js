const { MongoClient } = require("mongodb");
const request = require("supertest");
const app = require("../../src/app");
const mongoose = require("mongoose");
const moment = require("moment");
const mockEventsWithSeats = require("../../data/mockEventsWithSeats.data");
const userData = require("../../data/mockUsers.data");
require("../../src/models/user.model");
require("../../src/models/event.model");
const { generateToken } = require("../../src/routes/users.route");
const mockJohnEvents = require("../../data/mockJohnEvents.data");

describe("Profile route", () => {
  let connection;
  let db;

  beforeAll(async () => {
    const dbParams = global.__MONGO_URI__.split("/");
    const dbName = dbParams[dbParams.length - 1];
    connection = await MongoClient.connect(global.__MONGO_URI__, {
      useNewUrlParser: true
    });
    db = await connection.db(dbName);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await connection.close();
    await db.close();
  });

  beforeEach(async () => {
    await db.dropDatabase();
    const usersCollection = await db.collection("users");
    await usersCollection.insertMany(userData);
    const eventsCollection = await db.collection("events");
    await eventsCollection.insertMany(mockEventsWithSeats);
  });

  it("GET /registeredevents should return empty array if user is not registered for any events past or present", async () => {
    const jwtToken = generateToken({
      email: "michael@gmail.com",
      name: "Michael"
    });
    const getResponse = await request(app)
      .get("/profile/registeredevents")
      .set("Authorization", "Bearer " + jwtToken);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual([]);
  });

  it("GET /registeredevents should return array of events if user is registered for any events past or present", async () => {
    const jwtToken = generateToken({
      email: "john@gmail.com",
      name: "John"
    });
    const getResponse = await request(app)
      .get("/profile/registeredevents")
      .set("Authorization", "Bearer " + jwtToken);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual(mockJohnEvents);
  });

  it("GET / should return events in chronological order", async () => {
    const jwtToken = generateToken({
      email: "john@gmail.com",
      name: "John"
    });
    const getResponse = await request(app)
      .get("/profile/registeredevents")
      .set("Authorization", "Bearer " + jwtToken);
    const getDates = getResponse.body.map(event =>
      moment.utc(event.time).toDate()
    );
    expect(getDates[1] - getDates[0]).toBeGreaterThanOrEqual(0);
  });
});
