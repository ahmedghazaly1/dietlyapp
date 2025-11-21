import React from "react";
import { useNavigate } from "react-router-dom";

const MealCard = ({ meal, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(meal);
    } else {
      navigate(`/meals/${meal._id}`);
    }
  };

  const getMealTypeColor = (type) => {
    switch (type) {
      case "breakfast":
        return "bg-yellow-100 text-yellow-800";
      case "lunch":
        return "bg-blue-100 text-blue-800";
      case "dinner":
        return "bg-purple-100 text-purple-800";
      case "snack":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "hard":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return "—";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      {/* Meal Image */}
      {meal.imageUrl ? (
        <div className="w-full h-48 overflow-hidden bg-gray-200">
          <img
            src={meal.imageUrl}
            alt={meal.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-4xl">🍽️</span>
        </div>
      )}

      {/* Meal Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
            {meal.name}
          </h3>
          {meal.averageRating > 0 && (
            <div className="flex items-center ml-2">
              <span className="text-yellow-500">⭐</span>
              <span className="text-sm font-medium text-gray-700 ml-1">
                {meal.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Meal Type Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getMealTypeColor(
              meal.mealType
            )}`}
          >
            {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
          </span>
          {meal.difficulty && (
            <span
              className={`text-xs font-medium ${getDifficultyColor(
                meal.difficulty
              )}`}
            >
              {meal.difficulty.charAt(0).toUpperCase() + meal.difficulty.slice(1)}
            </span>
          )}
        </div>

        {/* Description */}
        {meal.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {meal.description}
          </p>
        )}

        {/* Nutrition Info */}
        {meal.nutrition && (
          <div className="grid grid-cols-4 gap-2 mb-3 pt-3 border-t border-gray-100">
            <div className="text-center">
              <div className="text-xs text-gray-500">Calories</div>
              <div className="text-sm font-semibold text-gray-900">
                {meal.nutrition.calories}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Protein</div>
              <div className="text-sm font-semibold text-gray-900">
                {meal.nutrition.protein}g
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Carbs</div>
              <div className="text-sm font-semibold text-gray-900">
                {meal.nutrition.carbohydrates}g
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Fats</div>
              <div className="text-sm font-semibold text-gray-900">
                {meal.nutrition.fats}g
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {meal.totalTime > 0 && (
              <span className="flex items-center">
                <span className="mr-1">⏱️</span>
                {formatTime(meal.totalTime)}
              </span>
            )}
            {meal.servings && (
              <span className="flex items-center">
                <span className="mr-1">👥</span>
                {meal.servings} serving{meal.servings !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Dietary Tags */}
        {meal.dietaryTags && meal.dietaryTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-gray-100">
            {meal.dietaryTags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
              >
                {tag}
              </span>
            ))}
            {meal.dietaryTags.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-gray-500">
                +{meal.dietaryTags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MealCard;

