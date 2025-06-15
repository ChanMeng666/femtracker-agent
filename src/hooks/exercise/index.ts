import { useCopilotReadable } from "@copilotkit/react-core";
import { exerciseTypes, intensityLevels } from "@/constants/exercise";
import { useExerciseState } from "./useExerciseState";
import { useExerciseActions } from "./useExerciseActions";

export const useExercise = () => {
  const state = useExerciseState();
  
  // Set up CopilotKit actions
  useExerciseActions({
    setSelectedExercise: state.setSelectedExercise,
    setExerciseDuration: state.setExerciseDuration,
    setExerciseIntensity: state.setExerciseIntensity,
    setWeeklyGoal: state.setWeeklyGoal,
    setExerciseScore: state.setExerciseScore,
    setWeeklyProgress: state.setWeeklyProgress
  });

  // Make exercise data readable by AI
  useCopilotReadable({
    description: "Current exercise tracking data and fitness status",
    value: {
      selectedExercise: state.selectedExercise,
      exerciseDuration: state.exerciseDuration,
      exerciseIntensity: state.exerciseIntensity,
      totalWeeklyMinutes: state.totalWeeklyMinutes,
      weeklyGoal: state.weeklyGoal,
      exerciseScore: state.exerciseScore,
      goalAchievement: state.goalAchievement,
      activeDays: state.weeklyProgress.filter(day => day.minutes > 0).length,
      weeklyProgress: state.weeklyProgress,
      exerciseTypes: exerciseTypes.map(et => ({
        type: et.type,
        label: et.label,
        selected: state.selectedExercise === et.type,
        examples: et.examples
      })),
      intensityLevels: intensityLevels.map(il => ({
        level: il.level,
        label: il.label,
        selected: state.exerciseIntensity === il.level,
        description: il.description
      }))
    }
  });

  return state;
}; 