// tests/__mocks__/mongooseQuery.js
// Universal Mongoose query chain mock (shared by multiple model mocks)

const createMockQuery = (finalResult = null) => {
  let populateCallCount = 0;
  const methods = [
    "sort",
    "skip",
    "limit",
    "select",
    "where",
    "populate",
    "lean",
    "exec",
  ];

  const mockQuery = {};

  // Add all query methods that return 'this' for chaining
  methods.forEach((method) => {
    if (method === "populate") {
      mockQuery[method] = jest.fn().mockImplementation(function () {
        populateCallCount++;
        return this;
      });
    } else if (method === "exec") {
      mockQuery[method] = jest.fn().mockResolvedValue(finalResult);
    } else {
      mockQuery[method] = jest.fn().mockReturnThis();
    }
  });

  // Make the mock query awaitable (so `await query` works like Mongoose)
  mockQuery.then = function (resolve, reject) {
    return this.exec().then(resolve, reject);
  };

  return mockQuery;
};

module.exports = { createMockQuery };