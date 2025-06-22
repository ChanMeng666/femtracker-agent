import { useState, useEffect } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { useAuth } from "./auth/useAuth";
import { supabaseRest } from "@/lib/supabase/restClient";
import { WeeklyProgressDay } from "@/types/exercise";
import { exerciseTypes, intensityLevels } from "@/constants/exercise";

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
  const { user } = useAuth();
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
    if (!user) return;
    loadAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;

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
    if (!user) return;

    const { data, error } = await supabaseRest
      .from('exercises')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error loading exercises:', error);
      return;
    }

    if (data) {
      setExercises(data.map((exercise: any) => ({
        id: exercise.id,
        date: exercise.date,
        exerciseType: exercise.exercise_type,
        durationMinutes: exercise.duration_minutes,
        intensity: exercise.intensity,
        caloriesBurned: exercise.calories_burned || undefined,
        notes: exercise.notes || undefined
      })));
    }
  };

  const loadWeeklyProgress = async () => {
    if (!user) return;

    // Get this week's data
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

    const { data, error } = await supabaseRest
      .from('exercises')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startOfWeek.toISOString().split('T')[0])
      .lte('date', endOfWeek.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('Error loading weekly progress:', error);
      return;
    }

    // Create weekly progress map
    const progressMap = new Map<string, { minutes: number; type: string }>();
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    
    if (data) {
      data.forEach((exercise: any) => {
        const exerciseDate = new Date(exercise.date);
        const dayIndex = (exerciseDate.getDay() + 6) % 7; // Convert to Monday = 0
        const dayName = dayNames[dayIndex];
        
        const existing = progressMap.get(dayName) || { minutes: 0, type: "Rest" };
        progressMap.set(dayName, {
          minutes: existing.minutes + exercise.duration_minutes,
          type: exercise.exercise_type
        });
      });
    }

    // Update weekly progress
    setWeeklyProgress(dayNames.map(day => ({
      day,
      minutes: progressMap.get(day)?.minutes || 0,
      type: progressMap.get(day)?.type || "Rest"
    })));
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
    if (!user) return;

    const exerciseDate = date || new Date().toISOString().split('T')[0];

    try {
      const { data, error } = await supabaseRest
        .from('exercises')
        .insert([{
          user_id: user.id,
          date: exerciseDate,
          exercise_type: exerciseType,
          duration_minutes: duration,
          intensity,
          calories_burned: caloriesBurned,
          notes
        }]);

      if (error) {
        console.error('Error adding exercise:', error);
        return;
      }

      const newExercise: FrontendExercise = {
        id: data[0]?.id || Date.now().toString(),
        date: exerciseDate,
        exerciseType: exerciseType,
        durationMinutes: duration,
        intensity: intensity,
        caloriesBurned: caloriesBurned,
        notes: notes
      };

      // Update local state immediately
      setExercises(prev => [newExercise, ...prev]);
      
      // Also reload weekly progress
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
        try {
          await addExercise(exerciseType, duration, intensity, caloriesBurned, notes);
          
          // Update UI state
          setSelectedExercise(exerciseType);
          setExerciseDuration(duration);
          setExerciseIntensity(intensity <= 3 ? "low" : intensity <= 7 ? "moderate" : "high");
          
          return `Workout recorded successfully: ${duration} minutes of ${exerciseType} at intensity ${intensity}/10`;
        } catch (error) {
          return "Failed to record workout. Please try again.";
        }
      } else {
        return "Invalid workout parameters. Duration must be 5-120 minutes and intensity 1-10.";
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

  // AI Action: Update workout
  useCopilotAction({
    name: "updateWorkout",
    description: "Update an existing workout by finding it by exercise type and date or by specifying today's most recent workout",
    parameters: [
      {
        name: "exerciseType",
        type: "string",
        description: "Exercise type to find and update (cardio, strength, yoga, walking, swimming, cycling)",
        required: false,
      },
      {
        name: "date",
        type: "string",
        description: "Date of the workout to update (YYYY-MM-DD format). If not provided, defaults to today",
        required: false,
      },
      {
        name: "duration",
        type: "number",
        description: "New exercise duration in minutes (5-120)",
        required: false,
      },
      {
        name: "intensity",
        type: "number",
        description: "New intensity level (1-10)",
        required: false,
      },
      {
        name: "caloriesBurned",
        type: "number",
        description: "New estimated calories burned",
        required: false,
      },
      {
        name: "notes",
        type: "string",
        description: "New notes about the workout",
        required: false,
      }
    ],
    handler: async ({ exerciseType, date, duration, intensity, caloriesBurned, notes }) => {
      try {
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        // Find the exercise to update
        let targetExercise;
        if (exerciseType) {
          // Find by exercise type and date
          targetExercise = exercises.find(exercise => 
            exercise.exerciseType.toLowerCase() === exerciseType.toLowerCase() && 
            exercise.date === targetDate
          );
        } else {
          // Find today's most recent workout
          const todayExercises = exercises.filter(exercise => exercise.date === targetDate);
          targetExercise = todayExercises[0]; // Most recent (exercises are sorted by date desc)
        }

        if (!targetExercise) {
          if (exerciseType) {
            return `No ${exerciseType} workout found for ${targetDate}. Please check the exercise type and date.`;
          } else {
            return `No workouts found for ${targetDate}. Please add a workout first.`;
          }
        }

        // Prepare updates
        const updates: {
          duration_minutes?: number;
          intensity?: number;
          calories_burned?: number;
          notes?: string;
        } = {};

        if (duration !== undefined) {
          if (duration < 5 || duration > 120) {
            return "Invalid duration. Please use a value between 5 and 120 minutes.";
          }
          updates.duration_minutes = duration;
        }

        if (intensity !== undefined) {
          if (intensity < 1 || intensity > 10) {
            return "Invalid intensity. Please use a value between 1 and 10.";
          }
          updates.intensity = intensity;
        }

        if (caloriesBurned !== undefined) {
          updates.calories_burned = caloriesBurned;
        }

        if (notes !== undefined) {
          updates.notes = notes;
        }

        if (Object.keys(updates).length === 0) {
          return "No valid updates provided. Please specify duration, intensity, caloriesBurned, or notes to update.";
        }

        await updateExercise(targetExercise.id, updates);

        // Build response message
        const updateParts = [];
        if (updates.duration_minutes) updateParts.push(`duration to ${updates.duration_minutes} minutes`);
        if (updates.intensity) updateParts.push(`intensity to ${updates.intensity}/10`);
        if (updates.calories_burned) updateParts.push(`calories to ${updates.calories_burned}`);
        if (updates.notes) updateParts.push(`notes to "${updates.notes}"`);

        return `Successfully updated ${targetExercise.exerciseType} workout from ${targetDate}: ${updateParts.join(', ')}.`;
      } catch (error) {
        return "Failed to update workout. Please try again.";
      }
    },
  });

  // AI Action: Delete workout
  useCopilotAction({
    name: "deleteWorkout",
    description: "Delete a workout by finding it by exercise type and date or by specifying today's most recent workout",
    parameters: [
      {
        name: "exerciseType",
        type: "string",
        description: "Exercise type to find and delete (cardio, strength, yoga, walking, swimming, cycling)",
        required: false,
      },
      {
        name: "date",
        type: "string",
        description: "Date of the workout to delete (YYYY-MM-DD format). If not provided, defaults to today",
        required: false,
      }
    ],
    handler: async ({ exerciseType, date }) => {
      try {
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        // Find the exercise to delete
        let targetExercise;
        if (exerciseType) {
          // Find by exercise type and date
          targetExercise = exercises.find(exercise => 
            exercise.exerciseType.toLowerCase() === exerciseType.toLowerCase() && 
            exercise.date === targetDate
          );
        } else {
          // Find today's most recent workout
          const todayExercises = exercises.filter(exercise => exercise.date === targetDate);
          targetExercise = todayExercises[0]; // Most recent (exercises are sorted by date desc)
        }

        if (!targetExercise) {
          if (exerciseType) {
            return `No ${exerciseType} workout found for ${targetDate}. Please check the exercise type and date.`;
          } else {
            return `No workouts found for ${targetDate}. Nothing to delete.`;
          }
        }

        await deleteExercise(targetExercise.id);

        return `Successfully deleted ${targetExercise.exerciseType} workout from ${targetDate} (${targetExercise.durationMinutes} minutes, intensity ${targetExercise.intensity}/10).`;
      } catch (error) {
        return "Failed to delete workout. Please try again.";
      }
    },
  });

  // Update exercise
  const updateExercise = async (
    exerciseId: string,
    updates: {
      duration_minutes?: number;
      intensity?: number;
      calories_burned?: number;
      notes?: string;
    }
  ) => {
    if (!user) return;

    try {
      const { error } = await supabaseRest
        .from('exercises')
        .update(updates)
        .eq('id', exerciseId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating exercise:', error);
        return;
      }

      // Update local state
      setExercises(prev => prev.map(exercise => 
        exercise.id === exerciseId 
          ? {
              ...exercise,
              durationMinutes: updates.duration_minutes ?? exercise.durationMinutes,
              intensity: updates.intensity ?? exercise.intensity,
              caloriesBurned: updates.calories_burned ?? exercise.caloriesBurned,
              notes: updates.notes ?? exercise.notes
            }
          : exercise
      ));
      
      // Reload weekly progress to reflect changes
      loadWeeklyProgress();
      
    } catch (err) {
      console.error('Error updating exercise:', err);
    }
  };

  // Delete exercise
  const deleteExercise = async (exerciseId: string) => {
    if (!user) return;

    try {
      const { error } = await supabaseRest
        .from('exercises')
        .delete()
        .eq('id', exerciseId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting exercise:', error);
        return;
      }

      setExercises(prev => prev.filter(exercise => exercise.id !== exerciseId));
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
    updateExercise,
    deleteExercise,
    loadAllData
  };
}; 