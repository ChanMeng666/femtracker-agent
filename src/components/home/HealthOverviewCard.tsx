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

  // 确保分数是有效数字，如果无效则显示默认值
  const overallScore = typeof healthOverview.overallScore === 'number' && !isNaN(healthOverview.overallScore) 
    ? healthOverview.overallScore 
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Health Overview</h2>
        <span className="text-sm text-gray-500">Updated: {healthOverview.lastUpdated}</span>
      </div>

      {/* Overall Score Display - Simplified and More Visible */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          {/* Background Circle */}
          <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-gray-200 flex items-center justify-center shadow-inner">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(overallScore)} mb-1`}>
                {overallScore}
              </div>
              <div className="text-sm text-gray-600 font-medium">Overall Score</div>
              <div className="text-xs text-gray-500 mt-1">
                {getScoreDescription(overallScore)}
              </div>
            </div>
          </div>
          
          {/* Progress Ring */}
          <div className="absolute inset-0 w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              {/* Background ring */}
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="2"
              />
              {/* Progress ring */}
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={overallScore >= 80 ? '#10b981' : overallScore >= 60 ? '#f59e0b' : '#ef4444'}
                strokeWidth="3"
                strokeDasharray={`${overallScore}, 100`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Health Categories */}
      <div className="grid grid-cols-2 gap-4">
        {healthScores.map((score) => {
          // 确保每个分数也是有效数字
          const scoreValue = typeof score.value === 'number' && !isNaN(score.value) ? score.value : 0;
          
          return (
            <div key={score.key} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">{score.label}</span>
                <span className={`text-lg font-semibold ${getScoreColor(scoreValue)}`}>
                  {scoreValue}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getHealthStatusColor(scoreValue)} transition-all duration-500 ease-out`}
                  style={{ width: `${scoreValue}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {getScoreDescription(scoreValue)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 