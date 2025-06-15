import React from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { DataCard } from '@/components/shared/DataCard';

interface ExerciseOverviewProps {
  totalWeeklyMinutes: number;
  activeDays: number;
  exerciseScore: number;
  goalAchievement: number;
  weeklyGoal: number;
}

export const ExerciseOverview: React.FC<ExerciseOverviewProps> = ({
  totalWeeklyMinutes,
  activeDays,
  exerciseScore,
  goalAchievement,
  weeklyGoal,
}) => {
  return (
    <DataCard title="Exercise Overview" icon="🏃‍♀️">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          icon="⏱️"
          title="Weekly Exercise"
          value={totalWeeklyMinutes}
          subtitle="minutes"
          color="teal"
        />
        <StatsCard
          icon="📅"
          title="Active Days"
          value={activeDays}
          subtitle="this week"
          color="blue"
        />
        <StatsCard
          icon="⭐"
          title="Exercise Score"
          value={exerciseScore}
          subtitle="Good"
          color="purple"
        />
        <StatsCard
          icon="🎯"
          title="Goal Achievement"
          value={`${goalAchievement}%`}
          subtitle={`${weeklyGoal} min/week`}
          color="green"
        />
      </div>
    </DataCard>
  );
}; 