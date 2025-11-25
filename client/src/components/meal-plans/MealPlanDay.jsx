import React from "react";
import { useNavigate } from "react-router-dom";
import MealCard from "../meals/MealCard";

const MealPlanDay = ({ day, onMealConsumed, showDate = true, allowConsume = true }) => {
  const navigate = useNavigate();

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayDate = new Date(d);
    dayDate.setHours(0, 0, 0, 0);

    const isToday = dayDate.getTime() === today.getTime();
    const isPast = dayDate < today;

    return {
      dateString: d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
      isToday,
      isPast,
    };
  };

  const dateInfo = showDate && day.date ? formatDate(day.date) : null;

  const handleMealClick = (meal) => {
    navigate(`/meals/${meal._id}`);
  };

  const handleConsumeToggle = (mealType, snackIndex = null) => {
    if (onMealConsumed) {
      onMealConsumed(day.date, mealType, snackIndex);
    }
  };

  const calculateDayNutrition = () => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fats = 0;

    const addNutrition = (mealEntry) => {
      if (mealEntry?.meal?.nutrition) {
        const servings = mealEntry.servings || 1;
        calories += mealEntry.meal.nutrition.calories * servings;
        protein += mealEntry.meal.nutrition.protein * servings;
        carbs += mealEntry.meal.nutrition.carbohydrates * servings;
        fats += mealEntry.meal.nutrition.fats * servings;
      }
    };

    if (day.meals?.breakfast) addNutrition(day.meals.breakfast);
    if (day.meals?.lunch) addNutrition(day.meals.lunch);
    if (day.meals?.dinner) addNutrition(day.meals.dinner);
    if (day.meals?.snacks) {
      day.meals.snacks.forEach((snack) => addNutrition(snack));
    }

    return { calories, protein, carbs, fats };
  };

  const nutrition = calculateDayNutrition();

  const getMealTypeIcon = (type) => {
    switch (type) {
      case "breakfast":
        return "🌅";
      case "lunch":
        return "☀️";
      case "dinner":
        return "🌙";
      case "snack":
        return "🍎";
      default:
        return "🍽️";
    }
  };

  const getMealTypeColor = (type) => {
    switch (type) {
      case "breakfast":
        return "border-yellow-300 bg-yellow-50";
      case "lunch":
        return "border-blue-300 bg-blue-50";
      case "dinner":
        return "border-purple-300 bg-purple-50";
      case "snack":
        return "border-green-300 bg-green-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  const renderMealEntry = (mealEntry, mealType, snackIndex = null) => {
    if (!mealEntry || !mealEntry.meal) {
      return (
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-400">
          No {mealType} selected
        </div>
      );
    }

    const isConsumed = mealEntry.consumed || false;
    const servings = mealEntry.servings || 1;

    return (
      <div
        className={`relative border-2 rounded-lg overflow-hidden transition-all ${
          isConsumed
            ? "opacity-60 border-green-400"
            : getMealTypeColor(mealType)
        } ${allowConsume ? "" : "opacity-60"}`}
      >
        {/* Consumed Badge */}
        {isConsumed && (
          <div className="absolute top-2 right-2 z-10 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
            <span className="mr-1">✓</span> Consumed
          </div>
        )}

        {/* Meal Card */}
        <div className={isConsumed || !allowConsume ? "pointer-events-none" : ""}>
          <MealCard meal={mealEntry.meal} onClick={handleMealClick} />
        </div>

        {/* Servings and Consume Button */}
        <div className="p-3 bg-white border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{servings}</span> serving
            {servings !== 1 ? "s" : ""}
          </div>
          {allowConsume ? (
            <button
              onClick={() => handleConsumeToggle(mealType, snackIndex)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isConsumed
                  ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {isConsumed ? "Mark as Not Consumed" : "Mark as Consumed"}
            </button>
          ) : (
            <button
              disabled
              className="px-4 py-1.5 rounded-md text-sm font-medium bg-gray-200 text-gray-600"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Day Header */}
      {dateInfo && (
        <div
          className={`px-6 py-4 border-b border-gray-200 ${
            dateInfo.isToday ? "bg-blue-50" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <h3
              className={`text-xl font-semibold ${
                dateInfo.isToday ? "text-blue-900" : "text-gray-900"
              }`}
            >
              {dateInfo.dateString}
              {dateInfo.isToday && (
                <span className="ml-2 text-sm font-normal text-blue-600">
                  (Today)
                </span>
              )}
            </h3>
            {dateInfo.isPast && !dateInfo.isToday && (
              <span className="text-sm text-gray-500">Past</span>
            )}
          </div>
        </div>
      )}

      {/* Meals Section */}
      <div className="p-6 space-y-6">
        {/* Breakfast */}
        <div>
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">
              {getMealTypeIcon("breakfast")}
            </span>
            <h4 className="text-lg font-semibold text-gray-900">Breakfast</h4>
          </div>
          {renderMealEntry(day.meals?.breakfast, "breakfast")}
        </div>

        {/* Lunch */}
        <div>
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">{getMealTypeIcon("lunch")}</span>
            <h4 className="text-lg font-semibold text-gray-900">Lunch</h4>
          </div>
          {renderMealEntry(day.meals?.lunch, "lunch")}
        </div>

        {/* Dinner */}
        <div>
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">
              {getMealTypeIcon("dinner")}
            </span>
            <h4 className="text-lg font-semibold text-gray-900">Dinner</h4>
          </div>
          {renderMealEntry(day.meals?.dinner, "dinner")}
        </div>

        {/* Snacks */}
        {day.meals?.snacks && day.meals.snacks.length > 0 && (
          <div>
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">
                {getMealTypeIcon("snack")}
              </span>
              <h4 className="text-lg font-semibold text-gray-900">Snacks</h4>
            </div>
            <div className="space-y-4">
              {day.meals.snacks.map((snack, index) => (
                <div key={index}>
                  {renderMealEntry(snack, "snack", index)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Nutrition Summary */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Daily Nutrition Summary
          </h4>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-xs text-gray-600 mb-1">Calories</div>
              <div className="text-lg font-bold text-blue-600">
                {Math.round(nutrition.calories)}
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-xs text-gray-600 mb-1">Protein</div>
              <div className="text-lg font-bold text-green-600">
                {Math.round(nutrition.protein)}g
              </div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <div className="text-xs text-gray-600 mb-1">Carbs</div>
              <div className="text-lg font-bold text-yellow-600">
                {Math.round(nutrition.carbs)}g
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-xs text-gray-600 mb-1">Fats</div>
              <div className="text-lg font-bold text-purple-600">
                {Math.round(nutrition.fats)}g
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {day.notes && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {day.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanDay;

