// tests/__mocks__/queryBuilder.js
// Helper to create mock queries that support chaining

const createMockQuery = (finalResult = null) => {
  let populateCallCount = 0;
  const maxPopulateCalls = 8; // Based on MEAL_PLAN_POPULATE_PATHS length
  
  const mockQuery = {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockImplementation(function(path) {
      populateCallCount++;
      
      // After all populate calls (8 times), return a promise
      if (populateCallCount >= maxPopulateCalls) {
        // Create a thennable object (mimics a promise)
        const thenable = {
          then: (resolve) => {
            resolve(finalResult);
            return thenable;
          },
          catch: () => thenable
        };
        return thenable;
      }
      
      // Otherwise, continue chaining
      return this;
    }),
    exec: jest.fn().mockResolvedValue(finalResult)
  };
  
  return mockQuery;
};

module.exports = { createMockQuery };