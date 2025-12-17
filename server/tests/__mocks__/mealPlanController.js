// tests/__mocks__/mealPlanController.js
// Mock the actual controller to fix populateMealPlanQuery

// Import the real controller
const realController = require('../../src/controllers/mealPlanController');

// Create a mocked version
const mockedController = { ...realController };

// Override populateMealPlanQuery to work with our mocks
mockedController.populateMealPlanQuery = jest.fn((query) => {
  // If query is a promise, just return it
  if (query && typeof query.then === 'function') {
    return query;
  }
  // Otherwise return the query as-is
  return query;
});

// Export all functions
module.exports = mockedController;