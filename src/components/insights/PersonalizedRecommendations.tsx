export function PersonalizedRecommendations() {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-sm border border-purple-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">💝</span>
        <h2 className="text-xl font-semibold text-gray-800">Personalized Improvement Plan</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 bg-white/60 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">🎯 Short-term Goal (This Week)</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Maintain regular sleep schedule (7-8 hours)</li>
              <li>• Record symptoms daily for better tracking</li>
              <li>• Increase water intake to 8 glasses per day</li>
            </ul>
          </div>
          <div className="p-4 bg-white/60 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">🌟 Long-term Goal (This Month)</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Establish consistent exercise routine</li>
              <li>• Optimize nutrition based on cycle phases</li>
              <li>• Improve stress management techniques</li>
            </ul>
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-white/60 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">📚 Recommended Resources</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <a href="#" className="text-purple-600 hover:underline">Cycle-based Nutrition Guide</a></li>
              <li>• <a href="#" className="text-purple-600 hover:underline">Mindfulness and Stress Relief</a></li>
              <li>• <a href="#" className="text-purple-600 hover:underline">Exercise During Different Phases</a></li>
            </ul>
          </div>
          <div className="p-4 bg-white/60 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">🔔 Reminder Settings</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm hover:bg-purple-200 transition-colors">
                Set Daily Health Check Reminder
              </button>
              <button className="w-full text-left px-3 py-2 bg-pink-100 text-pink-800 rounded-lg text-sm hover:bg-pink-200 transition-colors">
                Enable Weekly Progress Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 