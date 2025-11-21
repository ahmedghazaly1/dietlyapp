import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";

const MealDetail = ({ mealId, meal: propMeal, onClose }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const mealIdToUse = mealId || id;

  const [meal, setMeal] = useState(propMeal);
  const [loading, setLoading] = useState(!propMeal);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!propMeal && mealIdToUse) {
      fetchMeal();
    }
  }, [mealIdToUse, propMeal]);

  const fetchMeal = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/meals/${mealIdToUse}`);

      if (response.data.success) {
        setMeal(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch meal details");
      }
    } catch (err) {
      console.error("Error fetching meal:", err);
      setError(
        err.response?.data?.message || "Failed to load meal details"
      );
    } finally {
      setLoading(false);
    }
  };

  const getMealTypeColor = (type) => {
    switch (type) {
      case "breakfast":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "lunch":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "dinner":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "snack":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "hard":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return "—";
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hour${hours > 1 ? "s" : ""} ${mins} minute${mins > 1 ? "s" : ""}` : `${hours} hour${hours > 1 ? "s" : ""}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 mb-4">{error}</p>
          <button
            onClick={() => (onClose ? onClose() : navigate(-1))}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Meal not found</p>
          <button
            onClick={() => (onClose ? onClose() : navigate(-1))}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
        >
          <span className="mr-2">←</span> Back
        </button>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Section with Image */}
        <div className="relative">
          {meal.imageUrl ? (
            <div className="w-full h-64 md:h-96 overflow-hidden bg-gray-200">
              <img
                src={meal.imageUrl}
                alt={meal.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-64 md:h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-8xl">🍽️</span>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full border ${getMealTypeColor(
                meal.mealType
              )}`}
            >
              {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
            </span>
            {meal.difficulty && (
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(
                  meal.difficulty
                )}`}
              >
                {meal.difficulty.charAt(0).toUpperCase() +
                  meal.difficulty.slice(1)}
              </span>
            )}
            {meal.averageRating > 0 && (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-white text-gray-900 flex items-center">
                <span className="text-yellow-500 mr-1">⭐</span>
                {meal.averageRating.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8">
          {/* Title and Description */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {meal.name}
            </h1>
            {meal.description && (
              <p className="text-gray-600 text-lg">{meal.description}</p>
            )}
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
            {meal.prepTime > 0 && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Prep Time</div>
                <div className="font-semibold text-gray-900">
                  {formatTime(meal.prepTime)}
                </div>
              </div>
            )}
            {meal.cookTime > 0 && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Cook Time</div>
                <div className="font-semibold text-gray-900">
                  {formatTime(meal.cookTime)}
                </div>
              </div>
            )}
            {meal.totalTime > 0 && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Time</div>
                <div className="font-semibold text-gray-900">
                  {formatTime(meal.totalTime)}
                </div>
              </div>
            )}
            {meal.servings && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Servings</div>
                <div className="font-semibold text-gray-900">
                  {meal.servings}
                </div>
              </div>
            )}
          </div>

          {/* Nutrition Section */}
          {meal.nutrition && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Nutrition (per serving)
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Calories</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {meal.nutrition.calories}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Protein</div>
                  <div className="text-2xl font-bold text-green-600">
                    {meal.nutrition.protein}g
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Carbs</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {meal.nutrition.carbohydrates}g
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Fats</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {meal.nutrition.fats}g
                  </div>
                </div>
                {meal.nutrition.fiber > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Fiber</div>
                    <div className="text-xl font-bold text-gray-700">
                      {meal.nutrition.fiber}g
                    </div>
                  </div>
                )}
                {meal.nutrition.sugar > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Sugar</div>
                    <div className="text-xl font-bold text-gray-700">
                      {meal.nutrition.sugar}g
                    </div>
                  </div>
                )}
                {meal.nutrition.sodium > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Sodium</div>
                    <div className="text-xl font-bold text-gray-700">
                      {meal.nutrition.sodium}mg
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ingredients Section */}
          {meal.ingredients && meal.ingredients.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Ingredients
              </h2>
              <ul className="space-y-2">
                {meal.ingredients.map((ingredient, index) => (
                  <li
                    key={index}
                    className="flex items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full text-sm font-semibold mr-3">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-gray-900">
                      <span className="font-medium">
                        {ingredient.amount} {ingredient.unit}
                      </span>{" "}
                      {ingredient.name}
                    </span>
                    {ingredient.allergens &&
                      ingredient.allergens.length > 0 && (
                        <span className="text-xs text-red-600 ml-2">
                          ⚠️ {ingredient.allergens.join(", ")}
                        </span>
                      )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Instructions Section */}
          {meal.instructions && meal.instructions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Instructions
              </h2>
              <ol className="space-y-4">
                {meal.instructions.map((instruction, index) => (
                  <li key={index} className="flex">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full font-semibold mr-4">
                      {index + 1}
                    </span>
                    <p className="flex-1 text-gray-700 leading-relaxed">
                      {instruction}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Dietary Tags and Allergens */}
          <div className="grid md:grid-cols-2 gap-6">
            {meal.dietaryTags && meal.dietaryTags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Dietary Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {meal.dietaryTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {meal.allergens && meal.allergens.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Allergens
                </h3>
                <div className="flex flex-wrap gap-2">
                  {meal.allergens.map((allergen, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                    >
                      ⚠️ {allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealDetail;

