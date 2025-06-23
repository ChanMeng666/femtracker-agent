import React from 'react';
import { HealthOverview } from '../../types/home';
import { getScoreColor, getScoreDescription, getHealthStatusColor } from '../../utils/homeHelpers';

interface HealthOverviewCardProps {
  healthOverview: HealthOverview;
  loading?: boolean;
  onRefresh?: () => void;
}

export const HealthOverviewCard: React.FC<HealthOverviewCardProps> = ({ 
  healthOverview, 
  loading = false,
  onRefresh 
}) => {
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

  // 格式化最后更新时间
  const formatLastUpdated = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-800">Health Overview</h2>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              🔄 Real-time Data
            </span>
            {loading && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Updated: {formatLastUpdated(healthOverview.lastUpdated)}
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh health scores based on latest data"
            >
              <svg className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Overall Score Display - Enhanced with real-time indicators */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          {/* Background Circle */}
          <div className="w-36 h-36 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 border-4 border-gray-200 flex items-center justify-center shadow-inner">
            <div className="text-center">
              <div className={`text-5xl font-bold ${getScoreColor(overallScore)} mb-2 transition-all duration-1000`}>
                {loading ? (
                  <div className="animate-pulse">--</div>
                ) : (
                  overallScore
                )}
              </div>
              <div className="text-sm text-gray-600 font-medium">Overall Score</div>
              <div className="text-xs text-gray-500 mt-1">
                {loading ? 'Calculating...' : getScoreDescription(overallScore)}
              </div>
              <div className="text-xs text-green-600 mt-1 font-medium">
                📊 Live Data
              </div>
            </div>
          </div>
          
          {/* Enhanced Progress Ring with gradient */}
          <div className="absolute inset-0 w-36 h-36">
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
              {/* Progress ring with gradient effect */}
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={overallScore >= 80 ? '#10b981' : overallScore >= 60 ? '#f59e0b' : '#ef4444'} />
                  <stop offset="100%" stopColor={overallScore >= 80 ? '#059669' : overallScore >= 60 ? '#d97706' : '#dc2626'} />
                </linearGradient>
              </defs>
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="3"
                strokeDasharray={`${loading ? 0 : overallScore}, 100`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>

          {/* Data source indicator */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Health Categories - Enhanced with data indicators */}
      <div className="grid grid-cols-2 gap-4">
        {healthScores.map((score) => {
          // 确保每个分数也是有效数字
          const scoreValue = typeof score.value === 'number' && !isNaN(score.value) ? score.value : 0;
          
          return (
            <div key={score.key} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 font-medium">{score.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-semibold ${getScoreColor(scoreValue)} transition-all duration-500`}>
                    {loading ? '--' : scoreValue}
                  </span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Real-time data"></div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div 
                  className={`h-2.5 rounded-full ${getHealthStatusColor(scoreValue)} transition-all duration-1000 ease-out`}
                  style={{ width: `${loading ? 0 : scoreValue}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {loading ? 'Calculating...' : getScoreDescription(scoreValue)}
                </div>
                <div className="text-xs text-green-600 font-medium">
                  📈 Live
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Data source information */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 text-sm text-blue-800">
          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Smart Health Scoring:</span>
          <span>Based on your actual exercise, nutrition, sleep, cycle, and mood data from the past 30 days</span>
        </div>
      </div>
    </div>
  );
}; 