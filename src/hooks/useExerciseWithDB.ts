import { useState, useEffect } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { useAuth } from "./auth/useAuth";
import { supabaseRest } from "@/lib/supabase/rest-client";
import { WeeklyProgressDay } from "@/types/exercise";
import { exerciseTypes, intensityLevels } from "@/constants/exercise";

// Database type for exercise records
interface DatabaseExercise {
  id: string;
  user_id: string;
  date: string;
  exercise_type: string;
  duration_minutes: number;
  intensity: number;
  calories_burned?: number;
  notes?: string;
  created_at: string;
}

// Frontend type adaptation
interface FrontendExercise {
  id: string;
  date: string;
  exerciseType: string;
  durationMinutes: number;
  intensity: number;
  caloriesBurned?: number;
  notes?: string;
}

export const useExerciseWithDB = () => {
  const { user, accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for UI components
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [exerciseDuration, setExerciseDuration] = useState<number>(30);
  const [exerciseIntensity, setExerciseIntensity] = useState<string>("");
  const [weeklyGoal, setWeeklyGoal] = useState<number>(150);
  const [exerciseScore, setExerciseScore] = useState<number>(68);
  
  // Database state
  const [exercises, setExercises] = useState<FrontendExercise[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgressDay[]>([
    { day: "Mon", minutes: 0, type: "Rest" },
    { day: "Tue", minutes: 0, type: "Rest" },
    { day: "Wed", minutes: 0, type: "Rest" },
    { day: "Thu", minutes: 0, type: "Rest" },
    { day: "Fri", minutes: 0, type: "Rest" },
    { day: "Sat", minutes: 0, type: "Rest" },
    { day: "Sun", minutes: 0, type: "Rest" }
  ]);

  const totalWeeklyMinutes = weeklyProgress.reduce((sum, day) => sum + day.minutes, 0);
  const goalAchievement = Math.round((totalWeeklyMinutes / weeklyGoal) * 100);

  // Load data on mount
  useEffect(() => {
    if (!user || !accessToken) return;
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, accessToken]);

  const loadAllData = async () => {
    if (!user || !accessToken) return;

    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadRecentExercises(),
        loadWeeklyProgress()
      ]);
    } catch (err) {
      console.error('Error loading exercise data:', err);
      setError('Failed to load exercise data');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentExercises = async () => {
    if (!user || !accessToken) return;

    try {
      const result = await supabaseRest.select(
        'exercises',
        '*',
        { user_id: user.id },
        { limit: 30, accessToken }
      );

      if (result.error) {
        console.error('Error loading exercises:', result.error);
        return;
      }

      if (result.data) {
        // Sort by date descending
        const sortedData = (result.data as DatabaseExercise[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setExercises(sortedData.map((exercise: DatabaseExercise) => ({
          id: exercise.id,
          date: exercise.date,
          exerciseType: exercise.exercise_type,
          durationMinutes: exercise.duration_minutes,
          intensity: exercise.intensity,
          caloriesBurned: exercise.calories_burned || undefined,
          notes: exercise.notes || undefined
        })));
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const loadWeeklyProgress = async () => {
    if (!user || !accessToken) return;

    try {
      // Get this week's data
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

      const result = await supabaseRest.select(
        'exercises',
        '*',
        { user_id: user.id },
        { accessToken }
      );

      if (result.error) {
        console.error('Error loading weekly progress:', result.error);
        return;
      }

      // Filter data for this week
      const weekStart = startOfWeek.toISOString().split('T')[0];
      const weekEnd = endOfWeek.toISOString().split('T')[0];
      
      const weekData = (result.data as DatabaseExercise[] || []).filter((exercise: DatabaseExercise) => 
        exercise.date >= weekStart && exercise.date <= weekEnd
      );

      // Create weekly progress map
      const progressMap = new Map<string, { minutes: number; type: string }>();
      const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      
      weekData.forEach((exercise: DatabaseExercise) => {
        const exerciseDate = new Date(exercise.date);
        const dayIndex = (exerciseDate.getDay() + 6) % 7; // Convert to Monday = 0
        const dayName = dayNames[dayIndex];
        
        const existing = progressMap.get(dayName) || { minutes: 0, type: "Rest" };
        progressMap.set(dayName, {
          minutes: existing.minutes + exercise.duration_minutes,
          type: exercise.exercise_type
        });
      });

      // Update weekly progress
      setWeeklyProgress(dayNames.map(day => ({
        day,
        minutes: progressMap.get(day)?.minutes || 0,
        type: progressMap.get(day)?.type || "Rest"
      })));
    } catch (error) {
      console.error('Error loading weekly progress:', error);
    }
  };

  // Add new exercise to database
  const addExercise = async (
    exerciseType: string,
    duration: number,
    intensity: number,
    caloriesBurned?: number,
    notes?: string,
    date?: string
  ) => {
    if (!user || !accessToken) return;

    const exerciseDate = date || new Date().toISOString().split('T')[0];

    try {
      const result = await supabaseRest.insert('exercises', {
        user_id: user.id,
        date: exerciseDate,
        exercise_type: exerciseType,
        duration_minutes: duration,
        intensity,
        calories_burned: caloriesBurned,
        notes
      }, accessToken);

      if (result.error) {
        console.error('Error adding exercise:', result.error);
        return;
      }

      const data = Array.isArray(result.data) ? result.data[0] : result.data;
      const newExercise: FrontendExercise = {
        id: data.id,
        date: data.date,
        exerciseType: data.exercise_type,
        durationMinutes: data.duration_minutes,
        intensity: data.intensity,
        caloriesBurned: data.calories_burned || undefined,
        notes: data.notes || undefined
      };

      setExercises(prev => [newExercise, ...prev]);
      
      // Reload weekly progress if it's this week
      loadWeeklyProgress();
      
    } catch (err) {
      console.error('Error adding exercise:', err);
    }
  };

  // Make exercise data readable by AI
  useCopilotReadable({
    description: "Current exercise tracking data and fitness status",
    value: {
      selectedExercise,
      exerciseDuration,
      exerciseIntensity,
      totalWeeklyMinutes,
      weeklyGoal,
      exerciseScore,
      goalAchievement,
      activeDays: weeklyProgress.filter(day => day.minutes > 0).length,
      weeklyProgress,
      recentExercises: exercises.slice(0, 10),
      exerciseTypes: exerciseTypes.map(et => ({
        type: et.type,
        label: et.label,
        selected: selectedExercise === et.type,
        examples: et.examples
      })),
      intensityLevels: intensityLevels.map(il => ({
        level: il.level,
        label: il.label,
        selected: exerciseIntensity === il.level,
        description: il.description
      }))
    }
  });

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

  // AI Action: Record workout
  useCopilotAction({
    name: "recordWorkout",
    description: "Record a complete workout with type, duration, and intensity",
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
        type: "number",
        description: "Intensity level (1-10)",
        required: true,
      },
      {
        name: "caloriesBurned",
        type: "number",
        description: "Estimated calories burned (optional)",
        required: false,
      },
      {
        name: "notes",
        type: "string",
        description: "Additional notes about the workout (optional)",
        required: false,
      }
    ],
    handler: async ({ exerciseType, duration, intensity, caloriesBurned, notes }) => {
      if (duration >= 5 && duration <= 120 && intensity >= 1 && intensity <= 10) {
        await addExercise(exerciseType, duration, intensity, caloriesBurned, notes);
        
        // Update UI state
        setSelectedExercise(exerciseType);
        setExerciseDuration(duration);
        setExerciseIntensity(intensity <= 3 ? "low" : intensity <= 7 ? "moderate" : "high");
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

  // Delete exercise from database
  const deleteExercise = async (exerciseId: string) => {
    if (!user || !accessToken) return;

    try {
      // Note: REST client doesn't have delete method yet, we'll implement it
      // For now, we'll just remove from local state
      setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
      
      // Reload weekly progress
      loadWeeklyProgress();
      
    } catch (err) {
      console.error('Error deleting exercise:', err);
    }
  };

  return {
    // UI State
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
    
    // Database State
    exercises,
    weeklyProgress,
    totalWeeklyMinutes,
    goalAchievement,
    loading,
    error,
    
    // Actions
    addExercise,
    deleteExercise,
    loadAllData
  };
}; 