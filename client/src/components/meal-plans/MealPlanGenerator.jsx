import React, { useState } from "react";
import api from "../../services/api";

const MealPlanGenerator = ({ onPlanGenerated, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split("T")[0],
    duration: 7,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/meal-plans/generate", {
        startDate: formData.startDate,
        duration: parseInt(formData.duration),
      });

      if (response.data.success) {
        if (onPlanGenerated) {
          onPlanGenerated(response.data.data);
        }
      } else {
        setError(response.data.message || "Failed to generate meal plan");
      }
    } catch (err) {
      console.error("Error generating meal plan:", err);
      const errorData = err.response?.data;
      let errorMessage =
        errorData?.message || "Failed to generate meal plan. Please try again.";

      // Add detailed error information if available
      if (errorData?.details) {
        const { missingMealTypes, availableCounts, suggestion } =
          errorData.details;
        errorMessage += "\n\n";
        if (missingMealTypes && missingMealTypes.length > 0) {
          errorMessage += `Missing meal types: ${missingMealTypes.join(
            ", "
          )}\n`;
        }
        if (availableCounts) {
          errorMessage += `Available meals: Breakfast (${availableCounts.breakfast}), Lunch (${availableCounts.lunch}), Dinner (${availableCounts.dinner}), Snacks (${availableCounts.snack})\n`;
        }
        if (suggestion) {
          errorMessage += `\n${suggestion}`;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 font-poppins">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Generate Meal Plan
          </h2>
          <p className="text-gray-600">
            Create a personalized meal plan based on your profile and dietary
            preferences. Our system will automatically select meals that match
            your goals.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 whitespace-pre-line">{error}</p>
            <div className="mt-3 text-sm text-red-700">
              <p className="font-semibold mb-1">Possible solutions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Check your profile dietary preferences - they may be too
                  restrictive
                </li>
                <li>Verify your allergies are correctly set</li>
                <li>Contact support to add more meals to the database</li>
                <li>Try adjusting your profile settings</li>
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Start Date */}
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Select when you want your meal plan to start
            </p>
          </div>

          {/* Duration */}
          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Duration (days)
            </label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={3}>3 days</option>
              <option value={7}>7 days (1 week)</option>
              <option value={14}>14 days (2 weeks)</option>
              <option value={21}>21 days (3 weeks)</option>
              <option value={30}>30 days (1 month)</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              How long should this meal plan last?
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-2xl">ℹ️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-900">
                  How it works
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Meals are selected based on your profile preferences
                    </li>
                    <li>
                      Calorie targets are calculated from your health goals
                    </li>
                    <li>
                      Dietary restrictions and allergies are automatically
                      considered
                    </li>
                    <li>You can customize meals after generation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Generating...
                </span>
              ) : (
                "Generate Meal Plan"
              )}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default MealPlanGenerator;
