import Link from "next/link";
import { TimeRange } from "./types";
import { FilterSelector } from "@/components/shared/FilterSelector";

interface InsightsHeaderProps {
  selectedTimeRange: string;
  setSelectedTimeRange: (range: string) => void;
  timeRanges: TimeRange[];
  overallScore: number;
}

export function InsightsHeader({ 
  selectedTimeRange, 
  setSelectedTimeRange, 
  timeRanges, 
  overallScore 
}: InsightsHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
                          ← Home
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              📊 Health Insights Assistant
            </h1>
            <p className="text-sm text-gray-600">Comprehensive Health Analysis and Intelligent Suggestions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FilterSelector
            label=""
            value={selectedTimeRange}
            options={timeRanges.map(range => ({
              value: range.value,
              label: range.label
            }))}
            onChange={setSelectedTimeRange}
            variant="compact"
            className="min-w-[120px]"
          />
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            Overall Score: {overallScore} points
          </span>
        </div>
      </div>
    </header>
  );
} 