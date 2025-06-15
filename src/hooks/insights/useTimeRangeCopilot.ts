import { useCopilotAction } from "@copilotkit/react-core";

interface UseTimeRangeCopilotProps {
  setSelectedTimeRange: (range: string) => void;
}

export function useTimeRangeCopilot({
  setSelectedTimeRange
}: UseTimeRangeCopilotProps) {
  
  // AI Action: Change time range
  useCopilotAction({
    name: "setTimeRange",
    description: "Change the analysis time range",
    parameters: [{
      name: "timeRange",
      type: "string",
      description: "Time range for analysis (week, month, quarter, year)",
      required: true,
    }],
    handler: ({ timeRange }) => {
      const validRanges = ["week", "month", "quarter", "year"];
      if (validRanges.includes(timeRange)) {
        setSelectedTimeRange(timeRange);
      }
    },
  });
} 