interface ConceptionProbabilityPredictionProps {
  conceptionProbability: {
    today: number;
    tomorrow: number;
    dayAfter: number;
  };
}

export function ConceptionProbabilityPrediction({ conceptionProbability }: ConceptionProbabilityPredictionProps) {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-green-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🎯</span>
        <h2 className="text-xl font-semibold text-gray-800">Conception Probability Prediction</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
          <span className="text-sm font-medium text-gray-800">Today&apos;s Conception Probability</span>
          <span className="text-2xl font-bold text-green-600">{conceptionProbability.today}%</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
          <span className="text-sm font-medium text-gray-800">Tomorrow&apos;s Conception Probability</span>
          <span className="text-2xl font-bold text-purple-600">{conceptionProbability.tomorrow}%</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
          <span className="text-sm font-medium text-gray-800">Day After Tomorrow&apos;s Probability</span>
          <span className="text-2xl font-bold text-blue-600">{conceptionProbability.dayAfter}%</span>
        </div>
      </div>
    </div>
  );
} 