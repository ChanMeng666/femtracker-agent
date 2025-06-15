import { cervicalMucusTypes } from "@/constants/fertility";

interface CervicalMucusRecordProps {
  cervicalMucus: string;
  onCervicalMucusChange: (value: string) => void;
}

export function CervicalMucusRecord({ cervicalMucus, onCervicalMucusChange }: CervicalMucusRecordProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Cervical Mucus Record</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cervicalMucusTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onCervicalMucusChange(type.value)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              cervicalMucus === type.value
                ? 'border-green-500 bg-green-50 shadow-md'
                : `${type.color} border-2 hover:shadow-sm`
            }`}
          >
            <span className="text-2xl">{type.icon}</span>
            <span className="text-sm font-medium text-gray-700">{type.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 