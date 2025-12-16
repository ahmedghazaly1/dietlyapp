// mocks__/MealPlan.js
const mongoose = require('mongoose');

// Create chainable mock
const createMockQuery = (returnValue) => {
  const mockQuery = {
    // Chainable methods
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    equals: jest.fn().mockReturnThis(),
    
    // Terminal methods
    exec: jest.fn().mockResolvedValue(returnValue),
    lean: jest.fn().mockResolvedValue(returnValue),
    then: function(resolve, reject) {
      return this.exec().then(resolve, reject);
    }
  };
  return mockQuery;
};

// Mock data
const mockMealPlan = {
  _id: new mongoose.Types.ObjectId(),
  user: new mongoose.Types.ObjectId(),
  name: 'Test Meal Plan',
  duration: 7,
  targetCalories: 2000,
  status: 'active',
  meals: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockMealPlans = [mockMealPlan];

// Mock the MealPlan model
const MealPlan = {
  // Static methods that return chainable queries
  find: jest.fn(() => createMockQuery(mockMealPlans)),
  findOne: jest.fn(() => createMockQuery(mockMealPlan)),
  findById: jest.fn(() => createMockQuery(mockMealPlan)),
  findByIdAndUpdate: jest.fn(() => createMockQuery(mockMealPlan)),
  findByIdAndDelete: jest.fn(() => createMockQuery(null)),
  
  // Direct methods
  countDocuments: jest.fn().mockResolvedValue(1),
  create: jest.fn().mockResolvedValue(mockMealPlan),
};

module.exports = { MealPlan };