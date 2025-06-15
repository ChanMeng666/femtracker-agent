import { quickActions } from "@/constants/symptom-mood";

export function QuickActions() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <button 
            key={index}
            className={`flex flex-col items-center gap-2 p-4 ${action.color} rounded-xl border transition-colors`}
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="text-sm font-medium text-gray-800">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 