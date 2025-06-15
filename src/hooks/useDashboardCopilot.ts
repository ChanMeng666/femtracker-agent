import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import type { HealthScore, HealthInsight } from '../types/dashboard';
import { getHealthStatus } from '../utils/dashboardHelpers';

interface UseDashboardCopilotProps {
  healthScore: HealthScore;
  insights: HealthInsight[];
  updateHealthScore: (scoreType: keyof HealthScore, score: number) => void;
  addHealthInsight: (
    type: HealthInsight['type'],
    category: string,
    message: string,
    action?: string,
    actionLink?: string
  ) => void;
  removeHealthInsight: (category: string) => void;
  updateHealthInsight: (category: string, updates: Partial<HealthInsight>) => void;
}

export const useDashboardCopilot = ({
  healthScore,
  insights,
  updateHealthScore,
  addHealthInsight,
  removeHealthInsight,
  updateHealthInsight
}: UseDashboardCopilotProps) => {
  
  // Make dashboard data readable by AI
  useCopilotReadable({
    description: "Current health dashboard data and overall health status",
    value: {
      healthScore,
      insights,
      overallHealthStatus: getHealthStatus(healthScore.overall)
    }
  });

  // AI Action: Update health scores
  useCopilotAction({
    name: "updateHealthScores",
    description: "Update individual health scores or overall score",
    parameters: [
      {
        name: "scoreType",
        type: "string",
        description: "Type of score to update (overall, cycle, nutrition, exercise, fertility, lifestyle, symptoms)",
        required: true,
      },
      {
        name: "score",
        type: "number",
        description: "New score value (0-100)",
        required: true,
      }
    ],
    handler: ({ scoreType, score }) => {
      const validScoreTypes = ['overall', 'cycle', 'nutrition', 'exercise', 'fertility', 'lifestyle', 'symptoms'];
      if (validScoreTypes.includes(scoreType)) {
        updateHealthScore(scoreType as keyof HealthScore, score);
      }
    },
  });

  // AI Action: Add health insight
  useCopilotAction({
    name: "addHealthInsight",
    description: "Add a new health insight to the dashboard",
    parameters: [
      {
        name: "type",
        type: "string",
        description: "Type of insight (positive, warning, info)",
        required: true,
      },
      {
        name: "category",
        type: "string",
        description: "Health category (Cycle Health, Nutrition, Exercise, Fertility, Lifestyle, Symptoms)",
        required: true,
      },
      {
        name: "message",
        type: "string",
        description: "Insight message content",
        required: true,
      },
      {
        name: "action",
        type: "string",
        description: "Action button text (optional)",
        required: false,
      },
      {
        name: "actionLink",
        type: "string",
        description: "Action link URL (optional)",
        required: false,
      }
    ],
    handler: ({ type, category, message, action, actionLink }) => {
      addHealthInsight(type as HealthInsight['type'], category, message, action, actionLink);
    },
  });

  // AI Action: Remove health insight
  useCopilotAction({
    name: "removeHealthInsight",
    description: "Remove a health insight by category",
    parameters: [{
      name: "category",
      type: "string",
      description: "Category of insight to remove",
      required: true,
    }],
    handler: ({ category }) => {
      removeHealthInsight(category);
    },
  });

  // AI Action: Update health insight
  useCopilotAction({
    name: "updateHealthInsight",
    description: "Update an existing health insight",
    parameters: [
      {
        name: "category",
        type: "string",
        description: "Category of insight to update",
        required: true,
      },
      {
        name: "type",
        type: "string",
        description: "New insight type (positive, warning, info)",
        required: false,
      },
      {
        name: "message",
        type: "string",
        description: "New insight message",
        required: false,
      },
      {
        name: "action",
        type: "string",
        description: "New action button text",
        required: false,
      },
      {
        name: "actionLink",
        type: "string",
        description: "New action link URL",
        required: false,
      }
    ],
    handler: ({ category, type, message, action, actionLink }) => {
      const updates: Partial<HealthInsight> = {};
      if (type) updates.type = type as HealthInsight['type'];
      if (message) updates.message = message;
      if (action) updates.action = action;
      if (actionLink) updates.actionLink = actionLink;
      
      updateHealthInsight(category, updates);
    },
  });
}; 