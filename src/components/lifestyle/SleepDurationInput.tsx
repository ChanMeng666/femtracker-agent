import { SLEEP_MIN, SLEEP_MAX } from "@/constants/lifestyle";

interface SleepDurationInputProps {
  sleepHours: number;
  onSleepHoursChange: (value: number) => void;
}

export function SleepDurationInput({ sleepHours, onSleepHoursChange }: SleepDurationInputProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Sleep Duration</h2>
      <div className="flex items-center gap-4">
        <input
          type="number"
          step="0.5"
          min={SLEEP_MIN}
          max={SLEEP_MAX}
          value={sleepHours}
          onChange={(e) => onSleepHoursChange(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
        <span className="text-gray-600">hours</span>
      </div>
    </div>
  );
}