const { MongoClient } = require("mongodb");
const request = require("supertest");
const app = require("../../src/app");
const mongoose = require("mongoose");
const moment = require("moment");
const mockEventsWithSeats = require("../../data/mockEventsWithSeats.data");
const userData = require("../../data/user.data");
require("../../src/models/user.model");
require("../../src/models/event.model");
const UserModel = mongoose.model("user");
const EventModel = mongoose.model("Event");
const { generateToken } = require("../../src/routes/users.route");

describe("user route", () => {
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
      .get("/user/registeredevents")
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
      .get("/user/registeredevents")
      .set("Authorization", "Bearer " + jwtToken);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual(johnsEvents);
  });

  it("GET / should return events in chronological order", async () => {
    const jwtToken = generateToken({
      email: "john@gmail.com",
      name: "John"
    });
    const getResponse = await request(app)
      .get("/user/registeredevents")
      .set("Authorization", "Bearer " + jwtToken);
    const getDates = getResponse.body.map(event =>
      moment.utc(event.time).toDate()
    );
    expect(getDates[1] - getDates[0]).toBeGreaterThanOrEqual(0);
    expect(getDates[2] - getDates[1]).toBeGreaterThanOrEqual(0);
  });
});
const johnsEvents = [
  {
    _id: "5d2e7e4bec0f970d68a71466",
    title: "Event 3",
    description: "Lorum Ipsum 3.",
    fullDescription: "Full Lorum Ipsum 3.",
    speaker: "Speaker 3",
    speakerBio: "Speaker Bio 3",
    time: "2019-08-15T18:00:00+08:00",
    duration: 90,
    location: "Location 3",
    availableSeats: 100,
    image: "https://via.placeholder.com/150.png?text=_"
  },
  {
    _id: "5d2e798c8c4c740d685e1d3f",
    title: "Event 1",
    description: "Lorum Ipsum 1.",
    fullDescription: "Full Lorum Ipsum 1.",
    speaker: "Speaker 1",
    speakerBio: "Speaker Bio 1",
    time: "2019-08-17T19:00:00+08:00",
    duration: 120,
    location: "Location 1",
    availableSeats: 100,
    image: "https://via.placeholder.com/150.png?text=_"
  },
  {
    _id: "5d2e7dd7ec0f970d68a71464",
    title: "Event 4",
    description: "Lorum Ipsum 4.",
    fullDescription: "Full Lorum Ipsum 4.",
    speaker: "Speaker 4",
    speakerBio: "Speaker Bio 4",
    time: "2019-08-19T19:00:00+08:00",
    duration: 90,
    location: "Location 4",
    availableSeats: 0,
    image: "https://via.placeholder.com/150.png?text=_"
  }
];
