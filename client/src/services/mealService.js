// src/services/mealService.js
import api from "./api";

export const mealService = {
  // Get all meals (with optional filters)
  // @param {Object} params - Query parameters (mealType, difficulty, dietaryTags, minCalories, maxCalories, search, page, limit)
  getMeals: (params) => api.get("/meals", { params }),

  // Get single meal by ID
  // @param {String} mealId - Meal ID
  getMeal: (mealId) => api.get(`/meals/${mealId}`),

  // Search meals by name/description
  // @param {Object} params - Query parameters (search, mealType, etc.)
  searchMeals: (params) => api.get("/meals/search", { params }),

  // Get meals by type
  // @param {String} mealType - Meal type (breakfast, lunch, dinner, snack)
  // @param {Object} params - Additional query parameters
  getMealsByType: (mealType, params) =>
    api.get(`/meals/type/${mealType}`, { params }),

  // Get meals by dietary preference
  // @param {String} dietType - Dietary type (vegetarian, vegan, keto, etc.)
  // @param {Object} params - Additional query parameters
  getMealsByDiet: (dietType, params) =>
    api.get(`/meals/diet/${dietType}`, { params }),

  // Get filtered meals for user preferences (requires authentication)
  // @param {Object} params - Query parameters (mealType, minCalories, maxCalories)
  getFilteredMeals: (params) => api.get("/meals/filtered", { params }),

  // Get meal suggestions for user (requires authentication)
  // @param {Object} params - Query parameters
  getMealSuggestions: (params) => api.get("/meals/suggestions", { params }),

  // Create new meal (Admin only)
  // @param {Object} mealData - Meal data
  createMeal: (mealData) => api.post("/meals", mealData),

  // Update meal (Admin only)
  // @param {String} mealId - Meal ID
  // @param {Object} mealData - Updated meal data
  updateMeal: (mealId, mealData) => api.put(`/meals/${mealId}`, mealData),

  // Delete meal (Admin only)
  // @param {String} mealId - Meal ID
  deleteMeal: (mealId) => api.delete(`/meals/${mealId}`),
};

