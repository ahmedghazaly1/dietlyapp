import React, { createContext, useState, useContext, useCallback } from "react";
import api from "../services/api";

export const MealContext = createContext();

export const MealProvider = ({ children }) => {
  const [meals, setMeals] = useState([]);
  const [currentMeal, setCurrentMeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    mealType: "",
    difficulty: "",
    dietaryTags: "",
    minCalories: "",
    maxCalories: "",
    search: "",
  });
  const [pagination, setPagination] = useState(null);

  // Fetch meals with filters
  const fetchMeals = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 20,
        ...filters,
        ...params,
      };

      // Remove empty filter values
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] === "" || queryParams[key] === null) {
          delete queryParams[key];
        }
      });

      const response = await api.get("/meals", { params: queryParams });

      if (response.data.success) {
        setMeals(response.data.data || []);
        setPagination(response.data.pagination || null);
        return { success: true, data: response.data.data };
      } else {
        setError(response.data.message || "Failed to fetch meals");
        return { success: false, error: response.data.message };
      }
    } catch (err) {
      console.error("Error fetching meals:", err);
      const errorMsg =
        err.response?.data?.message || "Failed to load meals";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch single meal by ID
  const fetchMealById = useCallback(async (mealId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/meals/${mealId}`);

      if (response.data.success) {
        setCurrentMeal(response.data.data);
        return { success: true, data: response.data.data };
      } else {
        setError(response.data.message || "Failed to fetch meal");
        return { success: false, error: response.data.message };
      }
    } catch (err) {
      console.error("Error fetching meal:", err);
      const errorMsg =
        err.response?.data?.message || "Failed to load meal";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch meals by type
  const fetchMealsByType = useCallback(async (mealType, additionalParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/meals/type/${mealType}`, {
        params: additionalParams,
      });

      if (response.data.success) {
        setMeals(response.data.data || []);
        return { success: true, data: response.data.data };
      } else {
        setError(response.data.message || "Failed to fetch meals");
        return { success: false, error: response.data.message };
      }
    } catch (err) {
      console.error("Error fetching meals by type:", err);
      const errorMsg =
        err.response?.data?.message || "Failed to load meals";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch filtered meals (for authenticated users)
  const fetchFilteredMeals = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/meals/filtered", { params });

      if (response.data.success) {
        setMeals(response.data.data || []);
        return { success: true, data: response.data.data };
      } else {
        setError(response.data.message || "Failed to fetch filtered meals");
        return { success: false, error: response.data.message };
      }
    } catch (err) {
      console.error("Error fetching filtered meals:", err);
      const errorMsg =
        err.response?.data?.message || "Failed to load filtered meals";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch meal suggestions (for authenticated users)
  const fetchMealSuggestions = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/meals/suggestions", { params });

      if (response.data.success) {
        setMeals(response.data.data || []);
        return { success: true, data: response.data.data };
      } else {
        setError(response.data.message || "Failed to fetch meal suggestions");
        return { success: false, error: response.data.message };
      }
    } catch (err) {
      console.error("Error fetching meal suggestions:", err);
      const errorMsg =
        err.response?.data?.message || "Failed to load meal suggestions";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      mealType: "",
      difficulty: "",
      dietaryTags: "",
      minCalories: "",
      maxCalories: "",
      search: "",
    });
  }, []);

  // Clear current meal
  const clearCurrentMeal = useCallback(() => {
    setCurrentMeal(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset meals list
  const resetMeals = useCallback(() => {
    setMeals([]);
    setPagination(null);
  }, []);

  return (
    <MealContext.Provider
      value={{
        // State
        meals,
        currentMeal,
        loading,
        error,
        filters,
        pagination,

        // Actions
        fetchMeals,
        fetchMealById,
        fetchMealsByType,
        fetchFilteredMeals,
        fetchMealSuggestions,
        updateFilters,
        clearFilters,
        clearCurrentMeal,
        clearError,
        resetMeals,

        // Setters (for direct state updates if needed)
        setMeals,
        setCurrentMeal,
      }}
    >
      {children}
    </MealContext.Provider>
  );
};

export const useMeal = () => {
  const context = useContext(MealContext);
  if (!context)
    throw new Error("useMeal must be used within MealProvider");
  return context;
};

