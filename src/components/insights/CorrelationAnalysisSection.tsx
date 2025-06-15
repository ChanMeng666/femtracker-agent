import { CorrelationAnalysis } from "./types";

interface CorrelationAnalysisSectionProps {
  correlationAnalyses: CorrelationAnalysis[];
}

export function CorrelationAnalysisSection({ correlationAnalyses }: CorrelationAnalysisSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">🔗 Data Correlation Analysis</h2>
      <div className="space-y-6">
        {correlationAnalyses.map((analysis, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-800">{analysis.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Correlation</span>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  analysis.correlation >= 0.7 ? 'bg-red-100 text-red-800' :
                  analysis.correlation >= 0.5 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {(analysis.correlation * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">{analysis.description}</p>
            <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>💡 Suggestion:</strong> {analysis.suggestion}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 