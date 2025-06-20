import { useState, useEffect } from 'react';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';
import { useAuth } from './auth/useAuth';
import { 
  supabaseRest
} from '@/lib/supabase/restClient';

// 适配器接口 - 将数据库类型转换为前端类型
interface FrontendHealthOverview {
  overallScore: number;
  cycleHealth: number;
  nutritionScore: number;
  exerciseScore: number;
  fertilityScore: number;
  lifestyleScore: number;
  symptomsScore: number;
  lastUpdated: string;
}

interface FrontendQuickRecord {
  date: string;
  type: 'weight' | 'mood' | 'symptom' | 'exercise' | 'meal' | 'sleep' | 'water';
  value: string;
  notes?: string;
}

interface FrontendPersonalizedTip {
  id: string;
  type: 'reminder' | 'suggestion' | 'warning' | 'achievement';
  category: string;
  message: string;
  actionText?: string;
  actionLink?: string;
}

interface FrontendHealthInsight {
  type: 'positive' | 'warning' | 'info';
  category: string;
  message: string;
  action?: string;
  actionLink?: string;
}

interface DatabaseRecord {
  [key: string]: unknown;
}

interface DatabaseHealthOverview {
  overall_score: number;
  cycle_health: number;
  nutrition_score: number;
  exercise_score: number;
  fertility_score: number;
  lifestyle_score: number;
  symptoms_score: number;
  last_updated: string;
}

interface DatabaseQuickRecord {
  date: string;
  record_type: string;
  value: string;
  notes?: string;
}

interface DatabasePersonalizedTip {
  id: string;
  tip_type: string;
  category: string;
  message: string;
  action_text?: string;
  action_link?: string;
}

interface DatabaseInsight {
  insight_type: string;
  category: string;
  description: string;
  recommendation?: string;
  action_required?: boolean;
}

