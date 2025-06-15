import { HealthMetric } from "./types";

interface HealthScoreOverviewProps {
  healthMetrics: HealthMetric[];
  overallScore: number;
}

export function HealthScoreOverview({ healthMetrics, overallScore }: HealthScoreOverviewProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return "📈";
      case "down": return "📉";
      case "stable": return "➡️";
      default: return "➡️";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Health Score Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {healthMetrics.map((metric, index) => (
          <div key={index} className="relative p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-800">{metric.category}</span>
              <div className="flex items-center gap-1">
                <span className="text-lg">{getTrendIcon(metric.trend)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-lg font-bold ${metric.color}`}>
                {metric.score}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all"
                  style={{ width: `${metric.score}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall Score */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
          <div className="text-4xl font-bold text-purple-600">{overallScore}</div>
          <div className="text-left">
            <div className="font-semibold text-gray-800">Overall Health Score</div>
            <div className="text-sm text-gray-600">
              {overallScore >= 80 ? "Excellent" : overallScore >= 70 ? "Good" : overallScore >= 60 ? "Average" : "Needs Improvement"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 