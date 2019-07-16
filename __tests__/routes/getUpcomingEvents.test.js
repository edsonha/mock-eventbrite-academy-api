const app = require("../../src/app");
const request = require("supertest");
const mockEventsWithSeats = require("../../data/mockEventsWithSeats.mockdata");
const moment = require("moment");

describe("getUpComingEvents route", () => {
  it("should return 200 on success", async () => {
    const response = await request(app).get("/upcomingevents");
    expect(response.status).toBe(200);
  });

  it("GET / should return all the upcoming events", async () => {
    const response = await request(app).get("/upcomingevents");
    expect(response.body).toMatchObject(mockEventsWithSeats);
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
});
