const { MongoClient } = require("mongodb");
const request = require("supertest");
const app = require("../../src/app");
const mongoose = require("mongoose");
const userData = require("../../data/user.data");

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
  });
  describe("login", () => {
    it("should be able to login if correct email and password is given ", async () => {
      const response = await request(app)
        .post("/users/login")
        .set("Content-Type", "application/json")
        .send({ email: "john@gmail.com", password: "abcdefgh" });
      expect(response.status).toBe(200);
      expect(response.body.name).toBe("John");
    });

    it("should not be able to login if email cannot be found", async () => {
      const response = await request(app)
        .post("/users/login")
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
        .post("/users/login")
        .set("Content-Type", "application/json")
        .send({
          email: "john@gmail.com",
          password: "secret"
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Wrong credentials");
    });

    it("GET /users/login should be able to throw an internal server error", async () => {
      const response = await request(app)
        .post("/users/login")
        .set("Content-Type", "application/json")
        .send({
          email: { dummy: "dummy" }
        });
      expect(response.status).toBe(500);
    });
  });

  describe("registration", () => {
    it("should send back user name if registration succeeds", async () => {
      const newUser = {
        name: "Sally",
        email: "sally@hotmail.com",
        password: "password123!@#",
        passwordConfirmation: "password123!@#"
      };

      const response = await request(app)
        .post("/users/register")
        .set("Content-Type", "application/json")
        .send(newUser);

      expect(response.body.message).toBe("Account created!");
      expect(response.body.userName).toBe("Sally");
      expect(response.status).toBe(201);
    });

    it("should deny registration if email is already registered", async () => {
      const oldUser = {
        name: "John",
        email: "john@gmail.com",
        password: "valid#123",
        passwordConfirmation: "valid#123"
      };
      const response = await request(app)
        .post("/users/register")
        .set("Content-Type", "application/json")
        .send(oldUser);

      expect(response.body.message).toBe("User already exists");
      expect(response.status).toBe(400);
    });

    it("should deny registration if email format is invalid: missing '@'", async () => {
      const newUser = {
        name: "Sally",
        email: "sallyhotmail.com",
        password: "password",
        passwordConfirmation: "password"
      };

      const response = await request(app)
        .post("/users/register")
        .set("Content-Type", "application/json")
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Cannot create account");
    });
    it("should deny registration if email format is invalid: missing '.com'", async () => {
      const newUser = {
        name: "Sally",
        email: "sally@hotmail",
        password: "password",
        passwordConfirmation: "password"
      };

      const response = await request(app)
        .post("/users/register")
        .set("Content-Type", "application/json")
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Cannot create account");
    });

    it("should deny registration if email format is invalid: root contains less than 2 letters", async () => {
      const newUser = {
        name: "Sally",
        email: "sally@hotmail.c",
        password: "password",
        passwordConfirmation: "password"
      };

      const response = await request(app)
        .post("/users/register")
        .set("Content-Type", "application/json")
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Cannot create account");
    });

    it("should deny registration if email format is invalid: special characters present", async () => {
      const newUser = {
        name: "Sally",
        email: "sally@hot#$%mail.com",
        password: "password",
        passwordConfirmation: "password"
      };

      const response = await request(app)
        .post("/users/register")
        .set("Content-Type", "application/json")
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Cannot create account");
    });

    it("should deny registration if password format is invalid: lack of special character", async () => {
      const newUser = {
        name: "Sally",
        email: "sally@hotmail.com",
        password: "password123",
        passwordConfirmation: "password"
      };

      const response = await request(app)
        .post("/users/register")
        .set("Content-Type", "application/json")
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Cannot create account");
    });

    it("should deny registration if password format is invalid: lack of alphabets", async () => {
      const newUser = {
        name: "Sally",
        email: "sally@hotmail.com",
        password: "#12345!^$@",
        passwordConfirmation: "password"
      };

      const response = await request(app)
        .post("/users/register")
        .set("Content-Type", "application/json")
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Cannot create account");
    });

    it("should deny registration if password format is invalid: lack of numerals", async () => {
      const newUser = {
        name: "Sally",
        email: "sally@hotmail.com",
        password: "@$%#asdsa",
        passwordConfirmation: "password"
      };

      const response = await request(app)
        .post("/users/register")
        .set("Content-Type", "application/json")
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Cannot create account");
    });

    it("should deny registration if password and confirm password don't match", async () => {
      const newUser = {
        name: "Sally",
        email: "sally@hotmail.com",
        password: "valid#123",
        passwordConfirmation: "valid#111"
      };

      const response = await request(app)
        .post("/users/register")
        .set("Content-Type", "application/json")
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Cannot create account");
    });

    it("should deny registration if name contains special characters", async () => {
      const newUser = {
        name: "Sally@#",
        email: "sally@hotmail.com",
        password: "valid#123",
        passwordConfirmation: "valid#123"
      };

      const response = await request(app)
        .post("/users/register")
        .set("Content-Type", "application/json")
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Cannot create account");
    });
    it("should deny registration if name contains less than 2 characters", async () => {
      const newUser = {
        name: "S",
        email: "sally@hotmail.com",
        password: "valid#123",
        passwordConfirmation: "valid#123"
      };

      const response = await request(app)
        .post("/users/register")
        .set("Content-Type", "application/json")
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Cannot create account");
    });
    it("should deny registration if name contains more than 20 characters", async () => {
      const newUser = {
        name: "MyNameIsSoLongItContainsSoManyCharacters",
        email: "sally@hotmail.com",
        password: "valid#123",
        passwordConfirmation: "valid#123"
      };

      const response = await request(app)
        .post("/users/register")
        .set("Content-Type", "application/json")
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Cannot create account");
    });
  });
});