export const useHomeStateWithDB = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 状态定义
  const [healthOverview, setHealthOverview] = useState<FrontendHealthOverview>({
    overallScore: 75,
    cycleHealth: 75,
    nutritionScore: 75,
    exerciseScore: 75,
    fertilityScore: 75,
    lifestyleScore: 75,
    symptomsScore: 75,
    lastUpdated: new Date().toISOString().split('T')[0]
  });

  const [quickRecords, setQuickRecords] = useState<FrontendQuickRecord[]>([]);
  const [personalizedTips, setPersonalizedTips] = useState<FrontendPersonalizedTip[]>([]);
  const [healthInsights, setHealthInsights] = useState<FrontendHealthInsight[]>([]);

  // CopilotKit readable data
  useCopilotReadable({
    description: "User's complete health dashboard data with real-time database integration",
    value: {
      healthOverview,
      quickRecords,
      personalizedTips,
      healthInsights,
      isAuthenticated: !!user,
      loading,
      totalTips: personalizedTips.length,
      activeTips: personalizedTips.length,
      totalInsights: healthInsights.length,
      recentRecords: quickRecords.slice(0, 5)
    }
  });

  // 从数据库加载数据
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadHealthOverview(),
        loadQuickRecords(),
        loadPersonalizedTips(),
        loadHealthInsights()
      ]);
    } catch (err) {
      console.error('Error loading home data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadHealthOverview = async () => {
    if (!user) return;

    const { data, error } = await supabaseRest
      .from('health_overview')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.message !== 'No rows returned') {
      console.error('Error loading health overview:', error);
      return;
    }

    if (data) {
      setHealthOverview({
        overallScore: data.overall_score,
        cycleHealth: data.cycle_health,
        nutritionScore: data.nutrition_score,
        exerciseScore: data.exercise_score,
        fertilityScore: data.fertility_score,
        lifestyleScore: data.lifestyle_score,
        symptomsScore: data.symptoms_score,
        lastUpdated: data.last_updated
      });
    }
  };

  const loadQuickRecords = async () => {
    if (!user) return;

    const { data, error } = await supabaseRest
      .from('quick_records')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading quick records:', error);
      return;
    }

    if (data) {
      setQuickRecords((data as DatabaseQuickRecord[]).map(record => ({
        date: record.date,
        type: record.record_type as FrontendQuickRecord['type'],
        value: record.value,
        notes: record.notes || undefined
      })));
    }
  };

  const loadPersonalizedTips = async () => {
    if (!user) return;

    const { data, error } = await supabaseRest
      .from('personalized_tips')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error loading personalized tips:', error);
      return;
    }

    if (data) {
      setPersonalizedTips((data as DatabasePersonalizedTip[]).map(tip => ({
        id: tip.id,
        type: tip.tip_type,
        category: tip.category,
        message: tip.message,
        actionText: tip.action_text || undefined,
        actionLink: tip.action_link || undefined
      })));
    }
  };

  const loadHealthInsights = async () => {
    if (!user) return;

    try {
      // First try loading from new ai_insights table
      const { data: aiData, error: aiError } = await supabaseRest
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('generated_at', { ascending: false })
        .limit(3);

      // Then load from original health_insights table
      const { data: healthData, error: healthError } = await supabaseRest
        .from('health_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(2);

      const insights: FrontendHealthInsight[] = [];

      // Add AI insights if they exist
      if (aiData && !aiError) {
        insights.push(...(aiData as DatabaseInsight[]).map(insight => ({
          type: (insight.insight_type === 'positive' ? 'positive' : 
                insight.insight_type === 'warning' ? 'warning' : 'info') as FrontendHealthInsight['type'],
          category: insight.category,
          message: insight.description,
          action: insight.recommendation || undefined,
          actionLink: undefined
        })));
      }

      // Add traditional health insights if they exist
      if (healthData && !healthError) {
        insights.push(...(healthData as DatabaseInsight[]).map(insight => ({
          type: (insight.insight_type === 'warning' ? 'warning' : 'info') as FrontendHealthInsight['type'],
          category: insight.category,
          message: insight.description,
          action: insight.action_required ? 'Review' : undefined,
          actionLink: undefined
        })));
      }

      setHealthInsights(insights);
    } catch (err) {
      console.error('Error loading health insights:', err);
    }
  };

  // 更新健康分数
  const updateHealthScore = async (scoreType: string, score: number) => {
    if (!user || score < 0 || score > 100) return;

    try {
      const updates: DatabaseRecord = {};
      
      if (scoreType === 'overall') updates.overall_score = score;
      else if (scoreType === 'cycle') updates.cycle_health = score;
      else if (scoreType === 'nutrition') updates.nutrition_score = score;
      else if (scoreType === 'exercise') updates.exercise_score = score;
      else if (scoreType === 'fertility') updates.fertility_score = score;
      else if (scoreType === 'lifestyle') updates.lifestyle_score = score;
      else if (scoreType === 'symptoms') updates.symptoms_score = score;

      if (Object.keys(updates).length === 0) return;

      // If not updating overall score, need to recalculate overall score
      if (scoreType !== 'overall') {
        const currentOverview = { ...healthOverview };
        if (scoreType === 'cycle') currentOverview.cycleHealth = score;
        else if (scoreType === 'nutrition') currentOverview.nutritionScore = score;
        else if (scoreType === 'exercise') currentOverview.exerciseScore = score;
        else if (scoreType === 'fertility') currentOverview.fertilityScore = score;
        else if (scoreType === 'lifestyle') currentOverview.lifestyleScore = score;
        else if (scoreType === 'symptoms') currentOverview.symptomsScore = score;

        const avgScore = Math.round(
          (currentOverview.cycleHealth + currentOverview.nutritionScore + 
           currentOverview.exerciseScore + currentOverview.fertilityScore + 
           currentOverview.lifestyleScore + currentOverview.symptomsScore) / 6
        );
        updates.overall_score = avgScore;
      }

      updates.last_updated = new Date().toISOString().split('T')[0];

      const { error } = await supabaseRest
        .from('health_overview')
        .upsert([{ user_id: user.id, ...updates }]);

      if (error) {
        console.error('Error updating health score:', error);
        return;
      }

      // Update local state
      setHealthOverview(prev => ({
        ...prev,
        overallScore: (updates.overall_score as number) || prev.overallScore,
        cycleHealth: (updates.cycle_health as number) || prev.cycleHealth,
        nutritionScore: (updates.nutrition_score as number) || prev.nutritionScore,
        exerciseScore: (updates.exercise_score as number) || prev.exerciseScore,
        fertilityScore: (updates.fertility_score as number) || prev.fertilityScore,
        lifestyleScore: (updates.lifestyle_score as number) || prev.lifestyleScore,
        symptomsScore: (updates.symptoms_score as number) || prev.symptomsScore,
        lastUpdated: (updates.last_updated as string) || prev.lastUpdated
      }));
    } catch (err) {
      console.error('Error updating health score:', err);
    }
  };

  // 添加快速记录
  const addQuickRecord = async (type: string, value: string, notes?: string) => {
    if (!user) return;

    const validTypes = ['weight', 'mood', 'symptom', 'exercise', 'meal', 'sleep', 'water'];
    if (!validTypes.includes(type)) return;

    try {
      const { data, error } = await supabaseRest
        .from('quick_records')
        .insert([{
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          record_type: type,
          value,
          notes
        }]);

      if (error) {
        console.error('Error adding quick record:', error);
        return;
      }

      // Update local state
      const newRecord: FrontendQuickRecord = {
        date: data[0].date,
        type: data[0].record_type as FrontendQuickRecord['type'],
        value: data[0].value,
        notes: data[0].notes || undefined
      };

      setQuickRecords(prev => [newRecord, ...prev.slice(0, 9)]);
    } catch (err) {
      console.error('Error adding quick record:', err);
    }
  };

  // 添加个性化提示
  const addPersonalizedTip = async (type: string, category: string, message: string, actionText?: string, actionLink?: string) => {
    if (!user) return;

    const validTypes = ['reminder', 'suggestion', 'warning', 'achievement'];
    if (!validTypes.includes(type)) return;

    try {
      const { data, error } = await supabaseRest
        .from('personalized_tips')
        .insert([{
          user_id: user.id,
          tip_type: type,
          category,
          message,
          action_text: actionText,
          action_link: actionLink
        }]);

      if (error) {
        console.error('Error adding personalized tip:', error);
        return;
      }

      const newTip: FrontendPersonalizedTip = {
        id: data[0].id,
        type: data[0].tip_type,
        category: data[0].category,
        message: data[0].message,
        actionText: data[0].action_text || undefined,
        actionLink: data[0].action_link || undefined
      };

      setPersonalizedTips(prev => [newTip, ...prev]);
    } catch (err) {
      console.error('Error adding personalized tip:', err);
    }
  };

  // 删除提示
  const removeTip = async (tipId: string) => {
    if (!user) return;

    try {
      const { error } = await supabaseRest
        .from('personalized_tips')
        .update({ is_active: false })
        .eq('id', tipId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing tip:', error);
        return;
      }

      setPersonalizedTips(prev => prev.filter(tip => tip.id !== tipId));
    } catch (err) {
      console.error('Error removing tip:', err);
    }
  };

  // 添加健康洞察
  const addHealthInsight = async (type: 'positive' | 'warning' | 'info', category: string, message: string, action?: string) => {
    if (!user) return;

    try {
      // 尝试添加到新的ai_insights表
      const { data, error } = await supabaseRest
        .from('ai_insights')
        .insert([{
          user_id: user.id,
          insight_type: type === 'positive' ? 'positive' : type === 'warning' ? 'warning' : 'neutral',
          category,
          title: `${category} insight`,
          description: message,
          recommendation: action,
          confidence_score: 0.8
        }]);

      if (error) {
        console.error('Error adding AI insight:', error);
        return;
      }

      const newInsight: FrontendHealthInsight = {
        type: type,
        category: data[0].category,
        message: data[0].description,
        action: data[0].recommendation || undefined,
        actionLink: undefined
      };

      setHealthInsights(prev => [newInsight, ...prev]);
    } catch (err) {
      console.error('Error adding health insight:', err);
    }
  };

  // 删除健康洞察
  const removeHealthInsight = async (category: string) => {
    if (!user) return;

    try {
      // 从ai_insights表删除
      const { error } = await supabaseRest
        .from('ai_insights')
        .update({ is_active: false })
        .eq('category', category)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing AI insight:', error);
        return;
      }

      setHealthInsights(prev => prev.filter(insight => insight.category !== category));
    } catch (err) {
      console.error('Error removing health insight:', err);
    }
  };

  // CopilotKit Actions
  useCopilotAction({
    name: "updateHealthScore",
    description: "Update health score for a specific category",
    parameters: [
      {
        name: "scoreType",
        type: "string",
        description: "Score type (overall, cycle, nutrition, exercise, fertility, lifestyle, symptoms)",
        required: true,
      },
      {
        name: "score",
        type: "number",
        description: "Score value (0-100)",
        required: true,
      }
    ],
    handler: async ({ scoreType, score }) => {
      await updateHealthScore(scoreType, score);
      return `Updated ${scoreType} score to ${score}`;
    },
  });

  useCopilotAction({
    name: "addQuickRecord",
    description: "Add a quick health record",
    parameters: [
      {
        name: "type",
        type: "string",
        description: "Record type (weight, mood, symptom, exercise, meal, sleep, water)",
        required: true,
      },
      {
        name: "value",
        type: "string",
        description: "Record value",
        required: true,
      },
      {
        name: "notes",
        type: "string",
        description: "Optional notes",
        required: false,
      }
    ],
    handler: async ({ type, value, notes }) => {
      await addQuickRecord(type, value, notes);
      return `Added ${type} record: ${value}`;
    },
  });

  return {
    healthOverview,
    quickRecords,
    personalizedTips,
    healthInsights,
    loading,
    error,
    updateHealthScore,
    addQuickRecord,
    addPersonalizedTip,
    removeTip,
    addHealthInsight,
    removeHealthInsight,
    refetch: loadAllData
  };
};
