import React, { useState, useEffect } from "react";
import api from "../../services/api";
import MealCard from "./MealCard";
import LoadingSpinner from "../common/LoadingSpinner";

const MealList = ({
  filters = {},
  meals: propMeals,
  onMealClick,
  showFilters = true,
  gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
}) => {
  const [meals, setMeals] = useState(propMeals || []);
  const [loading, setLoading] = useState(!propMeals);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const [searchQuery, setSearchQuery] = useState(filters.search || "");
  const [mealType, setMealType] = useState(filters.mealType || "");
  const [difficulty, setDifficulty] = useState(filters.difficulty || "");
  const [dietaryTag, setDietaryTag] = useState(filters.dietaryTags || "");
  const [minCalories, setMinCalories] = useState(filters.minCalories || "");
  const [maxCalories, setMaxCalories] = useState(filters.maxCalories || "");

  useEffect(() => {
    if (!propMeals) {
      fetchMeals();
    }
  }, [mealType, difficulty, dietaryTag, minCalories, maxCalories, searchQuery]);

  const fetchMeals = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 20,
        ...(mealType && { mealType }),
        ...(difficulty && { difficulty }),
        ...(dietaryTag && { dietaryTags: dietaryTag }),
        ...(minCalories && { minCalories }),
        ...(maxCalories && { maxCalories }),
        ...(searchQuery && { search: searchQuery }),
      };

      const response = await api.get("/meals", { params });

      if (response.data.success) {
        setMeals(response.data.data || []);
        setPagination(response.data.pagination || null);
      } else {
        setError(response.data.message || "Failed to fetch meals");
      }
    } catch (err) {
      console.error("Error fetching meals:", err);
      setError(err.response?.data?.message || "Failed to load meals");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    fetchMeals(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setMealType("");
    setDifficulty("");
    setDietaryTag("");
    setMinCalories("");
    setMaxCalories("");
  };

  if (loading && meals.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full px-4 md:px-8 py-6 font-poppins">
      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-[#246608]/20 p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-black mb-4">
              Find Meals
            </h2>
          </div>

          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm text-black font-medium  mb-2">
                {" "}
                {/**text-[#246608]/80 */}
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleFilterChange()}
                placeholder="Search by name or description..."
                className="w-full px-4 py-2 border border-[#246608]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#246608]"
              />
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Meal Type */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Meal Type
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full px-4 py-2 border border-[#246608]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#246608]"
                >
                  <option value="">All Types</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2 border border-[#246608]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#246608]"
                >
                  <option value="">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Dietary Tag */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Dietary Tag
                </label>
                <select
                  value={dietaryTag}
                  onChange={(e) => setDietaryTag(e.target.value)}
                  className="w-full px-4 py-2 border border-[#246608]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#246608]"
                >
                  <option value="">All</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="gluten-free">Gluten-Free</option>
                  <option value="dairy-free">Dairy-Free</option>
                  <option value="keto">Keto</option>
                  <option value="paleo">Paleo</option>
                  <option value="low-carb">Low-Carb</option>
                  <option value="high-protein">High-Protein</option>
                  <option value="nut-free">Nut-Free</option>
                </select>
              </div>

              {/* Calories Range */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Calories
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={minCalories}
                    onChange={(e) => setMinCalories(e.target.value)}
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-[#246608]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#246608]"
                  />
                  <input
                    type="number"
                    value={maxCalories}
                    onChange={(e) => setMaxCalories(e.target.value)}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-[#246608]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#246608]"
                  />
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleFilterChange}
                className="px-4 py-2 bg-[#246608] text-white rounded-md hover:bg-[#2F7A0A] focus:outline-none focus:ring-2 focus:ring-[#246608]"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-[#246608]/20 text-[#246608] rounded-md hover:bg-[#246608]/30 focus:outline-none focus:ring-2 focus:ring-[#246608]"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-[#FDEDE0] border border-[#246608]/30 rounded-lg p-4 mb-6">
          <p className="text-[#246608]">{error}</p>
          <button
            onClick={() => fetchMeals(1)}
            className="mt-2 px-4 py-2 bg-[#246608] text-white rounded hover:bg-[#2F7A0A]"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Meals Grid */}
      {meals.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {meals.map((meal) => (
              <MealCard key={meal._id} meal={meal} onClick={onMealClick} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => fetchMeals(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-[#246608]/30 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#246608]/10"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-[#246608]/80">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => fetchMeals(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 border border-[#246608]/30 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#246608]/10"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        !loading && (
          <div className="bg-[#F6F9F6] rounded-lg p-12 text-center">
            <p className="text-[#246608]/80 text-lg mb-2">No meals found</p>
            <p className="text-[#246608]/60 text-sm">
              Try adjusting your filters or search query
            </p>
          </div>
        )
      )}

      {loading && meals.length > 0 && (
        <div className="text-center py-4">
          <LoadingSpinner size="small" />
        </div>
      )}
    </div>
  );
};

export default MealList;
