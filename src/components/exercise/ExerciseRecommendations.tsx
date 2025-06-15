import React from 'react';

interface ExerciseRecommendationsProps {
  goalAchievement: number;
}

export const ExerciseRecommendations: React.FC<ExerciseRecommendationsProps> = ({
  goalAchievement,
}) => {
  return (
    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl shadow-sm border border-teal-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🤖</span>
        <h2 className="text-xl font-semibold text-gray-800">AI Exercise Recommendations</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 bg-white/60 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📊</span>
              <span className="font-medium text-gray-800">Weekly Analysis</span>
            </div>
            <p className="text-sm text-gray-600">
              You&apos;ve achieved {goalAchievement}% of your weekly exercise goal. Consider adding 1-2 more cardio sessions.
            </p>
          </div>
          <div className="p-4 bg-white/60 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🎯</span>
              <span className="font-medium text-gray-800">Today&apos;s Suggestion</span>
            </div>
            <p className="text-sm text-gray-600">
              Perfect day for moderate cardio exercise. Try 30 minutes of brisk walking or light jogging.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-white/60 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💪</span>
              <span className="font-medium text-gray-800">Strength Focus</span>
            </div>
            <p className="text-sm text-gray-600">
              Include 2-3 strength training sessions per week to build muscle and boost metabolism.
            </p>
          </div>
          <div className="p-4 bg-white/60 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🧘‍♀️</span>
              <span className="font-medium text-gray-800">Recovery Advice</span>
            </div>
            <p className="text-sm text-gray-600">
              Don&apos;t forget rest days! Include yoga or stretching for better recovery and flexibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 