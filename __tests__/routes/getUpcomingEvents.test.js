const app = require("../../app");
const request = require("supertest");
const mockEventsWithSeats = require("../../data/mockEventsWithSeats.mockdata");

describe("getUpComingEvents route", () => {
  it("should return 200 on success", async () => {
    const response = await request(app).get("/upcomingevents");
    expect(response.status).toBe(200);
  });

  xit("GET / should return all the upcoming events", async () => {
    const response = await request(app).get("/upcomingevents");
    expect(response.body).toMatchObject(mockEventsWithSeats);
  });
});
