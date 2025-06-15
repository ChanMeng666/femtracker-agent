import React from 'react';
import Link from 'next/link';
import type { HealthScore } from '../../types/dashboard';
import { getScoreColor, getScoreBarColor, getHealthStatus } from '../../utils/dashboardHelpers';
import { HEALTH_SCORE_ITEMS } from '../../constants/dashboard';

interface HealthOverviewCardProps {
  healthScore: HealthScore;
}

export const HealthOverviewCard: React.FC<HealthOverviewCardProps> = ({
  healthScore
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
      {/* Overall Score */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 mb-4">
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(healthScore.overall)}`}>
              {healthScore.overall}
            </div>
            <div className="text-sm text-gray-600">Overall Score</div>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Health Status: {getHealthStatus(healthScore.overall)}
        </h2>
        <p className="text-gray-600 text-sm">
          Based on your recent health data and tracking history
        </p>
      </div>

      {/* Individual Scores */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {HEALTH_SCORE_ITEMS.map((item) => {
          const score = healthScore[item.key];
          return (
            <div key={item.key} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl mr-2">{item.icon}</span>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${getScoreColor(score)}`}>
                    {score}
                  </div>
                  <div className="text-xs text-gray-500">{item.label}</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getScoreBarColor(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-2 justify-center">
          <Link 
            href="/cycle-tracker"
            className="px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full text-sm hover:bg-pink-200 transition-colors"
          >
            📅 Track Cycle
          </Link>
          <Link 
            href="/nutrition"
            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
          >
            🍎 Nutrition
          </Link>
          <Link 
            href="/exercise"
            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
          >
            💪 Exercise
          </Link>
        </div>
      </div>
    </div>
  );
}; 