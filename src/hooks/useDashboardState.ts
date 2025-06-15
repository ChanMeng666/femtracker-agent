import { useState } from 'react';
import type { HealthScore, HealthInsight } from '../types/dashboard';
import { 
  DEFAULT_HEALTH_SCORE, 
  DEFAULT_HEALTH_INSIGHTS 
} from '../constants/dashboard';
import { calculateOverallScore } from '../utils/dashboardHelpers';

export const useDashboardState = () => {
  const [healthScore, setHealthScore] = useState<HealthScore>(DEFAULT_HEALTH_SCORE);
  const [insights, setInsights] = useState<HealthInsight[]>(DEFAULT_HEALTH_INSIGHTS);

  const updateHealthScore = (scoreType: keyof HealthScore, score: number) => {
    if (score >= 0 && score <= 100) {
      setHealthScore(prev => {
        const updated = { ...prev };
        updated[scoreType] = score;
        
        // Recalculate overall score if individual scores are updated
        if (scoreType !== 'overall') {
          updated.overall = calculateOverallScore(updated);
        }
        
        return updated;
      });
    }
  };

  const addHealthInsight = (
    type: HealthInsight['type'],
    category: string,
    message: string,
    action?: string,
    actionLink?: string
  ) => {
    const validTypes = ['positive', 'warning', 'info'];
    if (validTypes.includes(type)) {
      const newInsight: HealthInsight = {
        type,
        category,
        message,
        action,
        actionLink
      };
      setInsights(prev => [...prev, newInsight]);
    }
  };

  const removeHealthInsight = (category: string) => {
    setInsights(prev => prev.filter(insight => insight.category !== category));
  };

  const updateHealthInsight = (
    category: string,
    updates: Partial<HealthInsight>
  ) => {
    setInsights(prev => 
      prev.map(insight => 
        insight.category === category 
          ? { ...insight, ...updates }
          : insight
      )
    );
  };

  return {
    healthScore,
    insights,
    updateHealthScore,
    addHealthInsight,
    removeHealthInsight,
    updateHealthInsight
  };
}; 