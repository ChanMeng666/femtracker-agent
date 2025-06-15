import { useCopilotAction } from "@copilotkit/react-core";
import { Insight } from "@/components/insights/types";

interface UseInsightsCopilotActionsProps {
  setInsights: (insights: Insight[] | ((prev: Insight[]) => Insight[])) => void;
}

export function useInsightsCopilotActions({
  setInsights
}: UseInsightsCopilotActionsProps) {
  
  // AI Action: Add insight
  useCopilotAction({
    name: "addInsight",
    description: "Add a new health insight",
    parameters: [
      {
        name: "type",
        type: "string",
        description: "Insight type (positive, improvement, warning, neutral)",
        required: true,
      },
      {
        name: "category",
        type: "string",
        description: "Health category",
        required: true,
      },
      {
        name: "title",
        type: "string",
        description: "Insight title",
        required: true,
      },
      {
        name: "description",
        type: "string",
        description: "Insight description",
        required: true,
      },
      {
        name: "recommendation",
        type: "string",
        description: "Recommendation text",
        required: false,
      }
    ],
    handler: ({ type, category, title, description, recommendation }) => {
      const validTypes = ["positive", "improvement", "warning", "neutral"];
      if (validTypes.includes(type)) {
        const newInsight: Insight = {
          type: type as Insight["type"],
          category,
          title,
          description,
          recommendation: recommendation || ""
        };
        setInsights(prev => [...prev, newInsight]);
      }
    },
  });

  // AI Action: Update insight
  useCopilotAction({
    name: "updateInsight",
    description: "Update an existing insight",
    parameters: [
      {
        name: "title",
        type: "string",
        description: "Title of insight to update",
        required: true,
      },
      {
        name: "description",
        type: "string",
        description: "New description",
        required: false,
      },
      {
        name: "recommendation",
        type: "string",
        description: "New recommendation",
        required: false,
      },
      {
        name: "type",
        type: "string",
        description: "New type (positive, improvement, warning, neutral)",
        required: false,
      }
    ],
    handler: ({ title, description, recommendation, type }) => {
      setInsights(prev => prev.map(insight => {
        if (insight.title === title) {
          return {
            ...insight,
            ...(description && { description }),
            ...(recommendation && { recommendation }),
            ...(type && ["positive", "improvement", "warning", "neutral"].includes(type) && { type: type as Insight["type"] })
          };
        }
        return insight;
      }));
    },
  });

  // AI Action: Remove insight
  useCopilotAction({
    name: "removeInsight",
    description: "Remove an insight by title",
    parameters: [{
      name: "title",
      type: "string",
      description: "Title of insight to remove",
      required: true,
    }],
    handler: ({ title }) => {
      setInsights(prev => prev.filter(insight => insight.title !== title));
    },
  });

  // AI Action: Clear all insights
  useCopilotAction({
    name: "clearAllInsights",
    description: "Clear all health insights",
    parameters: [],
    handler: () => {
      setInsights([]);
    },
  });
} 