import { HealthOverview, PersonalizedTip } from '../types/home';

export const DEFAULT_HEALTH_OVERVIEW: HealthOverview = {
  overallScore: 78,
  cycleHealth: 82,
  nutritionScore: 75,
  exerciseScore: 68,
  fertilityScore: 85,
  lifestyleScore: 72,
  symptomsScore: 76,
  lastUpdated: new Date().toISOString().split('T')[0]
};

export const DEFAULT_PERSONALIZED_TIPS: PersonalizedTip[] = [
  {
    id: '1',
    type: 'reminder',
    category: 'Cycle Health',
    message: 'Your period is expected in 3 days. Consider tracking symptoms and preparing.',
    actionText: 'Track Cycle',
    actionLink: '/cycle-tracker'
  },
  {
    id: '2',
    type: 'suggestion',
    category: 'Exercise',
    message: 'You\'ve been inactive for 2 days. A light walk could boost your energy.',
    actionText: 'Log Exercise',
    actionLink: '/exercise'
  },
  {
    id: '3',
    type: 'achievement',
    category: 'Nutrition',
    message: 'Great job! You\'ve maintained good nutrition for 5 consecutive days.',
    actionText: 'View Details',
    actionLink: '/nutrition'
  }
];

export const VALID_NAVIGATION_PAGES = [
  'cycle-tracker', 'nutrition', 'exercise', 
  'fertility', 'lifestyle', 'symptom-mood', 'recipe', 
  'insights', 'settings'
]; 