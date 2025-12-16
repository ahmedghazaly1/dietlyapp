const { createMockQuery } = require("./queryBuilder");

// Mock Meal model with proper chainable methods
module.exports = {
  find: jest.fn(() =>
    createMockQuery([
      {
        _id: "meal1",
        nutrition: {
          calories: 400,
          protein: 30,
          carbohydrates: 50,
          fats: 15,
        },
      },
    ])
  ),

  findById: jest.fn(() =>
    createMockQuery({
      _id: "meal-id",
      name: "Test Meal",
      nutrition: { calories: 500 },
    })
  ),

  findByIdAndUpdate: jest.fn().mockResolvedValue({}),
  findByIdAndDelete: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockResolvedValue({}),
};
