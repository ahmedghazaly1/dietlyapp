// Helper to create chainable Mongoose queries
const createMockQuery = (result) => {
  const query = {
    // Chainable methods
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    equals: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),

    // Terminal methods
    exec: jest.fn().mockResolvedValue(result),
    then: function (resolve, reject) {
      return this.exec().then(resolve, reject);
    },
  };

  return query;
};

module.exports = { createMockQuery };
