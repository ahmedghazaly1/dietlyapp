// tests/__mocks__/Meal.js
// Unified Meal mock supporting both simple lookups and calorie summary queries

const { createMockQuery } = require("./mongooseQuery");

module.exports = {
  find: jest.fn().mockImplementation((query) => {
    // For recalcDayCalorieSummary: query by list of meal ids
    if (query && query._id && query._id.$in) {
      const results = query._id.$in.map((id) => ({
        _id: id,
        nutrition: {
          calories: 400,
          protein: 30,
          carbohydrates: 50,
          fats: 15,
        },
      }));
      return createMockQuery(results);
    }

    // Default: return a single generic meal
    return createMockQuery([
      {
        _id: "meal1",
        nutrition: {
          calories: 400,
          protein: 30,
          carbohydrates: 50,
          fats: 15,
        },
      },
    ]);
  }),

  findById: jest.fn().mockReturnValue(
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
