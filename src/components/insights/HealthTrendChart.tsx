export function HealthTrendChart() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">📈 Health Trend Analysis</h2>
      
      {/* Simplified Trend Chart */}  
      <div className="h-64 bg-gray-50 rounded-lg p-4 mb-6">
        <div className="h-full flex items-end justify-between">
          {['1 week ago', '6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', '1 day ago', 'Today'].map((day, index) => {
            const scores = [72, 75, 78, 74, 76, 79, 77, 78]; // Sample data
            const normalizedHeight = (scores[index] / 100) * 100;
            return (
              <div key={day} className="flex flex-col items-center gap-2">
                <div className="text-xs text-gray-600 mb-1">{scores[index]}</div>
                <div
                  className="bg-gradient-to-t from-purple-400 to-pink-400 rounded-t-md w-6 transition-all hover:opacity-75"
                  style={{ height: `${normalizedHeight}%` }}
                ></div>
                <div className="text-xs text-gray-500 transform -rotate-45 origin-left">{day}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trend Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600 mb-1">+6%</div>
          <div className="text-sm text-gray-600">This Week Improvement</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600 mb-1">3 items</div>
          <div className="text-sm text-gray-600">Rising Indicators</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-600 mb-1">Stable</div>
          <div className="text-sm text-gray-600">Overall Trend</div>
        </div>
      </div>
    </div>
  );
} 