import { useCopilotAction } from "@copilotkit/react-core";
import { CorrelationAnalysis } from "@/components/insights/types";

interface UseCorrelationAnalysisCopilotProps {
  setCorrelationAnalyses: (analyses: CorrelationAnalysis[] | ((prev: CorrelationAnalysis[]) => CorrelationAnalysis[])) => void;
}

export function useCorrelationAnalysisCopilot({
  setCorrelationAnalyses
}: UseCorrelationAnalysisCopilotProps) {
  
  // AI Action: Add correlation analysis
  useCopilotAction({
    name: "addCorrelationAnalysis",
    description: "Add a new correlation analysis",
    parameters: [
      {
        name: "title",
        type: "string",
        description: "Analysis title",
        required: true,
      },
      {
        name: "description",
        type: "string",
        description: "Analysis description",
        required: true,
      },
      {
        name: "correlation",
        type: "number",
        description: "Correlation value (0-1)",
        required: true,
      },
      {
        name: "suggestion",
        type: "string",
        description: "Suggestion based on analysis",
        required: true,
      }
    ],
    handler: ({ title, description, correlation, suggestion }) => {
      if (correlation >= 0 && correlation <= 1) {
        const newAnalysis: CorrelationAnalysis = {
          title,
          description,
          correlation,
          suggestion
        };
        setCorrelationAnalyses(prev => [...prev, newAnalysis]);
      }
    },
  });

  // AI Action: Update correlation analysis
  useCopilotAction({
    name: "updateCorrelationAnalysis",
    description: "Update an existing correlation analysis",
    parameters: [
      {
        name: "title",
        type: "string",
        description: "Title of analysis to update",
        required: true,
      },
      {
        name: "correlation",
        type: "number",
        description: "New correlation value (0-1)",
        required: false,
      },
      {
        name: "suggestion",
        type: "string",
        description: "New suggestion",
        required: false,
      }
    ],
    handler: ({ title, correlation, suggestion }) => {
      setCorrelationAnalyses(prev => prev.map(analysis => {
        if (analysis.title === title) {
          return {
            ...analysis,
            ...(correlation !== undefined && correlation >= 0 && correlation <= 1 && { correlation }),
            ...(suggestion && { suggestion })
          };
        }
        return analysis;
      }));
    },
  });
} 