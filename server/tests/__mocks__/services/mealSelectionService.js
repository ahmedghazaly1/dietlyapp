module.exports = {
  selectMealsForUser: jest.fn().mockResolvedValue([
    { _id: "meal1", name: "Oatmeal", nutrition: { calories: 300 } },
    { _id: "meal2", name: "Salad", nutrition: { calories: 400 } },
  ]),
  selectRandomMeals: jest
    .fn()
    .mockImplementation((meals, count) =>
      meals.slice(0, Math.min(count, meals.length))
    ),
};
