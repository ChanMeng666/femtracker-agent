import { sampleSymptomStats } from "@/constants/symptom-mood";

export function SymptomStatistics() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Monthly Symptom Statistics</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {sampleSymptomStats.map((stat, index) => (
          <div key={index} className={`flex items-center justify-between p-3 ${stat.color} rounded-lg border`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{stat.icon}</span>
              <span className="font-medium text-gray-800">{stat.label}</span>
            </div>
            <span className={`${stat.textColor} font-bold`}>{stat.count} times</span>
          </div>
        ))}
      </div>
    </div>
  );
} 