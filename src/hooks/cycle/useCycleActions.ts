import { useCopilotReadable } from "@copilotkit/react-core";
import { useGenericNumericAction, useGenericStringAction } from "../copilot/useCopilotActions";

interface UseCycleActionsProps {
  currentDay: number;
  setCurrentDay: (day: number) => void;
  selectedSymptoms: string[];
  selectedMood: string;
  setSelectedMood: (mood: string) => void;
  currentPhase: string;
  nextPeriodDays: number;
  ovulationDays: number;
}

export const useCycleActions = ({
  currentDay,
  setCurrentDay,
  selectedSymptoms,
  selectedMood,
  setSelectedMood,
  currentPhase,
  nextPeriodDays,
  ovulationDays
}: UseCycleActionsProps) => {
  
  // Make cycle data readable by AI
  useCopilotReadable({
    description: "Current menstrual cycle tracking data",
    value: {
      currentDay,
      currentPhase,
      nextPeriodDays,
      ovulationDays,
      selectedSymptoms,
      selectedMood,
      totalCycleDays: 28
    }
  });

  // AI Action: Update cycle day using generic action
  useGenericNumericAction(
    "updateCycleDay",
    "Update the current day of the menstrual cycle (1-28)",
    "day",
    1,
    28,
    setCurrentDay
  );

  // AI Action: Update mood using generic action
  useGenericStringAction(
    "updateMood",
    "Update the current mood",
    "mood",
    ["Happy", "Sad", "Irritable", "Calm", "Anxious", "Energetic"],
    setSelectedMood
  );

  return null; // This hook only sets up actions, no return value needed
}; 