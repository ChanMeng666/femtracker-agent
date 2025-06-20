import React, { useState } from 'react';
import { useExerciseWithDB } from '@/hooks/useExerciseWithDB';
import { supabaseRest } from '@/lib/supabase/restClient';
import { PageLayout } from '@/components/shared/PageLayout';

interface Exercise {
  id: string;
  date: string;
  exercise_type: string;
  duration_minutes: number;
  intensity: number;
  calories_burned?: number;
  notes?: string;
  created_at: string;
}

const exerciseTypes = [
  { value: 'cardio', label: 'Cardio', icon: '🏃‍♀️', color: 'bg-red-50 border-red-200' },
  { value: 'strength', label: 'Strength Training', icon: '💪', color: 'bg-blue-50 border-blue-200' },
  { value: 'yoga', label: 'Yoga & Stretching', icon: '🧘‍♀️', color: 'bg-green-50 border-green-200' },
  { value: 'walking', label: 'Walking', icon: '🚶‍♀️', color: 'bg-yellow-50 border-yellow-200' },
  { value: 'swimming', label: 'Swimming', icon: '🏊‍♀️', color: 'bg-blue-50 border-blue-200' },
  { value: 'cycling', label: 'Cycling', icon: '🚴‍♀️', color: 'bg-purple-50 border-purple-200' },
];

