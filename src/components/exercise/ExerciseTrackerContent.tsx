import React from 'react';
import { useExercise } from '@/hooks/exercise';
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
  } = useExercise();

  const activeDays = weeklyProgress.filter(day => day.minutes > 0).length;

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