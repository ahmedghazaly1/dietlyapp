// Example integration test - you can expand this
const request = require("supertest");
const app = require("../../src/app");

jest.mock("../../src/models/MealPlan");
jest.mock("../../src/models/User");

describe("Meal Plan Routes Integration", () => {
  test("GET /api/v1/meal-plans should return 401 without auth", async () => {
    const response = await request(app).get("/api/v1/meal-plans").expect(401);
  });
});
