const { MongoClient } = require("mongodb");
const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
require("../../db");

describe("app", () => {
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
  });

  it("should create a hello world app", async () => {
    const response = await request(app).get("/");
    expect(response.body).toBe("Hello World");
  });
});
