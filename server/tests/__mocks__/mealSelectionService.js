// tests/__mocks__/mealSelectionService.js
module.exports = {
  selectMealsForUser: jest.fn().mockResolvedValue([
    { 
      _id: 'meal1', 
      name: 'Breakfast', 
      nutrition: { calories: 400, protein: 20, carbohydrates: 50, fats: 15 } 
    },
    { 
      _id: 'meal2', 
      name: 'Breakfast 2', 
      nutrition: { calories: 450, protein: 25, carbohydrates: 55, fats: 18 } 
    },
    { 
      _id: 'meal3', 
      name: 'Breakfast 3', 
      nutrition: { calories: 380, protein: 18, carbohydrates: 48, fats: 12 } 
    },
    { 
      _id: 'meal4', 
      name: 'Lunch', 
      nutrition: { calories: 600, protein: 30, carbohydrates: 70, fats: 25 } 
    },
    { 
      _id: 'meal5', 
      name: 'Lunch 2', 
      nutrition: { calories: 650, protein: 35, carbohydrates: 75, fats: 28 } 
    },
    { 
      _id: 'meal6', 
      name: 'Lunch 3', 
      nutrition: { calories: 550, protein: 28, carbohydrates: 65, fats: 22 } 
    },
    { 
      _id: 'meal7', 
      name: 'Dinner', 
      nutrition: { calories: 800, protein: 40, carbohydrates: 90, fats: 35 } 
    },
    { 
      _id: 'meal8', 
      name: 'Dinner 2', 
      nutrition: { calories: 850, protein: 45, carbohydrates: 95, fats: 38 } 
    },
    { 
      _id: 'meal9', 
      name: 'Dinner 3', 
      nutrition: { calories: 750, protein: 38, carbohydrates: 85, fats: 32 } 
    },
    { 
      _id: 'meal10', 
      name: 'Snack', 
      nutrition: { calories: 200, protein: 5, carbohydrates: 30, fats: 10 } 
    }
  ]),
  selectRandomMeals: jest.fn().mockImplementation((meals, count) => {
    // Return at least 3 meals for each type (as required by MIN_WEEKLY_OPTIONS)
    return meals.slice(0, Math.max(count, 3));
  })
};