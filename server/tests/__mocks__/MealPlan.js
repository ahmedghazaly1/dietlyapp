// tests/__mocks__/MealPlan.js
// Unified MealPlan mock that supports both simple and advanced tests

const mongoose = require("mongoose");
const { createMockQuery } = require("./mongooseQuery");

// Base mock data
const mockMealPlan = {
  _id: new mongoose.Types.ObjectId(),
  user: new mongoose.Types.ObjectId(),
  name: "Test Meal Plan",
  duration: 7,
  targetCalories: 2000,
  status: "active",
  meals: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMealPlans = [mockMealPlan];

// Mock the MealPlan model (default export) with chainable query methods
const MealPlan = {
  // Static methods that return chainable queries
  find: jest.fn(() => createMockQuery(mockMealPlans)),
  findOne: jest.fn(() => createMockQuery(mockMealPlan)),
  findById: jest.fn(() => createMockQuery(mockMealPlan)),
  findByIdAndUpdate: jest.fn(() => createMockQuery(mockMealPlan)),
  findByIdAndDelete: jest.fn(() => createMockQuery(null)),

  // Direct / promise-returning methods
  countDocuments: jest.fn().mockResolvedValue(1),
  create: jest.fn().mockResolvedValue(mockMealPlan),
};

// Support both `require(".../MealPlan")` and `{ MealPlan }` import styles
module.exports = MealPlan;
module.exports.MealPlan = MealPlan;
