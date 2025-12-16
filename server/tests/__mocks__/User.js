module.exports = {
  findById: jest.fn().mockResolvedValue({
    _id: "user123",
    dailyCalorieTarget: 2000,
    dietaryPreferences: [],
    allergies: [],
  }),
};
