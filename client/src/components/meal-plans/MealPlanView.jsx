import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import MealPlanDay from "./MealPlanDay";
import LoadingSpinner from "../common/LoadingSpinner";

const MealPlanView = ({ mealPlanId, mealPlan: propMealPlan, onClose }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const planIdToUse = mealPlanId || id;

  const [mealPlan, setMealPlan] = useState(propMealPlan);
  const [loading, setLoading] = useState(!propMealPlan);
  const [error, setError] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  useEffect(() => {
    if (!propMealPlan && planIdToUse) {
      fetchMealPlan();
    } else if (propMealPlan) {
      // Set initial day to today if available
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIndex = propMealPlan.days?.findIndex((day) => {
        const dayDate = new Date(day.date);
        dayDate.setHours(0, 0, 0, 0);
        return dayDate.getTime() === today.getTime();
      });
      if (todayIndex >= 0) {
        setSelectedDayIndex(todayIndex);
      }
    }
  }, [planIdToUse, propMealPlan]);

  const fetchMealPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/meal-plans/${planIdToUse}`);

      if (response.data.success) {
        const plan = response.data.data;
        setMealPlan(plan);

        // Set initial day to today if available
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayIndex = plan.days?.findIndex((day) => {
          const dayDate = new Date(day.date);
          dayDate.setHours(0, 0, 0, 0);
          return dayDate.getTime() === today.getTime();
        });
        if (todayIndex >= 0) {
          setSelectedDayIndex(todayIndex);
        }
      } else {
        setError(response.data.message || "Failed to fetch meal plan");
      }
    } catch (err) {
      console.error("Error fetching meal plan:", err);
      setError(
        err.response?.data?.message || "Failed to load meal plan"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMealConsumed = async (date, mealType, snackIndex) => {
    if (!mealPlan) return;

    try {
      let endpoint = `/meal-plans/${mealPlan._id}/consume`;
      let body = {
        date: new Date(date).toISOString(),
        mealType,
      };

      if (mealType === "snack" && snackIndex !== null) {
        body.snackIndex = snackIndex;
      }

      const response = await api.put(endpoint, body);

      if (response.data.success) {
        // Refresh meal plan to get updated data
        await fetchMealPlan();
      }
    } catch (err) {
      console.error("Error marking meal as consumed:", err);
      alert(
        err.response?.data?.message || "Failed to update meal status"
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateOverallNutrition = () => {
    if (!mealPlan?.days) return null;

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    mealPlan.days.forEach((day) => {
      const addNutrition = (mealEntry) => {
        if (mealEntry?.meal?.nutrition) {
          const servings = mealEntry.servings || 1;
          totalCalories += mealEntry.meal.nutrition.calories * servings;
          totalProtein += mealEntry.meal.nutrition.protein * servings;
          totalCarbs += mealEntry.meal.nutrition.carbohydrates * servings;
          totalFats += mealEntry.meal.nutrition.fats * servings;
        }
      };

      if (day.meals?.breakfast) addNutrition(day.meals.breakfast);
      if (day.meals?.lunch) addNutrition(day.meals.lunch);
      if (day.meals?.dinner) addNutrition(day.meals.dinner);
      if (day.meals?.snacks) {
        day.meals.snacks.forEach((snack) => addNutrition(snack));
      }
    });

    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fats: totalFats,
      averageCalories: totalCalories / mealPlan.days.length,
    };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
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

  if (!mealPlan) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Meal plan not found</p>
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

  const overallNutrition = calculateOverallNutrition();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
        >
          <span className="mr-2">←</span> Back
        </button>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {mealPlan.name || "Meal Plan"}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                {new Date(mealPlan.startDate).toLocaleDateString()} -{" "}
                {new Date(mealPlan.endDate).toLocaleDateString()}
              </span>
              <span>•</span>
              <span>{mealPlan.duration} days</span>
              <span>•</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  mealPlan.status
                )}`}
              >
                {mealPlan.status}
              </span>
            </div>
          </div>
        </div>

        {/* Adherence */}
        {mealPlan.adherence && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Meal Adherence
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {mealPlan.adherence.consumedMeals || 0} /{" "}
                {mealPlan.adherence.totalMeals || 0} meals
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{
                  width: `${
                    mealPlan.adherence.adherencePercentage || 0
                  }%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {mealPlan.adherence.adherencePercentage?.toFixed(1) || 0}%
              complete
            </p>
          </div>
        )}

        {/* Overall Nutrition Summary */}
        {overallNutrition && mealPlan.targetNutrition && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <div className="text-xs text-gray-500 mb-1">Avg Daily Calories</div>
              <div className="text-lg font-semibold text-gray-900">
                {Math.round(overallNutrition.averageCalories)}
              </div>
              <div className="text-xs text-gray-500">
                Target: {mealPlan.targetNutrition.dailyCalories}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Avg Daily Protein</div>
              <div className="text-lg font-semibold text-gray-900">
                {Math.round(overallNutrition.protein / mealPlan.days.length)}g
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Avg Daily Carbs</div>
              <div className="text-lg font-semibold text-gray-900">
                {Math.round(overallNutrition.carbs / mealPlan.days.length)}g
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Avg Daily Fats</div>
              <div className="text-lg font-semibold text-gray-900">
                {Math.round(overallNutrition.fats / mealPlan.days.length)}g
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Day Navigation */}
      {mealPlan.days && mealPlan.days.length > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 overflow-x-auto">
          <div className="flex gap-2">
            {mealPlan.days.map((day, index) => {
              const dayDate = new Date(day.date);
              const isToday =
                dayDate.toDateString() === new Date().toDateString();
              const isSelected = index === selectedDayIndex;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDayIndex(index)}
                  className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : isToday
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {dayDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                  {isToday && " (Today)"}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Day View */}
      {mealPlan.days && mealPlan.days[selectedDayIndex] && (
        <MealPlanDay
          day={mealPlan.days[selectedDayIndex]}
          onMealConsumed={handleMealConsumed}
          showDate={true}
        />
      )}

      {/* All Days View (Alternative - can be toggled) */}
      {mealPlan.days && mealPlan.days.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-500">No days in this meal plan</p>
        </div>
      )}
    </div>
  );
};

export default MealPlanView;

