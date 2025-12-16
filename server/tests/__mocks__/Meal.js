// tests/__mocks__/Meal.js
const { createMockQuery } = require('./mongooseQuery');

module.exports = {
  find: jest.fn().mockImplementation((query) => {
    // For recalcDayCalorieSummary
    if (query && query._id && query._id.$in) {
      return createMockQuery([
        { 
          _id: 'meal1', 
          nutrition: { calories: 400, protein: 30, carbohydrates: 50, fats: 15 }
        }
      ]);
    }
    return createMockQuery([]);
  }),
  
  findById: jest.fn().mockReturnValue(createMockQuery({
    _id: 'meal-id',
    name: 'Test Meal',
    nutrition: { calories: 500 }
  })),
  
  findByIdAndUpdate: jest.fn().mockResolvedValue({}),
  
  findByIdAndDelete: jest.fn().mockResolvedValue({})
};