import { useCopilotAction } from "@copilotkit/react-core";
import { HealthMetric } from "@/components/insights/types";

interface UseHealthMetricsCopilotProps {
  setHealthMetrics: (metrics: HealthMetric[] | ((prev: HealthMetric[]) => HealthMetric[])) => void;
}

export function useHealthMetricsCopilot({
  setHealthMetrics
}: UseHealthMetricsCopilotProps) {
  
  // AI Action: Update health metric score
  useCopilotAction({
    name: "updateHealthMetric",
    description: "Update a specific health metric score and trend",
    parameters: [
      {
        name: "category",
        type: "string",
        description: "Health category to update",
        required: true,
      },
      {
        name: "score",
        type: "number",
        description: "New score (0-100)",
        required: false,
      },
      {
        name: "trend",
        type: "string",
        description: "Trend direction (up, down, stable)",
        required: false,
      }
    ],
    handler: ({ category, score, trend }) => {
      setHealthMetrics(prev => prev.map(metric => {
        if (metric.category === category) {
          return {
            ...metric,
            ...(score !== undefined && score >= 0 && score <= 100 && { score }),
            ...(trend && ["up", "down", "stable"].includes(trend) && { trend: trend as HealthMetric["trend"] })
          };
        }
        return metric;
      }));
    },
  });
} 