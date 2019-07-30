const app = require("../../src/app");
const request = require("supertest");
const { MongoClient } = require("mongodb");
const mockEventsWithSeats = require("../../data/mockEventsWithSeats.data");
const userData = require("../../data/user.data.js");
const mongoose = require("mongoose");

describe("getUpComingEvents route", () => {
  let connection;
  let db;

  const getMockEvents = () => {
    return mockEventsWithSeats.map(event => {
      return { ...event };
    });
  };

  const insertMockEventsToTestDB = async () => {
    const EventCollection = await db.collection("events");
    const mockData = getMockEvents();
    await EventCollection.insertMany(mockData);
    const UserCollection = await db.collection("users");
    await UserCollection.insertMany(userData);
  };

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
    insertMockEventsToTestDB();
  });

  it("POST /:eventId/user/registerevent should add user to the list of attendees", async () => {
    const loginResponse = await request(app)
      .post("/users/login")
      .set("Content-Type", "application/json")
      .send({ email: "john@gmail.com", password: "abcdefgh" });

    const jwtToken = loginResponse.body.jwtToken;

    const response = await request(app)
      .post("/upcomingevents/5d2e798c8c4c740d685e1d3f/user/registerevent")
      .set("Authorization", "Bearer " + jwtToken);

    expect(response.status).toBe(200);
    const EventCollection = await db.collection("events");
    const updatedEvent = await EventCollection.findOne({ title: "Event 1" });
    expect(updatedEvent.attendees[updatedEvent.attendees.length - 1]).toEqual({
      _id: "5d2e85951b62fc093cc3318b",
      name: "John",
      email: "john@gmail.com"
    });
  });

  it("POST /:eventId/user/registerevent should return error when event id not valid", async () => {
    const loginResponse = await request(app)
      .post("/users/login")
      .set("Content-Type", "application/json")
      .send({ email: "john@gmail.com", password: "abcdefgh" });

    const jwtToken = loginResponse.body.jwtToken;

    const response = await request(app)
      .post("/upcomingevents/wrongID/user/registerevent")
      .set("Authorization", "Bearer " + jwtToken);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Event ID not valid");
  });

  it("POST /:eventId/user/registerevent should return error when event id does not exist", async () => {
    const response = await request(app).post(
      "/upcomingevents/5d2e7e1aec0f970d68a71499/user/registerevent"
    );
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("The event does not exist");
  });
});
