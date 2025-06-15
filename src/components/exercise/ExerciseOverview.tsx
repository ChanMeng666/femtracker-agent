import React from 'react';

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Exercise Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center p-4 bg-teal-50 rounded-xl border border-teal-200">
          <div className="text-3xl font-bold text-teal-600 mb-1">{totalWeeklyMinutes}</div>
          <div className="text-sm text-gray-600">Weekly Exercise</div>
          <div className="text-xs text-teal-600 mt-1">minutes</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="text-3xl font-bold text-blue-600 mb-1">{activeDays}</div>
          <div className="text-sm text-gray-600">Active Days</div>
          <div className="text-xs text-blue-600 mt-1">this week</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
          <div className="text-3xl font-bold text-purple-600 mb-1">{exerciseScore}</div>
          <div className="text-sm text-gray-600">Exercise Score</div>
          <div className="text-xs text-purple-600 mt-1">Good</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="text-3xl font-bold text-green-600 mb-1">{goalAchievement}%</div>
          <div className="text-sm text-gray-600">Goal Achievement</div>
          <div className="text-xs text-green-600 mt-1">{weeklyGoal} min/week</div>
        </div>
      </div>
    </div>
  );
}; 