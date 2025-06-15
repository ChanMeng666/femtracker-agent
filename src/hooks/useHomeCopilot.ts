import { useRouter } from "next/navigation";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { HealthOverview, QuickRecord, PersonalizedTip } from '../types/home';
import { HealthInsight } from '../types/dashboard';
import { VALID_NAVIGATION_PAGES } from '../constants/home';

interface UseHomeCopilotProps {
  healthOverview: HealthOverview;
  quickRecords: QuickRecord[];
  personalizedTips: PersonalizedTip[];
  healthInsights: HealthInsight[];
  updateHealthScore: (scoreType: string, score: number) => void;
  addQuickRecord: (type: string, value: string, notes?: string) => void;
  addPersonalizedTip: (type: string, category: string, message: string, actionText?: string, actionLink?: string) => void;
  removeTip: (tipId: string) => void;
  addHealthInsight: (type: 'positive' | 'warning' | 'info', category: string, message: string, action?: string, actionLink?: string) => void;
  removeHealthInsight: (category: string) => void;
}

export const useHomeCopilot = ({
  healthOverview,
  quickRecords,
  personalizedTips,
  healthInsights,
  updateHealthScore,
  addQuickRecord,
  addPersonalizedTip,
  removeTip,
  addHealthInsight,
  removeHealthInsight
}: UseHomeCopilotProps) => {
  const router = useRouter();

  // Make home page data readable by AI
  useCopilotReadable({
    description: "Current health overview, personalized tips, and health insights for the user",
    value: {
      healthOverview,
      quickRecords,
      personalizedTips,
      healthInsights,
      healthStatus: healthOverview.overallScore >= 80 ? "Excellent" : 
                   healthOverview.overallScore >= 70 ? "Good" : 
                   healthOverview.overallScore >= 60 ? "Average" : "Needs Improvement",
      todayDate: new Date().toISOString().split('T')[0]
    }
  });

  // AI Action: Smart navigation
  useCopilotAction({
    name: "navigateToPage",
    description: "Navigate to a specific health tracking page or feature",
    parameters: [
      {
        name: "destination",
        type: "string",
        description: "Page to navigate to (cycle-tracker, nutrition, exercise, fertility, lifestyle, symptom-mood, recipe, insights, settings)",
        required: true,
      }
    ],
    handler: ({ destination }) => {
      if (VALID_NAVIGATION_PAGES.includes(destination)) {
        router.push(`/${destination}`);
      }
    },
  });

  // AI Action: Update health overview scores
  useCopilotAction({
    name: "updateHealthOverview",
    description: "Update health scores in the overview",
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
      updateHealthScore(scoreType, score);
    },
  });

  // AI Action: Quick record entry
  useCopilotAction({
    name: "addQuickRecord",
    description: "Quickly record health data like weight, mood, symptoms, exercise, meals, sleep, or water intake",
    parameters: [
      {
        name: "type",
        type: "string",
        description: "Type of record (weight, mood, symptom, exercise, meal, sleep, water)",
        required: true,
      },
      {
        name: "value",
        type: "string",
        description: "Value or description of the record",
        required: true,
      },
      {
        name: "notes",
        type: "string",
        description: "Optional notes about the record",
        required: false,
      }
    ],
    handler: ({ type, value, notes }) => {
      addQuickRecord(type, value, notes);
    },
  });

  // AI Action: Add personalized tip
  useCopilotAction({
    name: "addPersonalizedTip",
    description: "Add a new personalized health tip or reminder",
    parameters: [
      {
        name: "type",
        type: "string",
        description: "Type of tip (reminder, suggestion, warning, achievement)",
        required: true,
      },
      {
        name: "category",
        type: "string",
        description: "Category of the tip (Cycle Health, Exercise, Nutrition, etc.)",
        required: true,
      },
      {
        name: "message",
        type: "string",
        description: "Tip message content",
        required: true,
      },
      {
        name: "actionText",
        type: "string",
        description: "Optional action button text",
        required: false,
      },
      {
        name: "actionLink",
        type: "string",
        description: "Optional action link URL",
        required: false,
      }
    ],
    handler: ({ type, category, message, actionText, actionLink }) => {
      addPersonalizedTip(type, category, message, actionText, actionLink);
    },
  });

  // AI Action: Remove tip
  useCopilotAction({
    name: "removeTip",
    description: "Remove a personalized tip by ID",
    parameters: [
      {
        name: "tipId",
        type: "string",
        description: "ID of the tip to remove",
        required: true,
      }
    ],
    handler: ({ tipId }) => {
      removeTip(tipId);
    },
  });

  // AI Action: Add health insight
  useCopilotAction({
    name: "addHealthInsight",
    description: "Add a new health insight based on data analysis",
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
        description: "Category of the insight (e.g., 'Cycle Health', 'Sleep Pattern')",
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
        description: "Optional action text",
        required: false,
      },
      {
        name: "actionLink",
        type: "string",
        description: "Optional action link URL",
        required: false,
      }
    ],
    handler: ({ type, category, message, action, actionLink }) => {
      if (type === 'positive' || type === 'warning' || type === 'info') {
        addHealthInsight(type, category, message, action, actionLink);
      }
    },
  });

  // AI Action: Remove health insight
  useCopilotAction({
    name: "removeHealthInsight",
    description: "Remove a health insight by category",
    parameters: [
      {
        name: "category",
        type: "string",
        description: "Category of the insight to remove",
        required: true,
      }
    ],
    handler: ({ category }) => {
      removeHealthInsight(category);
    },
  });
}; 