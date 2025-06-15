import { stressLevels } from "@/constants/lifestyle";

interface StressLevelSelectorProps {
  stressLevel: string;
  onStressLevelChange: (value: string) => void;
}

export function StressLevelSelector({ stressLevel, onStressLevelChange }: StressLevelSelectorProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Stress Level</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stressLevels.map((level) => (
          <button
            key={level.value}
            onClick={() => onStressLevelChange(level.value)}
            className={`p-4 rounded-xl border-2 transition-all ${
              stressLevel === level.value
                ? 'border-pink-500 bg-pink-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl mb-2">{level.icon}</div>
            <div className="font-medium text-gray-800">{level.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
} 