export const ExerciseTrackerContent: React.FC = () => {
  const {
    weeklyGoal,
    exerciseScore,
    weeklyProgress,
    totalWeeklyMinutes,
    goalAchievement,
    loading,
    error,
  } = useExerciseWithDB();

  // Local state for enhanced features
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [tempDuration, setTempDuration] = useState<number>(30);
  const [tempIntensity, setTempIntensity] = useState<number>(5);
  const [tempCalories, setTempCalories] = useState<string>('');
  const [tempNotes, setTempNotes] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Load exercises from database
  React.useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const { data, error } = await supabaseRest
        .from('exercises')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);

      if (!error && data) {
        setExercises(data as Exercise[]);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  // Get today's data
  const today = new Date().toISOString().split('T')[0];
  const todayExercises = exercises.filter(e => e.date === today);

  // Get recent data (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentExercises = exercises.filter(e => new Date(e.date) >= sevenDaysAgo);

  // Handle exercise editing
  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise.id);
    setTempDuration(exercise.duration_minutes);
    setTempIntensity(exercise.intensity);
    setTempCalories(exercise.calories_burned?.toString() || '');
    setTempNotes(exercise.notes || '');
  };

  const handleSaveExercise = async (exerciseId: string) => {
    try {
      const updateData: Record<string, unknown> = {
        duration_minutes: tempDuration,
        intensity: tempIntensity,
        notes: tempNotes || 'Updated manually'
      };

      if (tempCalories) {
        updateData.calories_burned = Number(tempCalories);
      }

      const { error } = await supabaseRest
        .from('exercises')
        .update(updateData)
        .eq('id', exerciseId);

      if (!error) {
        await loadExercises();
        setEditingExercise(null);
      }
    } catch (error) {
      console.error('Error updating exercise:', error);
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    try {
      const { error } = await supabaseRest
        .from('exercises')
        .delete()
        .eq('id', exerciseId);

      if (!error) {
        await loadExercises();
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const handleAddExercise = async (exerciseType: string) => {
    try {
      const exerciseData: Record<string, unknown> = {
        date: today,
        exercise_type: exerciseType,
        duration_minutes: tempDuration,
        intensity: tempIntensity,
        notes: tempNotes || 'Added manually'
      };

      if (tempCalories) {
        exerciseData.calories_burned = Number(tempCalories);
      }

      const { error } = await supabaseRest
        .from('exercises')
        .insert([exerciseData]);

      if (!error) {
        await loadExercises();
        setShowAddForm(false);
        setTempDuration(30);
        setTempIntensity(5);
        setTempCalories('');
        setTempNotes('');
      }
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  const activeDays = weeklyProgress.filter(day => day.minutes > 0).length;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your exercise data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load exercise data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <PageLayout
      title="Exercise Health Assistant"
      subtitle="Exercise Tracking & Personalized Fitness Recommendations"
      icon="🏃‍♀️"
      gradient="blue"
      statusInfo={{
        text: `This Week: ${totalWeeklyMinutes} min`,
        variant: 'primary'
      }}
    >
      {/* Database Connection Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-800">
              <span className="font-medium">Exercise database connected</span> - Your workouts are being saved automatically
              <span className="block text-xs text-green-600 mt-1">
                {exercises.length} total exercises • {todayExercises.length} today • {recentExercises.length} this week
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Today's Exercises */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Today&apos;s Workouts</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {showAddForm ? 'Cancel' : 'Add Workout'}
          </button>
        </div>

        {/* Add Exercise Form */}
        {showAddForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-800 mb-3">Add New Workout</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-blue-700">Duration (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={tempDuration}
                  onChange={(e) => setTempDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-blue-700">Intensity: {tempIntensity}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={tempIntensity}
                  onChange={(e) => setTempIntensity(Number(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-blue-700">Calories Burned (optional)</label>
                <input
                  type="number"
                  placeholder="e.g., 300"
                  value={tempCalories}
                  onChange={(e) => setTempCalories(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-blue-700">Notes (optional)</label>
                <input
                  type="text"
                  placeholder="How did it feel?"
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              {exerciseTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleAddExercise(type.value)}
                  className={`p-3 rounded-lg border-2 ${type.color} hover:shadow-sm transition-all text-center`}
                >
                  <div className="text-xl mb-1">{type.icon}</div>
                  <div className="text-xs font-medium text-gray-800">{type.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current Exercises with Details */}
        {todayExercises.length > 0 ? (
          <div className="space-y-3">
            {todayExercises.map((exercise) => (
              <div key={exercise.id} className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">
                    {exerciseTypes.find(t => t.value === exercise.exercise_type)?.icon || '🏃‍♀️'}
                  </span>
                  <div>
                    <div className="font-medium text-gray-800">{exercise.exercise_type}</div>
                    <div className="text-sm text-gray-600">
                      {exercise.duration_minutes} min • Intensity: {exercise.intensity}/10
                      {exercise.calories_burned && (
                        <span> • {exercise.calories_burned} cal</span>
                      )}
                      {exercise.notes && (
                        <span className="ml-2 text-xs text-gray-500">• {exercise.notes}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditExercise(exercise)}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteExercise(exercise.id)}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🏃‍♀️</div>
            <p>No workouts recorded today</p>
            <p className="text-sm">Click "Add Workout" to get started!</p>
          </div>
        )}
      </div>

      {/* Weekly Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Weekly Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-3">Total Exercise Time</h3>
            <div className="text-2xl font-bold text-blue-600 mb-1">{totalWeeklyMinutes} min</div>
            <div className="text-xs text-blue-600">Goal: {weeklyGoal} min</div>
            <div className="mt-2 text-xs text-gray-600">
              Achievement: {goalAchievement}%
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800 mb-3">Active Days</h3>
            <div className="text-2xl font-bold text-green-600 mb-1">{activeDays}</div>
            <div className="text-xs text-green-600">days this week</div>
            {recentExercises.length > 0 && (
              <div className="mt-2 text-xs text-gray-600">
                Avg intensity: {(recentExercises.reduce((sum, e) => sum + e.intensity, 0) / recentExercises.length).toFixed(1)}/10
              </div>
            )}
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-800 mb-3">Exercise Score</h3>
            <div className="text-2xl font-bold text-purple-600 mb-1">{exerciseScore}</div>
            <div className="text-xs text-purple-600">out of 100</div>
            {recentExercises.length > 0 && (
              <div className="mt-2 text-xs text-gray-600">
                Most common: {
                  [...new Set(recentExercises.map(e => e.exercise_type))]
                    .map(type => ({ type, count: recentExercises.filter(e => e.exercise_type === type).length }))
                    .sort((a, b) => b.count - a.count)[0]?.type || 'None'
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Exercise History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Exercise History</h2>
        {exercises.length > 0 ? (
          <div className="space-y-3">
            {exercises.slice(0, 5).map((exercise) => (
              <div key={exercise.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">
                    {exerciseTypes.find(t => t.value === exercise.exercise_type)?.icon || '🏃‍♀️'}
                  </span>
                  <div>
                    <div className="font-medium text-gray-800">{exercise.exercise_type}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(exercise.date).toLocaleDateString()} • {exercise.duration_minutes} min • Intensity: {exercise.intensity}/10
                    </div>
                  </div>
                </div>
                {editingExercise === exercise.id ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSaveExercise(exercise.id)}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingExercise(null)}
                      className="px-3 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEditExercise(exercise)}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>No exercise history yet</p>
            <p className="text-sm">Start adding workouts to see your progress!</p>
          </div>
        )}
      </div>

      {/* AI Assistant Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 className="text-sm font-medium text-blue-800 mb-2">🤖 Ask your AI Assistant</h3>
        <div className="text-xs text-blue-700 space-y-1">
          <p><strong>Workout Recording:</strong></p>
          <p>• &quot;Record a 45-minute cardio workout with intensity 7&quot;</p>
          <p>• &quot;Log 30 minutes of yoga with 250 calories burned&quot;</p>
          <p>• &quot;Add strength training session for 60 minutes&quot;</p>
          
          <p className="pt-2"><strong>Goal Management:</strong></p>
          <p>• &quot;Set my weekly exercise goal to 200 minutes&quot;</p>
          <p>• &quot;What&apos;s my current goal achievement?&quot;</p>
          <p>• &quot;Update my exercise score to 85&quot;</p>
          
          <p className="pt-2"><strong>Data Analysis:</strong></p>
          <p>• &quot;Show me my workout patterns this week&quot;</p>
          <p>• &quot;What&apos;s my average exercise intensity?&quot;</p>
          <p>• &quot;Analyze my exercise consistency&quot;</p>
        </div>
      </div>
    </PageLayout>
  );
}; 