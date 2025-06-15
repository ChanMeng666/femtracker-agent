import { symptomOptions } from "@/constants/symptom-mood";

interface SymptomSelectorProps {
  selectedSymptoms: string[];
  onSymptomToggle: (symptom: string) => void;
}

export function SymptomSelector({ selectedSymptoms, onSymptomToggle }: SymptomSelectorProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Symptom Recording</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {symptomOptions.map((symptom) => (
          <button
            key={symptom.value}
            onClick={() => onSymptomToggle(symptom.value)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              selectedSymptoms.includes(symptom.value) 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-200 hover:border-red-300'
            }`}
          >
            <span className="text-2xl">{symptom.icon}</span>
            <span className="text-sm font-medium text-center">{symptom.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 