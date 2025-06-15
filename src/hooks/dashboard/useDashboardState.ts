import { useState } from 'react';
import type { HealthScore, HealthInsight } from '../../types/dashboard';
import { 
  DEFAULT_HEALTH_SCORE, 
  DEFAULT_HEALTH_INSIGHTS 
} from '../../constants/dashboard';

export const useDashboardState = () => {
  const [healthScore, setHealthScore] = useState<HealthScore>(DEFAULT_HEALTH_SCORE);
  const [insights, setInsights] = useState<HealthInsight[]>(DEFAULT_HEALTH_INSIGHTS);

  return {
    healthScore,
    setHealthScore,
    insights,
    setInsights,
  };
}; 