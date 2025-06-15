import { ExerciseType, IntensityLevel } from '@/types/exercise';

export const exerciseTypes: ExerciseType[] = [
  { type: "cardio", label: "Cardio", icon: "🏃‍♀️", color: "bg-red-50 border-red-200", examples: "Running, Swimming, Cycling" },
  { type: "strength", label: "Strength Training", icon: "🏋️‍♀️", color: "bg-blue-50 border-blue-200", examples: "Weight Lifting, Push-ups, Squats" },
  { type: "yoga", label: "Yoga & Stretching", icon: "🧘‍♀️", color: "bg-purple-50 border-purple-200", examples: "Yoga, Pilates, Stretching" },
  { type: "walking", label: "Walking", icon: "🚶‍♀️", color: "bg-green-50 border-green-200", examples: "Walking, Brisk Walking, Stairs" }
];

export const intensityLevels: IntensityLevel[] = [
  { level: "low", label: "Light", color: "bg-green-100 text-green-800", description: "Can talk easily" },
  { level: "moderate", label: "Moderate", color: "bg-yellow-100 text-yellow-800", description: "Slightly breathless but can talk" },
  { level: "high", label: "High Intensity", color: "bg-red-100 text-red-800", description: "Heavily breathing" }
]; 