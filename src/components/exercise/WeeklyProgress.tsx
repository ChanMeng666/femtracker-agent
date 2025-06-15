import React from 'react';
import { WeeklyProgressDay } from '@/types/exercise';
import { getExerciseIcon } from '@/utils/exercise';

interface WeeklyProgressProps {
  weeklyProgress: WeeklyProgressDay[];
  totalWeeklyMinutes: number;
  weeklyGoal: number;
}

export const WeeklyProgress: React.FC<WeeklyProgressProps> = ({
  weeklyProgress,
  totalWeeklyMinutes,
  weeklyGoal,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Weekly Exercise Progress</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">Weekly Goal: {weeklyGoal} minutes</span>
          <span className="text-sm text-gray-600">{totalWeeklyMinutes}/{weeklyGoal} minutes</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-teal-400 to-blue-500 h-3 rounded-full transition-all"
            style={{ width: `${Math.min((totalWeeklyMinutes / weeklyGoal) * 100, 100)}%` }}
          ></div>
        </div>
        <div className="grid grid-cols-7 gap-2 mt-6">
          {weeklyProgress.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-600 mb-2">{day.day}</div>
              <div 
                className={`h-16 rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all ${
                  day.minutes > 0 
                    ? 'bg-teal-100 text-teal-800 border border-teal-200' 
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}
              >
                <div className="text-lg mb-1">
                  {day.minutes > 0 ? getExerciseIcon(day.type) : '😴'}
                </div>
                <div>{day.minutes > 0 ? `${day.minutes}min` : 'Rest'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 