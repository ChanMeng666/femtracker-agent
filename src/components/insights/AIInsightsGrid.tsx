import { Insight } from "./types";

interface AIInsightsGridProps {
  insights: Insight[];
}

export function AIInsightsGrid({ insights }: AIInsightsGridProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case "positive": return "✅";
      case "improvement": return "💡";
      case "warning": return "⚠️";
      case "neutral": return "📊";
      default: return "📊";
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "positive": return "border-green-200 bg-green-50";
      case "improvement": return "border-blue-200 bg-blue-50";
      case "warning": return "border-yellow-200 bg-yellow-50";
      case "neutral": return "border-gray-200 bg-gray-50";
      default: return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🤖</span>
        <h2 className="text-xl font-semibold text-gray-800">AI Intelligent Insights</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <div key={index} className={`border rounded-xl p-4 ${getInsightColor(insight.type)}`}>
            <div className="flex items-start gap-3">
              <span className="text-xl">{getInsightIcon(insight.type)}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-white px-2 py-1 rounded-full font-medium text-gray-600">
                    {insight.category}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{insight.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                <div className="bg-white/80 rounded-lg p-2">
                  <p className="text-xs text-gray-700">
                    <strong>Suggestion:</strong> {insight.recommendation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 