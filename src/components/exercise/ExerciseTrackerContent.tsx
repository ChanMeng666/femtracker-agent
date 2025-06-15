import React from 'react';
import Link from "next/link";
import { useExercise } from '@/hooks/useExercise';
import { ExerciseOverview } from './ExerciseOverview';
import { WeeklyProgress } from './WeeklyProgress';
import { ExerciseTypeSelection } from './ExerciseTypeSelection';
import { ExerciseRecommendations } from './ExerciseRecommendations';

export const ExerciseTrackerContent: React.FC = () => {
  const {
    selectedExercise,
    setSelectedExercise,
    exerciseDuration,
    setExerciseDuration,
    exerciseIntensity,
    setExerciseIntensity,
    weeklyGoal,
    exerciseScore,
    weeklyProgress,
    totalWeeklyMinutes,
    goalAchievement,
  } = useExercise();

  const activeDays = weeklyProgress.filter(day => day.minutes > 0).length;

  return (
    <div className="flex h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Navigation */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ← Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  🏃‍♀️ Exercise Health Assistant
                </h1>
                <p className="text-sm text-gray-600">Exercise Tracking & Personalized Fitness Recommendations</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
                This Week: {totalWeeklyMinutes} min
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <ExerciseOverview
              totalWeeklyMinutes={totalWeeklyMinutes}
              activeDays={activeDays}
              exerciseScore={exerciseScore}
              goalAchievement={goalAchievement}
              weeklyGoal={weeklyGoal}
            />

            <WeeklyProgress
              weeklyProgress={weeklyProgress}
              totalWeeklyMinutes={totalWeeklyMinutes}
              weeklyGoal={weeklyGoal}
            />

            <ExerciseTypeSelection
              selectedExercise={selectedExercise}
              exerciseIntensity={exerciseIntensity}
              exerciseDuration={exerciseDuration}
              onSelectExercise={setSelectedExercise}
              onSelectIntensity={setExerciseIntensity}
              onDurationChange={setExerciseDuration}
            />

            <ExerciseRecommendations
              goalAchievement={goalAchievement}
            />

          </div>
        </main>
      </div>
    </div>
  );
}; 