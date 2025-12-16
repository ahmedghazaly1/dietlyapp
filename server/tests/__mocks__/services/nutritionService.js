module.exports = {
  calculateTargetNutrition: jest.fn().mockReturnValue({
    dailyCalories: 2000,
    protein: 150,
    carbohydrates: 250,
    fats: 67,
  }),
  calculateTotalNutrition: jest.fn().mockReturnValue({
    calories: 1800,
    protein: 120,
    carbohydrates: 200,
    fats: 60,
  }),
  calculateAverageNutrition: jest.fn().mockReturnValue({
    calories: 1900,
    protein: 135,
    carbohydrates: 225,
    fats: 63,
  }),
};
