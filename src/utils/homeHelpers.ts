// Utility functions for home page components

export const getTipIcon = (type: string) => {
  switch (type) {
    case 'reminder':
      return '⏰';
    case 'suggestion':
      return '💡';
    case 'warning':
      return '⚠️';
    case 'achievement':
      return '🎉';
    default:
      return '📋';
  }
};

export const getTipColor = (type: string) => {
  switch (type) {
    case 'reminder':
      return 'border-blue-200 bg-blue-50 text-blue-800';
    case 'suggestion':
      return 'border-green-200 bg-green-50 text-green-800';
    case 'warning':
      return 'border-yellow-200 bg-yellow-50 text-yellow-800';
    case 'achievement':
      return 'border-purple-200 bg-purple-50 text-purple-800';
    default:
      return 'border-gray-200 bg-gray-50 text-gray-800';
  }
};

export const getRecordIcon = (type: string) => {
  switch (type) {
    case 'weight':
      return '⚖️';
    case 'mood':
      return '😊';
    case 'symptom':
      return '🩺';
    case 'exercise':
      return '🏃‍♀️';
    case 'meal':
      return '🍽️';
    case 'sleep':
      return '😴';
    case 'water':
      return '💧';
    default:
      return '📊';
  }
};

export const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export const getScoreDescription = (score: number) => {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Average';
  return 'Needs Improvement';
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getHealthStatusColor = (score: number) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}; 