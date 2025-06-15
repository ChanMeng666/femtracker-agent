import React from 'react';
import { HealthOverview } from '../../types/home';
import { getScoreColor, getScoreDescription, getHealthStatusColor } from '../../utils/homeHelpers';

interface HealthOverviewCardProps {
  healthOverview: HealthOverview;
}

export const HealthOverviewCard: React.FC<HealthOverviewCardProps> = ({ healthOverview }) => {
  const healthScores = [
    { label: 'Cycle Health', value: healthOverview.cycleHealth, key: 'cycle' },
    { label: 'Nutrition', value: healthOverview.nutritionScore, key: 'nutrition' },
    { label: 'Exercise', value: healthOverview.exerciseScore, key: 'exercise' },
    { label: 'Fertility', value: healthOverview.fertilityScore, key: 'fertility' },
    { label: 'Lifestyle', value: healthOverview.lifestyleScore, key: 'lifestyle' },
    { label: 'Symptoms', value: healthOverview.symptomsScore, key: 'symptoms' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Health Overview</h2>
        <span className="text-sm text-gray-500">Updated: {healthOverview.lastUpdated}</span>
      </div>

      {/* Overall Score Circle */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(healthOverview.overallScore)}`}>
                {healthOverview.overallScore}
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
          </div>
          <div 
            className={`absolute inset-0 rounded-full border-8 border-transparent ${getHealthStatusColor(healthOverview.overallScore)}`}
            style={{
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              transform: `rotate(${(healthOverview.overallScore / 100) * 360}deg)`
            }}
          ></div>
        </div>
      </div>

      {/* Health Categories */}
      <div className="grid grid-cols-2 gap-4">
        {healthScores.map((score) => (
          <div key={score.key} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">{score.label}</span>
              <span className={`text-lg font-semibold ${getScoreColor(score.value)}`}>
                {score.value}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getHealthStatusColor(score.value)}`}
                style={{ width: `${score.value}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {getScoreDescription(score.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 