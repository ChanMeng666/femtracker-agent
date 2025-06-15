import React from "react";
import { useCopilotAction } from "@copilotkit/react-core";
import { WeeklyProgressDay } from "@/types/exercise";

interface UseExerciseActionsProps {
  setSelectedExercise: (exercise: string) => void;
  setExerciseDuration: (duration: number) => void;
  setExerciseIntensity: (intensity: string) => void;
  setWeeklyGoal: (goal: number) => void;
  setExerciseScore: (score: number) => void;
  setWeeklyProgress: React.Dispatch<React.SetStateAction<WeeklyProgressDay[]>>;
}

export const useExerciseActions = ({
  setSelectedExercise,
  setExerciseDuration,
  setExerciseIntensity,
  setWeeklyGoal,
  setExerciseScore,
  setWeeklyProgress
}: UseExerciseActionsProps) => {
  
  // AI Action: Select exercise type
  useCopilotAction({
    name: "selectExerciseType",
    description: "Select exercise type for today's workout",
    parameters: [{
      name: "exerciseType",
      type: "string",
      description: "Exercise type (cardio, strength, yoga, walking)",
      required: true,
    }],
    handler: ({ exerciseType }) => {
      const validTypes = ["cardio", "strength", "yoga", "walking"];
      if (validTypes.includes(exerciseType)) {
        setSelectedExercise(exerciseType);
      }
    },
  });

  // AI Action: Set exercise duration
  useCopilotAction({
    name: "setExerciseDuration",
    description: "Set exercise duration in minutes",
    parameters: [{
      name: "duration",
      type: "number",
      description: "Exercise duration in minutes (5-120)",
      required: true,
    }],
    handler: ({ duration }) => {
      if (duration >= 5 && duration <= 120) {
        setExerciseDuration(duration);
      }
    },
  });

  // AI Action: Set exercise intensity
  useCopilotAction({
    name: "setExerciseIntensity",
    description: "Set exercise intensity level",
    parameters: [{
      name: "intensity",
      type: "string",
      description: "Intensity level (low, moderate, high)",
      required: true,
    }],
    handler: ({ intensity }) => {
      const validIntensities = ["low", "moderate", "high"];
      if (validIntensities.includes(intensity)) {
        setExerciseIntensity(intensity);
      }
    },
  });

  // AI Action: Set weekly goal
  useCopilotAction({
    name: "setWeeklyGoal",
    description: "Set weekly exercise goal in minutes",
    parameters: [{
      name: "goalMinutes",
      type: "number",
      description: "Weekly exercise goal in minutes (60-500)",
      required: true,
    }],
    handler: ({ goalMinutes }) => {
      if (goalMinutes >= 60 && goalMinutes <= 500) {
        setWeeklyGoal(goalMinutes);
      }
    },
  });

  // AI Action: Update daily exercise
  useCopilotAction({
    name: "updateDailyExercise",
    description: "Update exercise for a specific day of the week",
    parameters: [
      {
        name: "day",
        type: "string",
        description: "Day of the week (Mon, Tue, Wed, Thu, Fri, Sat, Sun)",
        required: true,
      },
      {
        name: "minutes",
        type: "number",
        description: "Exercise minutes for that day (0-120)",
        required: true,
      },
      {
        name: "exerciseType",
        type: "string",
        description: "Type of exercise (Yoga, Running, Strength, Walking, Swimming, Rest)",
        required: true,
      }
    ],
    handler: ({ day, minutes, exerciseType }) => {
      const validDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      if (validDays.includes(day) && minutes >= 0 && minutes <= 120) {
        setWeeklyProgress(prev => prev.map(dayData => {
          if (dayData.day === day) {
            return {
              ...dayData,
              minutes,
              type: exerciseType || dayData.type
            };
          }
          return dayData;
        }));
      }
    },
  });

  // AI Action: Update exercise score
  useCopilotAction({
    name: "setExerciseScore",
    description: "Set exercise health score",
    parameters: [{
      name: "score",
      type: "number",
      description: "Exercise score (0-100)",
      required: true,
    }],
    handler: ({ score }) => {
      if (score >= 0 && score <= 100) {
        setExerciseScore(score);
      }
    },
  });

  // AI Action: Quick workout setup
  useCopilotAction({
    name: "setupQuickWorkout",
    description: "Set up a complete workout with type, duration, and intensity",
    parameters: [
      {
        name: "exerciseType",
        type: "string",
        description: "Exercise type (cardio, strength, yoga, walking)",
        required: true,
      },
      {
        name: "duration",
        type: "number",
        description: "Exercise duration in minutes (5-120)",
        required: true,
      },
      {
        name: "intensity",
        type: "string",
        description: "Intensity level (low, moderate, high)",
        required: true,
      }
    ],
    handler: ({ exerciseType, duration, intensity }) => {
      const validTypes = ["cardio", "strength", "yoga", "walking"];
      const validIntensities = ["low", "moderate", "high"];
      
      if (validTypes.includes(exerciseType)) {
        setSelectedExercise(exerciseType);
      }
      if (duration >= 5 && duration <= 120) {
        setExerciseDuration(duration);
      }
      if (validIntensities.includes(intensity)) {
        setExerciseIntensity(intensity);
      }
    },
  });

  // AI Action: Clear exercise data
  useCopilotAction({
    name: "clearExerciseData",
    description: "Clear all exercise selections",
    parameters: [],
    handler: () => {
      setSelectedExercise("");
      setExerciseIntensity("");
      setExerciseDuration(30);
    },
  });

  return null; // This hook only sets up actions, no return value needed
}; 