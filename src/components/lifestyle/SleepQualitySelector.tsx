import { sleepQualityOptions } from "@/constants/lifestyle";

interface SleepQualitySelectorProps {
  sleepQuality: string;
  onSleepQualityChange: (value: string) => void;
}

export function SleepQualitySelector({ sleepQuality, onSleepQualityChange }: SleepQualitySelectorProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Sleep Quality</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sleepQualityOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSleepQualityChange(option.value)}
            className={`p-4 rounded-xl border-2 transition-all ${
              sleepQuality === option.value
                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl mb-2">{option.icon}</div>
            <div className="font-medium text-gray-800">{option.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
} 