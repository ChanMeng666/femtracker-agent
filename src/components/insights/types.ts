export interface HealthMetric {
  category: string;
  score: number;
  trend: "up" | "down" | "stable";
  color: string;
}

export interface Insight {
  type: "positive" | "improvement" | "warning" | "neutral";
  category: string;
  title: string;
  description: string;
  recommendation: string;
}

export interface CorrelationAnalysis {
  title: string;
  description: string;
  correlation: number;
  suggestion: string;
}

export interface TimeRange {
  value: string;
  label: string;
}

export interface InsightsData {
  selectedTimeRange: string;
  healthMetrics: HealthMetric[];
  overallScore: number;
  insights: Insight[];
  correlationAnalyses: CorrelationAnalysis[];
  timeRanges: TimeRange[];
} 