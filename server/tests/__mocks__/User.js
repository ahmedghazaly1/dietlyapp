// tests/__mocks__/User.js
// Default user mock with sane values, but still overridable in individual tests

module.exports = {
  findById: jest.fn().mockResolvedValue({
    _id: "user123",
    dailyCalorieTarget: 2000,
    dietaryPreferences: [],
    allergies: [],
  }),
};
