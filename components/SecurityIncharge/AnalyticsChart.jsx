'use client';

import { BarChart3 } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const AnalyticsChart = ({
  type = 'pie',
  data = [],
  title,
  className = ""
}) => {
  // Check if data is valid
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm">Chart data is empty or invalid</p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {type.charAt(0).toUpperCase() + type.slice(1)} Chart
          </h3>
          <p className="text-sm text-gray-500">
            Chart functionality will be available soon
          </p>
          {data && data.length > 0 && (
            <div className="mt-4 text-xs text-gray-400">
              Data points: {data.length}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h3>
      )}
      {renderChart()}
    </div>
  );
};

export default AnalyticsChart;
