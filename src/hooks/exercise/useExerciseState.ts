import { useState } from "react";
import { WeeklyProgressDay } from "@/types/exercise";

export const useExerciseState = () => {
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [exerciseDuration, setExerciseDuration] = useState<number>(30);
  const [exerciseIntensity, setExerciseIntensity] = useState<string>("");
  const [weeklyGoal, setWeeklyGoal] = useState<number>(150);
  const [exerciseScore, setExerciseScore] = useState<number>(68);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgressDay[]>([
    { day: "Mon", minutes: 45, type: "Yoga" },
    { day: "Tue", minutes: 30, type: "Running" },
    { day: "Wed", minutes: 0, type: "Rest" },
    { day: "Thu", minutes: 40, type: "Strength" },
    { day: "Fri", minutes: 25, type: "Walking" },
    { day: "Sat", minutes: 60, type: "Swimming" },
    { day: "Sun", minutes: 35, type: "Yoga" }
  ]);

  // Computed values
  const totalWeeklyMinutes = weeklyProgress.reduce((sum, day) => sum + day.minutes, 0);
  const goalAchievement = Math.round((totalWeeklyMinutes / weeklyGoal) * 100);

  return {
    // State values
    selectedExercise,
    setSelectedExercise,
    exerciseDuration,
    setExerciseDuration,
    exerciseIntensity,
    setExerciseIntensity,
    weeklyGoal,
    setWeeklyGoal,
    exerciseScore,
    setExerciseScore,
    weeklyProgress,
    setWeeklyProgress,
    
    // Computed values
    totalWeeklyMinutes,
    goalAchievement,
  };
}; 