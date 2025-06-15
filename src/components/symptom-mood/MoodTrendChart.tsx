import { sampleMoodTrends } from "@/constants/symptom-mood";

export function MoodTrendChart() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Mood Trends (Last 7 Days)</h2>
      
      {/* Simplified mood trend chart */}
      <div className="flex items-end justify-between gap-2 mb-4 h-32">
        {sampleMoodTrends.map((data) => (
          <div key={data.day} className="flex flex-col items-center flex-1">
            <div 
              className="w-full bg-gradient-to-t from-purple-400 to-purple-600 rounded-t-md transition-all duration-500"
              style={{ height: `${data.height}%` }}
            ></div>
            <span className="text-xs text-gray-600 mt-2">{data.day}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <span>Mood Index</span>
        <span>0-100</span>
      </div>
      <div className="mt-2 text-center text-purple-700 font-medium">
        <span>Average Mood Index: 67/100</span>
      </div>
    </div>
  );
} 