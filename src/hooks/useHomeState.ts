import { useState } from 'react';
import { HealthOverview, QuickRecord, PersonalizedTip } from '../types/home';
import { HealthInsight } from '../types/dashboard';
import { DEFAULT_HEALTH_OVERVIEW, DEFAULT_PERSONALIZED_TIPS } from '../constants/home';
import { DEFAULT_HEALTH_INSIGHTS } from '../constants/dashboard';

export const useHomeState = () => {
  const [healthOverview, setHealthOverview] = useState<HealthOverview>(DEFAULT_HEALTH_OVERVIEW);
  
  const [quickRecords, setQuickRecords] = useState<QuickRecord[]>([
    {
      date: new Date().toISOString().split('T')[0],
      type: 'weight',
      value: '58.5 kg',
      notes: 'Morning weight'
    }
  ]);

  const [personalizedTips, setPersonalizedTips] = useState<PersonalizedTip[]>(DEFAULT_PERSONALIZED_TIPS);
  
  const [healthInsights, setHealthInsights] = useState<HealthInsight[]>(DEFAULT_HEALTH_INSIGHTS);

  const updateHealthScore = (scoreType: string, score: number) => {
    if (score >= 0 && score <= 100) {
      setHealthOverview(prev => {
        const updated = { ...prev };
        if (scoreType === 'overall') updated.overallScore = score;
        else if (scoreType === 'cycle') updated.cycleHealth = score;
        else if (scoreType === 'nutrition') updated.nutritionScore = score;
        else if (scoreType === 'exercise') updated.exerciseScore = score;
        else if (scoreType === 'fertility') updated.fertilityScore = score;
        else if (scoreType === 'lifestyle') updated.lifestyleScore = score;
        else if (scoreType === 'symptoms') updated.symptomsScore = score;
        
        // Update last updated date
        updated.lastUpdated = new Date().toISOString().split('T')[0];
        
        // Recalculate overall score if individual scores are updated
        if (scoreType !== 'overall') {
          const avgScore = Math.round((updated.cycleHealth + updated.nutritionScore + updated.exerciseScore + updated.fertilityScore + updated.lifestyleScore + updated.symptomsScore) / 6);
          updated.overallScore = avgScore;
        }
        
        return updated;
      });
    }
  };

  const addQuickRecord = (type: string, value: string, notes?: string) => {
    const validTypes = ['weight', 'mood', 'symptom', 'exercise', 'meal', 'sleep', 'water'];
    if (validTypes.includes(type)) {
      const newRecord: QuickRecord = {
        date: new Date().toISOString().split('T')[0],
        type: type as QuickRecord['type'],
        value,
        notes
      };
      setQuickRecords(prev => [...prev, newRecord]);
    }
  };

  const addPersonalizedTip = (type: string, category: string, message: string, actionText?: string, actionLink?: string) => {
    const validTypes = ['reminder', 'suggestion', 'warning', 'achievement'];
    if (validTypes.includes(type)) {
      const newTip: PersonalizedTip = {
        id: Date.now().toString(),
        type: type as PersonalizedTip['type'],
        category,
        message,
        actionText,
        actionLink
      };
      setPersonalizedTips(prev => [...prev, newTip]);
    }
  };

  const removeTip = (tipId: string) => {
    setPersonalizedTips(prev => prev.filter(tip => tip.id !== tipId));
  };

  const addHealthInsight = (type: 'positive' | 'warning' | 'info', category: string, message: string, action?: string, actionLink?: string) => {
    const newInsight: HealthInsight = {
      type,
      category,
      message,
      action,
      actionLink
    };
    setHealthInsights(prev => [...prev, newInsight]);
  };

  const removeHealthInsight = (category: string) => {
    setHealthInsights(prev => prev.filter(insight => insight.category !== category));
  };

  return {
    healthOverview,
    quickRecords,
    personalizedTips,
    healthInsights,
    updateHealthScore,
    addQuickRecord,
    addPersonalizedTip,
    removeTip,
    addHealthInsight,
    removeHealthInsight
  };
}; 