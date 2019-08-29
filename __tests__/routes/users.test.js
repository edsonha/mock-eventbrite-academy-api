const { MongoClient } = require("mongodb");
const request = require("supertest");
const app = require("../../src/app");
const mongoose = require("mongoose");
const userData = require("../../data/mockUsers.data");
require("../../src/models/user.model");
const UserModel = mongoose.model("user");

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
    it("POST / should be able to login if correct email and password is given ", async () => {
      const response = await request(app)
        .post("/users/login")
        .set("Content-Type", "application/json")
        .send({ email: "john@gmail.com", password: "abcdefgh" });
      expect(response.status).toBe(200);
      expect(response.body.name).toBe("John");
    });

    it("POST / should not be able to login if email cannot be found", async () => {
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

    it("POST / should not be able to login if wrong password is given", async () => {
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

    it("POST /users/login should be able to throw an internal server error", async () => {
      const response = await request(app)
        .post("/users/login")
        .set("Content-Type", "application/json")
        .send({
          email: { dummy: "dummy" }
        });
      expect(response.status).toBe(500);
    });

    it("GET /secure should allow access with valid JWT token and matched user", async () => {
      const loginResponse = await request(app)
        .post("/users/login")
        .set("Content-Type", "application/json")
        .send({ email: "john@gmail.com", password: "abcdefgh" });

      const jwtToken = loginResponse.body.jwtToken;

      const getResponse = await request(app)
        .get("/users/secure")
        .set("Authorization", "Bearer " + jwtToken);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.name).toBe("John");
      expect(getResponse.body.email).toBe("john@gmail.com");
    });

    it("GET /secure should reject access with no JWT token", async () => {
      const loginResponse = await request(app)
        .post("/users/login")
        .set("Content-Type", "application/json")
        .send({ email: "john@gmail.com", password: "abcdefgh" });

      const getResponse = await request(app)
        .get("/users/secure")
        .set("Authorization", "");
      expect(getResponse.status).toBe(401);
    });

    it("GET /secure should reject access with invalid JWT token", async () => {
      const loginResponse = await request(app)
        .post("/users/login")
        .set("Content-Type", "application/json")
        .send({ email: "john@gmail.com", password: "abcdefgh" });

      const jwtToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzYWxseUBnbWFpbC5jb20iLCJuYW1lIjoiU2FsbHkiLCJpYXQiOjE1NjMwMDAwMDAsImV4cCI6MzEyNjEwMDAwMH0.Misen9HeXPyxSmO - iVMxNZcC - GnCPjCz0PEu13PCEA0";

      const getResponse = await request(app)
        .get("/users/secure")
        .set("Authorization", "Bearer " + jwtToken);
      expect(getResponse.status).toBe(401);
    });
  });

  describe("registration", () => {
    it("POST / should deny registration if email is already registered", async () => {
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

    it("POST / should deny registration if email format is invalid: missing '@'", async () => {
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

    it("POST / should deny registration if email format is invalid: missing '.com'", async () => {
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

    it("POST / should deny registration if email format is invalid: root contains less than 2 letters", async () => {
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

    it("POST / should deny registration if email format is invalid: special characters present", async () => {
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

    it("POST / should deny registration if password format is invalid: lack of special character", async () => {
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

    it("POST / should deny registration if password format is invalid: lack of alphabets", async () => {
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

    it("POST / should deny registration if password format is invalid: lack of numerals", async () => {
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

    it("POST / should deny registration if password and confirm password don't match", async () => {
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

    it("POST / should deny registration if name contains special characters", async () => {
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

    it("POST / should deny registration if name contains less than 2 characters", async () => {
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

    it("POST / should deny registration if name contains more than 20 characters", async () => {
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

    it("POST / should accept registration and return name if all validations pass", async () => {
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
      expect(response.body.name).toBe("Sally");
      expect(response.status).toBe(201);
    });

    it("POST / should accept registration and store user in DB after input validation pass", async () => {
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

      const usersCollection = await db.collection("users");
      const insertedUser = await usersCollection.findOne({
        email: newUser.email
      });
      expect(response.body.name).toBe(insertedUser.name);
    });

    it("POST / should accept registration and store user with bcrypt password in DB after input validation pass and then, the user can log in", async () => {
      const newUser = {
        name: "Sally",
        email: "sally@hotmail.com",
        password: "password123!@#",
        passwordConfirmation: "password123!@#"
      };

      const signupResponse = await request(app)
        .post("/users/register")
        .set("Content-Type", "application/json")
        .send(newUser);

      const loginResponse = await request(app)
        .post("/users/login")
        .set("Content-Type", "application/json")
        .send({ email: "sally@hotmail.com", password: "password123!@#" });

      expect(signupResponse.body.name).toBe(loginResponse.body.name);
    });

    it("GET /secure should reject access with valid JWT token and unmatched user", async () => {
      const loginResponse = await request(app)
        .post("/users/login")
        .set("Content-Type", "application/json")
        .send({ email: "john@gmail.com", password: "abcdefgh" });

      const jwtToken = loginResponse.body.jwtToken;

      const mockingoose = require("mockingoose").default;
      mockingoose(UserModel).toReturn(null, "findOne");

      const getResponse = await request(app)
        .get("/users/secure")
        .set("Authorization", "Bearer " + jwtToken);
      expect(getResponse.status).toBe(401);
      expect(getResponse.body.message).toBe("invalid signature");
      mockingoose(UserModel).reset("findOne");
    });
  });
});
