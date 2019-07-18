const { MongoClient } = require("mongodb");
const request = require("supertest");
const app = require("../../src/app");
const mongoose = require("mongoose");
const mockEventsWithSeats = require("../../data/mockEventsWithSeats.data");

describe("getEventDescription route", () => {
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
    await insertMockEventsToTestDB();
  });

  it("GET /upcomingevents/:id should return the event details if event id exists", async () => {
    const response = await request(app).get(
      `/upcomingevents/5d2e7e1aec0f970d68a71465`
    );
    const expectedResponse = mockEventsWithSeats[1];
    expectedResponse._id = String(expectedResponse._id);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(expectedResponse);
  });

  it("GET /upcomingevents/:id should return 404 error if event id does not exist", async () => {
    const response = await request(app).get(
      "/upcomingevents/5d2e7e1aec0f970d68a71469"
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("The event does not exist");
  });

  it("GET /upcomingevents/:id should return 404 error if event id is not valid", async () => {
    const response = await request(app).get("/upcomingevents/randomID");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Event ID not valid");
  });
});
