const { MongoClient } = require("mongodb");
const request = require("supertest");
const app = require("../../src/app");
const mongoose = require("mongoose");
const userData = require("../../data/user.data");

describe("login route", () => {
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
  });

  describe("login", () => {
    it("should be able to login if correct email and password is given ", async () => {
      const response = await request(app)
        .post("/login")
        .set("Content-Type", "application/json")
        .send({ email: "john@gmail.com", password: "abcdefgh" });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("John");
    });

    it("should not be able to login if email cannot be found", async () => {
      const response = await request(app)
        .post("/login")
        .set("Content-Type", "application/json")
        .send({
          email: "peter@gmail.com",
          password: "password"
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Wrong credentials");
    });

    it("should not be able to login if wrong password is given", async () => {
      const response = await request(app)
        .post("/login")
        .set("Content-Type", "application/json")
        .send({
          email: "john@gmail.com",
          password: "secret"
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Wrong credentials");
    });

    it("GET /login should be able to throw an internal server error", async () => {
      const response = await request(app)
        .post("/login")
        .set("Content-Type", "application/json")
        .send({
          email: { dummy: "dummy" }
        });
      expect(response.status).toBe(500);
    });
  });
});
