import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MealPlanGenerator from "../components/meal-plans/MealPlanGenerator";
import api from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";

const MealPlans = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // 'list', 'generate'
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (view === "list") {
      fetchMealPlans();
    }
  }, [view]);

  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get("/meal-plans");
      if (response.data.success) {
        setMealPlans(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching meal plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const activePlan = React.useMemo(
    () => mealPlans.find((p) => p.status === "active") || null,
    [mealPlans]
  );

  const stopActivePlan = async () => {
    if (!activePlan) return;
    try {
      setLoading(true);
      const response = await api.put(`/meal-plans/${activePlan._id}/stop`);
      if (response.data.success) {
        await fetchMealPlans();
      }
    } catch (err) {
      console.error("Error stopping meal plan:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanGenerated = (plan) => {
    navigate(`/meal-plans/view/${plan._id}`);
  };

  if (view === "generate") {
    return (
      <div className="min-h-screen bg-gray-50">
        <MealPlanGenerator
          onPlanGenerated={handlePlanGenerated}
          onCancel={() => setView("list")}
        />
      </div>
    );
  }

  // Route-based view is handled by App.jsx at /meal-plans/view/:id

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-poppins">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Meal Plans</h1>
          {activePlan ? (
            <button
              onClick={stopActivePlan}
              className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Stop Current Plan
            </button>
          ) : (
            <button
              onClick={() => setView("generate")}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Generate New Plan
            </button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : mealPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealPlans.map((plan) => (
              <div
                key={plan._id}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-shadow ${
                  plan.status === "active"
                    ? "hover:shadow-md cursor-pointer"
                    : "opacity-60 cursor-not-allowed"
                }`}
                onClick={
                  plan.status === "active"
                    ? () => navigate(`/meal-plans/view/${plan._id}`)
                    : undefined
                }
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {plan.name || "Meal Plan"}
                </h3>
                <div className="text-sm text-gray-600 mb-4">
                  <p>
                    {new Date(plan.startDate).toLocaleDateString()} -{" "}
                    {new Date(plan.endDate).toLocaleDateString()}
                  </p>
                  <p>{plan.duration} days</p>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      plan.status === "active"
                        ? "bg-green-100 text-green-800"
                        : plan.status === "completed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {plan.status}
                  </span>
                  {plan.adherence && (
                    <span className="text-sm text-gray-600">
                      {plan.adherence.adherencePercentage?.toFixed(0) || 0}%
                      complete
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">No meal plans yet</p>
            <button
              onClick={() => setView("generate")}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Generate Your First Meal Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlans;
