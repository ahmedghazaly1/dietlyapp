import React from "react";

const ProgressChart = ({ data, metric = "weight", height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Extract values and dates
  const values = data.map((entry) => entry[metric]).filter((v) => v != null);
  const dates = data.map((entry) => new Date(entry.date));

  if (values.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No {metric} data available</p>
      </div>
    );
  }

  // Calculate chart dimensions
  const padding = 40;
  const chartWidth = 600;
  const chartHeight = height;
  const innerWidth = chartWidth - padding * 2;
  const innerHeight = chartHeight - padding * 2;

  // Calculate min/max for scaling
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1; // Avoid division by zero

  // Generate points for the line
  const points = values.map((value, index) => {
    const x = padding + (index / (values.length - 1 || 1)) * innerWidth;
    const y =
      padding +
      innerHeight -
      ((value - minValue) / valueRange) * innerHeight;
    return { x, y, value, date: dates[index] };
  });

  // Generate path string for the line
  const pathData = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  // Generate area path (for gradient fill)
  const areaPath = `${pathData} L ${points[points.length - 1].x} ${
    padding + innerHeight
  } L ${padding} ${padding + innerHeight} Z`;

  // Format date labels
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Get color based on metric
  const getColor = () => {
    switch (metric) {
      case "weight":
        return { line: "#3b82f6", fill: "rgba(59, 130, 246, 0.1)" };
      case "bmi":
        return { line: "#10b981", fill: "rgba(16, 185, 129, 0.1)" };
      case "energyLevel":
        return { line: "#f59e0b", fill: "rgba(245, 158, 11, 0.1)" };
      default:
        return { line: "#6366f1", fill: "rgba(99, 102, 241, 0.1)" };
    }
  };

  const colors = getColor();

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-4">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding + innerHeight - ratio * innerHeight;
          const value = minValue + ratio * valueRange;
          return (
            <g key={ratio}>
              <line
                x1={padding}
                y1={y}
                x2={padding + innerWidth}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-gray-500"
                fontSize="10"
              >
                {value.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill={colors.fill} />

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={colors.line}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill={colors.line}
              className="hover:r-6 transition-all cursor-pointer"
            />
            <title>
              {formatDate(point.date)}: {point.value.toFixed(1)}
            </title>
          </g>
        ))}

        {/* X-axis labels */}
        {points.length > 0 && (
          <>
            <text
              x={points[0].x}
              y={chartHeight - padding + 20}
              textAnchor="middle"
              className="text-xs fill-gray-500"
              fontSize="10"
            >
              {formatDate(points[0].date)}
            </text>
            {points.length > 1 && (
              <text
                x={points[points.length - 1].x}
                y={chartHeight - padding + 20}
                textAnchor="middle"
                className="text-xs fill-gray-500"
                fontSize="10"
              >
                {formatDate(points[points.length - 1].date)}
              </text>
            )}
          </>
        )}
      </svg>
    </div>
  );
};

export default ProgressChart;

