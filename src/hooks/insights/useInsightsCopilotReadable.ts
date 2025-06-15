import { useCopilotReadable } from "@copilotkit/react-core";
import { HealthMetric, Insight, CorrelationAnalysis, TimeRange } from "@/components/insights/types";

interface UseInsightsCopilotReadableProps {
  selectedTimeRange: string;
  healthMetrics: HealthMetric[];
  overallScore: number;
  insights: Insight[];
  correlationAnalyses: CorrelationAnalysis[];
  timeRanges: TimeRange[];
}

export function useInsightsCopilotReadable({
  selectedTimeRange,
  healthMetrics,
  overallScore,
  insights,
  correlationAnalyses,
  timeRanges
}: UseInsightsCopilotReadableProps) {
  // Make insights data readable by AI
  useCopilotReadable({
    description: "Current health insights data and analysis",
    value: {
      selectedTimeRange,
      healthMetrics,
      overallScore,
      insights,
      correlationAnalyses,
      timeRanges
    }
  });
} 