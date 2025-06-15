import { sampleHealthRecommendations } from "@/constants/symptom-mood";

export function HealthRecommendations() {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-sm border border-purple-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🤖</span>
        <h2 className="text-xl font-semibold text-gray-800">AI Health Recommendations</h2>
      </div>
      <div className="space-y-3">
        {sampleHealthRecommendations.map((recommendation, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
            <span className="text-lg">{recommendation.icon}</span>
            <div>
              <p className="text-sm font-medium text-gray-800">{recommendation.title}</p>
              <p className="text-xs text-gray-600">{recommendation.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 