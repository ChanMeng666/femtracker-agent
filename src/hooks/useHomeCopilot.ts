import { useRouter } from "next/navigation";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { HealthOverview, QuickRecord, PersonalizedTip } from '../types/home';
import { VALID_NAVIGATION_PAGES } from '../constants/home';

interface UseHomeCopilotProps {
  healthOverview: HealthOverview;
  quickRecords: QuickRecord[];
  personalizedTips: PersonalizedTip[];
  updateHealthScore: (scoreType: string, score: number) => void;
  addQuickRecord: (type: string, value: string, notes?: string) => void;
  addPersonalizedTip: (type: string, category: string, message: string, actionText?: string, actionLink?: string) => void;
  removeTip: (tipId: string) => void;
}

export const useHomeCopilot = ({
  healthOverview,
  quickRecords,
  personalizedTips,
  updateHealthScore,
  addQuickRecord,
  addPersonalizedTip,
  removeTip
}: UseHomeCopilotProps) => {
  const router = useRouter();

  // Make home page data readable by AI
  useCopilotReadable({
    description: "Current health overview and personalized tips for the user",
    value: {
      healthOverview,
      quickRecords,
      personalizedTips,
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
        description: "Page to navigate to (dashboard, cycle-tracker, nutrition, exercise, fertility, lifestyle, symptom-mood, recipe, insights, settings)",
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
}; 