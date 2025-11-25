/**
 * Meal Selection Service
 * Handles meal selection logic based on user preferences
 * Single Responsibility: Only handles meal selection
 */

const Meal = require("../models/Meal");

/**
 * Build query for meal selection based on user preferences
 * Uses functional composition (declarative)
 * @param {Object} user - User object
 * @param {string} mealType - Type of meal
 * @param {number} targetCalories - Target calories (optional)
 * @returns {Object} MongoDB query object
 */
const buildMealQuery = (user, mealType, targetCalories = null) => {
  // Start with base query (imperative)
  const query = {
    mealType,
    isActive: true,
  };

  // Apply dietary preferences (declarative: functional approach)
  if (user.dietaryPreferences && user.dietaryPreferences.length > 0) {
    query.dietaryTags = { $in: user.dietaryPreferences };
  }

  // Exclude allergens (declarative: functional filter)
  if (user.allergies && user.allergies.length > 0) {
    query.allergens = { $nin: user.allergies };
  }

  // Optional calorie filtering - make it more flexible
  if (targetCalories) {
    const calorieRange = targetCalories * 0.35;
    const minCalories = Math.max(0, targetCalories - calorieRange);
    const maxCalories = targetCalories + calorieRange;
    query["nutrition.calories"] = {
      $gte: minCalories,
      $lte: maxCalories,
    };
    console.log(`  📊 Calorie filter for ${mealType}: ${minCalories.toFixed(0)} - ${maxCalories.toFixed(0)} calories`);
  }

  return query;
};

/**
 * Select meals for user based on preferences
 * Combines imperative and declarative approaches with progressive fallback
 * @param {Object} user - User object
 * @param {string} mealType - Type of meal
 * @param {number} targetCalories - Target calories (optional)
 * @returns {Promise<Array>} Array of available meals
 */
const selectMealsForUser = async (user, mealType, targetCalories = null) => {
  console.log(`\n🔍 Selecting ${mealType} meals...`);
  
  // Try 1: Full preferences with calorie constraints
  let query = buildMealQuery(user, mealType, targetCalories);
  console.log(`  Query 1 (full preferences + calories):`, JSON.stringify(query, null, 2));
  let availableMeals = await Meal.find(query);
  console.log(`  Found ${availableMeals.length} meals`);

  // Try 2: Full preferences without calorie constraints
  if (availableMeals.length === 0 && targetCalories) {
    console.log(`  ⚠️  No meals with calorie constraints, trying without...`);
    query = buildMealQuery(user, mealType, null);
    console.log(`  Query 2 (full preferences, no calories):`, JSON.stringify(query, null, 2));
    availableMeals = await Meal.find(query);
    console.log(`  Found ${availableMeals.length} meals`);
  }

  // Try 3: Only respect allergies, ignore dietary preferences
  if (availableMeals.length === 0) {
    console.log(`  ⚠️  No meals with dietary preferences, trying without preferences...`);
    const fallbackQuery = { mealType, isActive: true };
    if (user.allergies && user.allergies.length > 0) {
      fallbackQuery.allergens = { $nin: user.allergies };
    }
    console.log(`  Query 3 (only allergies):`, JSON.stringify(fallbackQuery, null, 2));
    availableMeals = await Meal.find(fallbackQuery);
    console.log(`  Found ${availableMeals.length} meals`);
  }

  // Try 4: Ignore allergies too if still no meals (for critical meal types)
  if (availableMeals.length === 0 && (mealType === "breakfast" || mealType === "lunch" || mealType === "dinner")) {
    console.log(`  ⚠️  Critical meal type - trying without allergies...`);
    availableMeals = await Meal.find({ mealType, isActive: true });
    console.log(`  Found ${availableMeals.length} meals (ignoring allergies)`);
  }

  // Try 5: Last resort - any active meal of this type
  if (availableMeals.length === 0) {
    console.log(`  ⚠️  Last resort: any active ${mealType} meal`);
    availableMeals = await Meal.find({ mealType, isActive: true });
    console.log(`  Found ${availableMeals.length} meals`);
  }

  // Final check: if still no meals, check if ANY meals exist for this type
  if (availableMeals.length === 0) {
    const totalMealsOfType = await Meal.countDocuments({ mealType, isActive: true });
    console.log(`  ❌ No meals found! Total ${mealType} meals in DB: ${totalMealsOfType}`);
  }

  return availableMeals;
};

/**
 * Randomly select a meal from array
 * Imperative approach for randomness
 * @param {Array} meals - Array of meals
 * @returns {Object|null} Selected meal or null
 */
const selectRandomMeal = (meals) => {
  if (!meals || meals.length === 0) {
    return null;
  }

  // Imperative: random selection
  const randomIndex = Math.floor(Math.random() * meals.length);
  return meals[randomIndex];
};

/**
 * Select multiple random meals (for snacks)
 * Uses functional approach (declarative)
 * @param {Array} meals - Array of meals
 * @param {number} count - Number of meals to select
 * @returns {Array} Array of selected meals
 */
const selectRandomMeals = (meals, count) => {
  if (!meals || meals.length === 0 || count <= 0) {
    return [];
  }

  // Declarative: create array and map
  const selected = [];
  const maxCount = Math.min(count, meals.length);

  // Imperative: loop to select unique meals
  const usedIndices = new Set();
  while (selected.length < maxCount) {
    const randomIndex = Math.floor(Math.random() * meals.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      selected.push(meals[randomIndex]);
    }
  }

  return selected;
};

module.exports = {
  buildMealQuery,
  selectMealsForUser,
  selectRandomMeal,
  selectRandomMeals,
};

