import type { HealthScore, HealthInsight } from '../types/dashboard';

export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600'; 
  if (score >= 60) return 'text-orange-600';
  return 'text-red-600';
};

export const getScoreBarColor = (score: number): string => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 70) return 'bg-yellow-500';
  if (score >= 60) return 'bg-orange-500';
  return 'bg-red-500';
};

export const getInsightIcon = (type: HealthInsight['type']): string => {
  switch (type) {
    case 'positive': return '✅';
    case 'warning': return '⚠️';
    case 'info': return 'ℹ️';
    default: return '📝';
  }
};

export const getInsightColor = (type: HealthInsight['type']): string => {
  switch (type) {
    case 'positive': return 'border-green-200 bg-green-50 text-green-800';
    case 'warning': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
    case 'info': return 'border-blue-200 bg-blue-50 text-blue-800';
    default: return 'border-gray-200 bg-gray-50 text-gray-800';
  }
};

export const calculateOverallScore = (scores: Omit<HealthScore, 'overall'>): number => {
  const { cycle, nutrition, exercise, fertility, lifestyle, symptoms } = scores;
  return Math.round((cycle + nutrition + exercise + fertility + lifestyle + symptoms) / 6);
};

export const getHealthStatus = (overallScore: number): string => {
  if (overallScore >= 80) return "Excellent";
  if (overallScore >= 70) return "Good";
  if (overallScore >= 60) return "Average";
  return "Needs Improvement";
}; 