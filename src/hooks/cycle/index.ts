import { useCycleState } from "./useCycleState";
import { useCycleActions } from "./useCycleActions";

export const useCycle = () => {
  const state = useCycleState();
  
  // Set up CopilotKit actions
  useCycleActions({
    currentDay: state.currentDay,
    setCurrentDay: state.setCurrentDay,
    selectedSymptoms: state.selectedSymptoms,
    selectedMood: state.selectedMood,
    setSelectedMood: state.setSelectedMood,
    currentPhase: state.currentPhase,
    nextPeriodDays: state.nextPeriodDays,
    ovulationDays: state.ovulationDays
  });

  return state;
};