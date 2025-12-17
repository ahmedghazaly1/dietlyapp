// Simple fixed mock
module.exports = {
  find: jest.fn(() => ({
    select: jest.fn().mockResolvedValue([
      {
        _id: "meal1",
        nutrition: { calories: 400 },
      },
    ]),
  })),

  findById: jest.fn().mockResolvedValue({
    _id: "meal-id",
    name: "Test Meal",
  }),
};
