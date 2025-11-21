import React, { useState, useEffect } from "react";
import api from "../../services/api";
import ProgressChart from "./ProgressChart";
import LoadingSpinner from "../common/LoadingSpinner";

const ProgressTracker = () => {
  const [progressData, setProgressData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState("weight");
  const [daysFilter, setDaysFilter] = useState(30);

  useEffect(() => {
    fetchProgressData();
    fetchProgressStats();
  }, [daysFilter]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculate date range based on days filter
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysFilter);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      const response = await api.get("/progress", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          limit: 1000, // Get all entries in the date range
        },
      });

      if (response.data.success) {
        // Sort by date ascending for chart display
        const sortedData = (response.data.data || []).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setProgressData(sortedData);
      } else {
        setError(response.data.message || "Failed to fetch progress data");
      }
    } catch (err) {
      console.error("Error fetching progress data:", err);
      setError(
        err.response?.data?.message || "Failed to load progress data"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressStats = async () => {
    try {
      const response = await api.get("/progress/stats", {
        params: {
          days: daysFilter,
        },
      });

      if (response.data.success) {
        setStats(response.data.data || response.data);
      }
    } catch (err) {
      console.error("Error fetching progress stats:", err);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "increasing":
        return "↗️";
      case "decreasing":
        return "↘️";
      case "stable":
        return "→";
      default:
        return "—";
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case "increasing":
        return "text-green-600";
      case "decreasing":
        return "text-red-600";
      case "stable":
        return "text-gray-600";
      default:
        return "text-gray-400";
    }
  };

  const formatChange = (change) => {
    if (change === null || change === undefined) return "—";
    const sign = change > 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && progressData.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchProgressData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Progress Tracker
        </h1>
        <p className="text-gray-600">
          Track your weight, BMI, and other health metrics over time
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Time Period:
          </label>
          <select
            value={daysFilter}
            onChange={(e) => setDaysFilter(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 6 months</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Metric:</label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="weight">Weight (kg)</option>
            <option value="bmi">BMI</option>
            <option value="energyLevel">Energy Level</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Weight Stats */}
          {stats.weight && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Weight</h3>
                <span
                  className={`text-2xl ${getTrendColor(
                    stats.trends?.weightTrend
                  )}`}
                >
                  {getTrendIcon(stats.trends?.weightTrend)}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current:</span>
                  <span className="font-semibold">
                    {stats.weight.current?.toFixed(1)} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Change:</span>
                  <span
                    className={`font-semibold ${
                      stats.weight.change > 0
                        ? "text-red-600"
                        : stats.weight.change < 0
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    {formatChange(stats.weight.change)} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average:</span>
                  <span className="font-semibold">
                    {stats.weight.average?.toFixed(1)} kg
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* BMI Stats */}
          {stats.bmi && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">BMI</h3>
                <span
                  className={`text-2xl ${getTrendColor(
                    stats.trends?.bmiTrend
                  )}`}
                >
                  {getTrendIcon(stats.trends?.bmiTrend)}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current:</span>
                  <span className="font-semibold">
                    {stats.bmi.current?.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Change:</span>
                  <span
                    className={`font-semibold ${
                      stats.bmi.change > 0
                        ? "text-red-600"
                        : stats.bmi.change < 0
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    {formatChange(stats.bmi.change)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average:</span>
                  <span className="font-semibold">
                    {stats.bmi.average?.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Energy Level Stats */}
          {stats.energyLevel && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Energy Level
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average:</span>
                  <span className="font-semibold">
                    {stats.energyLevel.average?.toFixed(1)} / 5
                  </span>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${(stats.energyLevel.average / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 capitalize">
          {selectedMetric === "energyLevel"
            ? "Energy Level"
            : selectedMetric === "weight"
            ? "Weight (kg)"
            : "BMI"}{" "}
          Over Time
        </h2>
        <ProgressChart data={progressData} metric={selectedMetric} />
      </div>

      {/* Recent Entries */}
      {progressData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Entries
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weight (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BMI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Energy Level
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {progressData
                  .slice()
                  .reverse()
                  .slice(0, 10)
                  .map((entry) => (
                    <tr key={entry._id || entry.date}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.weight ? `${entry.weight.toFixed(1)} kg` : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.bmi ? entry.bmi.toFixed(1) : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.energyLevel
                          ? `${entry.energyLevel}/5`
                          : "—"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {progressData.length === 0 && !loading && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">No progress data available</p>
          <p className="text-sm text-gray-400">
            Start tracking your progress by adding your first entry
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;

