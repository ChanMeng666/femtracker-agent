interface BBTRecordProps {
  bbt: string;
  onBBTChange: (value: string) => void;
}

export function BBTRecord({ bbt, onBBTChange }: BBTRecordProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Basal Body Temperature Record</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 w-24">Today&apos;s BBT:</label>
          <input
            type="number"
            step="0.1"
            min="35"
            max="40"
            placeholder="36.5"
            value={bbt}
            onChange={(e) => onBBTChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <span className="text-sm text-gray-600">°C</span>
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            Record
          </button>
        </div>
      </div>
    </div>
  );
} 