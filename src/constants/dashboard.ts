import type { HealthScore, HealthInsight } from '../types/dashboard';

export const DEFAULT_HEALTH_SCORE: HealthScore = {
  overall: 78,
  cycle: 82,
  nutrition: 75,
  exercise: 68,
  fertility: 85,
  lifestyle: 72,
  symptoms: 76
};

export const DEFAULT_HEALTH_INSIGHTS: HealthInsight[] = [
  {
    type: 'positive',
    category: 'Fertility Health',
    message: 'Your basal body temperature trend shows normal ovulation period, fertility health is good',
    action: 'View Details',
    actionLink: '/fertility'
  },
  {
    type: 'warning',
    category: 'Exercise Health',
    message: 'Insufficient exercise time this week, recommend increasing light exercise',
    action: 'Make Plan',
    actionLink: '/exercise'
  },
  {
    type: 'info',
    category: 'Nutrition Guidance',
    message: 'Based on your menstrual cycle, recommend supplementing iron and vitamin B',
    action: 'Nutrition Advice',
    actionLink: '/nutrition'
  }
];

export const HEALTH_SCORE_ITEMS = [
  { key: 'cycle', label: 'Cycle Health', icon: '📅', color: 'bg-pink-500' },
  { key: 'nutrition', label: 'Nutrition', icon: '🍎', color: 'bg-green-500' },
  { key: 'exercise', label: 'Exercise', icon: '💪', color: 'bg-blue-500' },
  { key: 'fertility', label: 'Fertility', icon: '🌸', color: 'bg-purple-500' },
  { key: 'lifestyle', label: 'Lifestyle', icon: '✨', color: 'bg-yellow-500' },
  { key: 'symptoms', label: 'Symptoms', icon: '💚', color: 'bg-emerald-500' }
] as const; 