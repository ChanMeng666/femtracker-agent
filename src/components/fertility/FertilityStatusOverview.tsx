interface FertilityStatusOverviewProps {
  fertilityScore: number;
  expectedOvulation: string;
  currentBBT: string;
}

export function FertilityStatusOverview({ 
  fertilityScore, 
  expectedOvulation, 
  currentBBT 
}: FertilityStatusOverviewProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Fertility Status Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="text-3xl font-bold text-green-600 mb-1">{fertilityScore} pts</div>
          <div className="text-sm text-gray-600">Fertility Health Score</div>
          <div className="text-xs text-green-600 mt-1">Good Status</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
          <div className="text-3xl font-bold text-purple-600 mb-1">{expectedOvulation}</div>
          <div className="text-sm text-gray-600">Expected Ovulation</div>
          <div className="text-xs text-purple-600 mt-1">High Fertility</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="text-3xl font-bold text-blue-600 mb-1">{currentBBT}°C</div>
          <div className="text-sm text-gray-600">Today&apos;s BBT</div>
          <div className="text-xs text-blue-600 mt-1">Normal Range</div>
        </div>
      </div>
    </div>
  );
} 