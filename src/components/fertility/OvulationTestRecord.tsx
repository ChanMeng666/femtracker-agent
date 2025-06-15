import { ovulationTestResults } from "@/constants/fertility";

interface OvulationTestRecordProps {
  ovulationTest: string;
  onOvulationTestChange: (value: string) => void;
}

export function OvulationTestRecord({ ovulationTest, onOvulationTestChange }: OvulationTestRecordProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Ovulation Test Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ovulationTestResults.map((result) => (
          <button
            key={result.value}
            onClick={() => onOvulationTestChange(result.value)}
            className={`flex flex-col items-center gap-2 p-6 rounded-xl border-2 transition-all ${
              ovulationTest === result.value
                ? 'border-green-500 bg-green-50 shadow-md'
                : `${result.color} border-2 hover:shadow-sm`
            }`}
          >
            <span className="text-3xl">{result.icon}</span>
            <span className="text-lg font-medium text-gray-700">{result.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 