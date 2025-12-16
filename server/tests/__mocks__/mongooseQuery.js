// tests/__mocks__/mongooseQuery.js
// Universal Mongoose query chain mock

const createMockQuery = (finalResult = null) => {
  let populateCallCount = 0;
  const methods = [
    'sort', 'skip', 'limit', 'select', 'where', 'populate', 'lean', 'exec'
  ];
  
  const mockQuery = {};
  
  // Add all query methods that return 'this' for chaining
  methods.forEach(method => {
    if (method === 'populate') {
      mockQuery[method] = jest.fn().mockImplementation(function() {
        populateCallCount++;
        return this;
      });
    } else if (method === 'exec') {
      mockQuery[method] = jest.fn().mockResolvedValue(finalResult);
    } else {
      mockQuery[method] = jest.fn().mockReturnThis();
    }
  });
  
  return mockQuery;
};

module.exports = { createMockQuery };