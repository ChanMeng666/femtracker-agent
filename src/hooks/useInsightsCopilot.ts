import { HealthMetric, Insight, CorrelationAnalysis, TimeRange } from "@/components/insights/types";
import {
  useInsightsCopilotReadable,
  useInsightsCopilotActions,
  useHealthMetricsCopilot,
  useCorrelationAnalysisCopilot,
  useTimeRangeCopilot
} from "./insights";

interface UseInsightsCopilotProps {
  selectedTimeRange: string;
  setSelectedTimeRange: (range: string) => void;
  timeRanges: TimeRange[];
  healthMetrics: HealthMetric[];
  setHealthMetrics: (metrics: HealthMetric[] | ((prev: HealthMetric[]) => HealthMetric[])) => void;
  overallScore: number;
  insights: Insight[];
  setInsights: (insights: Insight[] | ((prev: Insight[]) => Insight[])) => void;
  correlationAnalyses: CorrelationAnalysis[];
  setCorrelationAnalyses: (analyses: CorrelationAnalysis[] | ((prev: CorrelationAnalysis[]) => CorrelationAnalysis[])) => void;
}

export function useInsightsCopilot({
  selectedTimeRange,
  setSelectedTimeRange,
  timeRanges,
  healthMetrics,
  setHealthMetrics,
  overallScore,
  insights,
  setInsights,
  correlationAnalyses,
  setCorrelationAnalyses
}: UseInsightsCopilotProps) {
  
  // Make insights data readable by AI
  useInsightsCopilotReadable({
    selectedTimeRange,
    healthMetrics,
    overallScore,
    insights,
    correlationAnalyses,
    timeRanges
  });

  // Setup time range actions
  useTimeRangeCopilot({
    setSelectedTimeRange
  });

  // Setup health metrics actions
  useHealthMetricsCopilot({
    setHealthMetrics
  });

  // Setup insights actions
  useInsightsCopilotActions({
    setInsights
  });

  // Setup correlation analysis actions
  useCorrelationAnalysisCopilot({
    setCorrelationAnalyses
  });
} 