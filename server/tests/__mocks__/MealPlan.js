// Mock MealPlan model with chainable methods
const createMockQuery = (result) => ({
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(result),
  lean: jest.fn().mockResolvedValue(result),
});

module.exports = {
  find: jest.fn(() => createMockQuery([])),
  findOne: jest.fn(() => createMockQuery(null)),
  findById: jest.fn(() => createMockQuery(null)),
  countDocuments: jest.fn().mockResolvedValue(0),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
};
