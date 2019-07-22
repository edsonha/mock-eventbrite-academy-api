const app = require("../../src/app");
const request = require("supertest");
const { MongoClient } = require("mongodb");
const mockEventsWithSeats = require("../../data/mockEventsWithSeats.data");
const userData = require("../../data/user.data.js");
const moment = require("moment");
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

  it("should return 200 on success", async () => {
    const response = await request(app).get("/upcomingevents");
    expect(response.status).toBe(200);
  });

  it("GET / should return all the upcoming events", async () => {
    const response = await request(app).get("/upcomingevents");
    const mockEventsWithSeatsClone = [];
    for (let event of mockEventsWithSeats) {
      mockEventsWithSeatsClone.push(JSON.parse(JSON.stringify(event)));
    }
    const chronologicalMockEvents = mockEventsWithSeatsClone
      // .slice(0)
      .sort((a, b) => {
        return moment(a.time) - moment(b.time);
      })
      .map(event => {
        event._id = String(event._id);
        return event;
      });
    expect(response.body).toMatchObject(chronologicalMockEvents);
  });

  it("GET / should return events in chronological order", async () => {
    const response = await request(app).get("/upcomingevents");
    const getDates = response.body.map(event =>
      moment.utc(event.time).toDate()
    );
    expect(getDates[1] - getDates[0]).toBeGreaterThanOrEqual(0);
    expect(getDates[2] - getDates[1]).toBeGreaterThanOrEqual(0);
    expect(getDates[3] - getDates[2]).toBeGreaterThanOrEqual(0);
  });

  it("PUT /:eventId/user/:userID should add user to the list of attendees", async () => {
    const response = await request(app).put(
      "/upcomingevents/5d2e798c8c4c740d685e1d3f/user/5d2e85951b62fc093cc3318b"
    );

    expect(response.status).toBe(200);

    const EventCollection = await db.collection("events");
    const updatedEvent = await EventCollection.findOne({ title: "Event 1" });
    expect(updatedEvent.attendees[updatedEvent.attendees.length - 1]).toBe(
      "5d2e85951b62fc093cc3318b"
    );
  });

  it("PUT /:eventId/user/:userID should return error when event id not valid", async () => {
    const response = await request(app).put(
      "/upcomingevents/wrongID/user/5d2e85951b62fc093cc3318b"
    );
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Event ID not valid");
  });

  it("PUT /:eventId/user/:userID should return error when event id does not exist", async () => {
    const response = await request(app).put(
      "/upcomingevents/5d2e7e1aec0f970d68a71499/user/5d2e85951b62fc093cc3318b"
    );
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("The event does not exist");
  });

  it("PUT /:eventId/user/:userID should return error when user id does not exist", async () => {
    const response = await request(app).put(
      "/upcomingevents/5d2e798c8c4c740d685e1d3f/user/5d2e85951b62fc093cc3319b"
    );
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User does not exist");
  });
});
