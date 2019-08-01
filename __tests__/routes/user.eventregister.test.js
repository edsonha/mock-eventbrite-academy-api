const app = require("../../src/app");
const request = require("supertest");
const { MongoClient } = require("mongodb");
const mockEventsWithSeats = require("../../data/mockEventsWithSeats.data");
const userData = require("../../data/mockUsers.data.js");
const mongoose = require("mongoose");

describe("Register/deregister", () => {
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

  const getJwt = async () => {
    const loginResponse = await request(app)
      .post("/users/login")
      .set("Content-Type", "application/json")
      .send({ email: "john@gmail.com", password: "abcdefgh" });
    return loginResponse.body.jwtToken;
  };

  describe("User Registration", () => {
    it("POST /:eventId/user/registerevent should add user to the list of attendees", async () => {
      const jwtToken = await getJwt();

      const response = await request(app)
        .post("/upcomingevents/5d2e798c8c4c740d685e1d3f/user/registerevent")
        .set("Authorization", "Bearer " + jwtToken);
      expect(response.status).toBe(200);

      const EventCollection = await db.collection("events");
      const updatedEvent = await EventCollection.findOne({ title: "Event 1" });
      expect(updatedEvent.attendees[updatedEvent.attendees.length - 1]).toEqual(
        {
          _id: "5d2e85951b62fc093cc3318b",
          name: "John",
          email: "john@gmail.com"
        }
      );
    });

    it("POST /:eventId/user/registerevent should return error when event id not valid", async () => {
      const jwtToken = await getJwt();

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

    it("POST /:eventId/user/registerevent should decrement available seats for succesful registration", async () => {
      const jwtToken = await getJwt();

      const response = await request(app)
        .post("/upcomingevents/5d2e798c8c4c740d685e1d3f/user/registerevent")
        .set("Authorization", "Bearer " + jwtToken);
      expect(response.status).toBe(200);

      const EventCollection = await db.collection("events");
      const updatedEvent = await EventCollection.findOne({ title: "Event 1" });
      expect(updatedEvent.availableSeats).toBe(99);
    });

    it("POST /:eventId/user/registerevent should return 422 if there are no available seats", async () => {
      const jwtToken = await getJwt();

      const response = await request(app)
        .post("/upcomingevents/5d2e7e1aec0f970d68a71465/user/registerevent")
        .set("Authorization", "Bearer " + jwtToken);
      expect(response.status).toBe(422);

      const EventCollection = await db.collection("events");
      const updatedEvent = await EventCollection.findOne({ title: "Event 2" });
      expect(updatedEvent.availableSeats).toBe(0);
    });

    it("POST /:eventId/user/registerevent should return 422 if registered user try to register again", async () => {
      const jwtToken = await getJwt();

      const response = await request(app)
        .post("/upcomingevents/5d2e7e4bec0f970d68a71466/user/registerevent")
        .set("Authorization", "Bearer " + jwtToken);
      expect(response.status).toBe(422);
    });
  });

  describe("User Deregistration", () => {
    it("PUT /:eventId/user/deregisterevent should deregister user from an event", async () => {
      const jwtToken = await getJwt();
      const response = await request(app)
        .put("/upcomingevents/5d2e798c8c4c740d685e1d3f/user/deregisterevent")
        .set("Authorization", "Bearer " + jwtToken);
      expect(response.status).toBe(200);

      const EventCollection = await db.collection("events");
      const updatedEvent = await EventCollection.findOne({ title: "Event 1" });

      expect(
        updatedEvent.attendees.includes({
          _id: "5d2e85951b62fc093cc3318b",
          name: "John",
          email: "john@gmail.com"
        })
      ).toBeFalsy();
      expect(updatedEvent.availableSeats).toBe(101);
    });
  });
});
