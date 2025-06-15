import React from 'react';
import Link from 'next/link';
import type { HealthInsight } from '../../types/dashboard';
import { getInsightIcon, getInsightColor } from '../../utils/dashboardHelpers';

interface HealthInsightsCardProps {
  insights: HealthInsight[];
  onRemoveInsight: (category: string) => void;
}

export const HealthInsightsCard: React.FC<HealthInsightsCardProps> = ({
  insights,
  onRemoveInsight
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Health Insights</h3>
        <span className="text-sm text-gray-500">{insights.length} insights</span>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl flex-shrink-0">
                {getInsightIcon(insight.type)}
              </span>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold">{insight.category}</h4>
                  <button
                    onClick={() => onRemoveInsight(insight.category)}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                    title="Remove insight"
                  >
                    ✕
                  </button>
                </div>
                
                <p className="text-sm mb-3">{insight.message}</p>
                
                {insight.action && insight.actionLink && (
                  <Link
                    href={insight.actionLink}
                    className="inline-flex items-center text-sm font-medium hover:underline"
                  >
                    {insight.action} →
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        {insights.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">💡</div>
            <p className="text-gray-500">No health insights available</p>
            <p className="text-sm text-gray-400">
              Keep tracking your health data to get personalized insights
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 