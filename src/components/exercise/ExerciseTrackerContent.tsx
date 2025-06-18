import React from 'react';
import { useExerciseWithDB } from '@/hooks/useExerciseWithDB';
import { PageLayout } from '@/components/shared/PageLayout';
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
    loading,
    error,
  } = useExerciseWithDB();

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

    </PageLayout>
  );
}; 