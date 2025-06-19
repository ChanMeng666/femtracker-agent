import { useState, useEffect } from 'react';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';
import { useAuth } from './auth/useAuth';
import { 
  supabase
} from '@/lib/supabase/client';

// 前端类型定义
interface FrontendAIInsight {
  id: string;
  type: 'positive' | 'improvement' | 'warning' | 'neutral';
  category: string;
  title: string;
  description: string;
  recommendation?: string;
  confidenceScore: number;
  generatedAt: string;
}

interface FrontendHealthMetric {
  category: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  date: string;
}

interface FrontendCorrelationAnalysis {
  id: string;
  title: string;
  description: string;
  correlation: number;
  suggestion?: string;
  confidenceLevel: 'low' | 'medium' | 'high';
  generatedAt: string;
}

interface FrontendHealthTrend {
  date: string;
  value: number;
  category: string;
}

export const useInsightsStateWithDB = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 状态定义
  const [aiInsights, setAIInsights] = useState<FrontendAIInsight[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<FrontendHealthMetric[]>([]);
  const [correlationAnalyses, setCorrelationAnalyses] = useState<FrontendCorrelationAnalysis[]>([]);
  const [healthTrends, setHealthTrends] = useState<FrontendHealthTrend[]>([]);
  const [healthScore, setHealthScore] = useState<number>(75);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  // CopilotKit readable data
  useCopilotReadable({
    description: "User's comprehensive health insights data with AI analysis, correlations, and trends",
    value: {
      aiInsights,
      healthMetrics,
      correlationAnalyses,
      healthTrends,
      healthScore,
      timeRange,
      isAuthenticated: !!user,
      loading,
      totalInsights: aiInsights.length,
      positiveInsights: aiInsights.filter(i => i.type === 'positive').length,
      warningInsights: aiInsights.filter(i => i.type === 'warning').length,
      improvementInsights: aiInsights.filter(i => i.type === 'improvement').length,
      strongCorrelations: correlationAnalyses.filter(c => Math.abs(c.correlation) > 0.7).length,
      lastUpdated: new Date().toISOString()
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
  }, [user, timeRange]);

  const loadAllData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadAIInsights(),
        loadHealthMetrics(),
        loadCorrelationAnalyses(),
        loadHealthOverview(),
        loadHealthTrends()
      ]);
    } catch (err) {
      console.error('Error loading insights data:', err);
      setError('Failed to load insights data');
    } finally {
      setLoading(false);
    }
  };

  const loadAIInsights = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('generated_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error loading AI insights:', error);
      return;
    }

    if (data) {
      setAIInsights(data.map(insight => ({
        id: insight.id,
        type: insight.insight_type,
        category: insight.category,
        title: insight.title,
        description: insight.description,
        recommendation: insight.recommendation || undefined,
        confidenceScore: insight.confidence_score,
        generatedAt: insight.generated_at
      })));
    }
  };

  const loadHealthMetrics = async () => {
    if (!user) return;

    // 计算日期范围
    const endDate = new Date();
    const startDate = new Date();
    
    if (timeRange === 'week') {
      startDate.setDate(endDate.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(endDate.getMonth() - 1);
    } else {
      startDate.setMonth(endDate.getMonth() - 3);
    }

    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) {
      console.error('Error loading health metrics:', error);
      return;
    }

    if (data) {
      setHealthMetrics(data.map(metric => ({
        category: metric.category,
        score: metric.score,
        trend: metric.trend,
        color: metric.color,
        date: metric.date
      })));
    }
  };

  const loadCorrelationAnalyses = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('correlation_analyses')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('generated_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading correlation analyses:', error);
      return;
    }

    if (data) {
      setCorrelationAnalyses(data.map(analysis => ({
        id: analysis.id,
        title: analysis.title,
        description: analysis.description,
        correlation: analysis.correlation,
        suggestion: analysis.suggestion || undefined,
        confidenceLevel: analysis.confidence_level,
        generatedAt: analysis.generated_at
      })));
    }
  };

  const loadHealthOverview = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('health_overview')
      .select('overall_score')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading health overview:', error);
      return;
    }

    if (data) {
      setHealthScore(data.overall_score);
    }
  };

  const loadHealthTrends = async () => {
    if (!user) return;

    // 加载健康趋势数据（基于健康指标历史记录）
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 6); // 6个月历史数据

    const { data, error } = await supabase
      .from('health_metrics')
      .select('category, score, date')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('Error loading health trends:', error);
      return;
    }

    if (data) {
      setHealthTrends(data.map(trend => ({
        date: trend.date,
        value: trend.score,
        category: trend.category
      })));
    }
  };

  // 添加AI洞察
  const addAIInsight = async (
    type: 'positive' | 'improvement' | 'warning' | 'neutral',
    category: string,
    title: string,
    description: string,
    recommendation?: string,
    confidenceScore: number = 0.8
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .insert([{
          user_id: user.id,
          insight_type: type,
          category,
          title,
          description,
          recommendation,
          confidence_score: confidenceScore
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding AI insight:', error);
        return;
      }

      const newInsight: FrontendAIInsight = {
        id: data.id,
        type: data.insight_type,
        category: data.category,
        title: data.title,
        description: data.description,
        recommendation: data.recommendation || undefined,
        confidenceScore: data.confidence_score,
        generatedAt: data.generated_at
      };

      setAIInsights(prev => [newInsight, ...prev]);
    } catch (err) {
      console.error('Error adding AI insight:', err);
    }
  };

  // 添加健康指标
  const addHealthMetric = async (
    category: string,
    score: number,
    trend: 'up' | 'down' | 'stable',
    color: string
  ) => {
    if (!user || score < 0 || score > 100) return;

    try {
      const { data, error } = await supabase
        .from('health_metrics')
        .insert([{
          user_id: user.id,
          category,
          score,
          trend,
          color,
          date: new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding health metric:', error);
        return;
      }

      const newMetric: FrontendHealthMetric = {
        category: data.category,
        score: data.score,
        trend: data.trend,
        color: data.color,
        date: data.date
      };

      setHealthMetrics(prev => [newMetric, ...prev]);
    } catch (err) {
      console.error('Error adding health metric:', err);
    }
  };

  // 添加相关性分析
  const addCorrelationAnalysis = async (
    title: string,
    description: string,
    correlation: number,
    suggestion?: string,
    confidenceLevel: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    if (!user || correlation < -1 || correlation > 1) return;

    try {
      const { data, error } = await supabase
        .from('correlation_analyses')
        .insert([{
          user_id: user.id,
          title,
          description,
          correlation,
          suggestion,
          confidence_level: confidenceLevel
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding correlation analysis:', error);
        return;
      }

      const newAnalysis: FrontendCorrelationAnalysis = {
        id: data.id,
        title: data.title,
        description: data.description,
        correlation: data.correlation,
        suggestion: data.suggestion || undefined,
        confidenceLevel: data.confidence_level,
        generatedAt: data.generated_at
      };

      setCorrelationAnalyses(prev => [newAnalysis, ...prev]);
    } catch (err) {
      console.error('Error adding correlation analysis:', err);
    }
  };

  // 删除AI洞察
  const removeAIInsight = async (insightId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('ai_insights')
        .update({ is_active: false })
        .eq('id', insightId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing AI insight:', error);
        return;
      }

      setAIInsights(prev => prev.filter(insight => insight.id !== insightId));
    } catch (err) {
      console.error('Error removing AI insight:', err);
    }
  };

  // 删除相关性分析
  const removeCorrelationAnalysis = async (analysisId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('correlation_analyses')
        .update({ is_active: false })
        .eq('id', analysisId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing correlation analysis:', error);
        return;
      }

      setCorrelationAnalyses(prev => prev.filter(analysis => analysis.id !== analysisId));
    } catch (err) {
      console.error('Error removing correlation analysis:', err);
    }
  };

  // 更新时间范围
  const updateTimeRange = (newTimeRange: 'week' | 'month' | 'quarter') => {
    setTimeRange(newTimeRange);
  };

  // CopilotKit Actions
  useCopilotAction({
    name: "addAIInsight",
    description: "Add a new AI-generated health insight",
    parameters: [
      {
        name: "type",
        type: "string",
        description: "Insight type (positive, improvement, warning, neutral)",
        required: true,
      },
      {
        name: "category",
        type: "string",
        description: "Health category",
        required: true,
      },
      {
        name: "title",
        type: "string",
        description: "Insight title",
        required: true,
      },
      {
        name: "description",
        type: "string",
        description: "Insight description",
        required: true,
      },
      {
        name: "recommendation",
        type: "string",
        description: "Optional recommendation",
        required: false,
      },
      {
        name: "confidenceScore",
        type: "number",
        description: "Confidence score (0-1)",
        required: false,
      }
    ],
    handler: async ({ type, category, title, description, recommendation, confidenceScore }) => {
      await addAIInsight(
        type as 'positive' | 'improvement' | 'warning' | 'neutral',
        category,
        title,
        description,
        recommendation,
        confidenceScore || 0.8
      );
      return `Added AI insight: ${title}`;
    },
  });

  useCopilotAction({
    name: "addHealthMetric",
    description: "Add a new health metric",
    parameters: [
      {
        name: "category",
        type: "string",
        description: "Health metric category",
        required: true,
      },
      {
        name: "score",
        type: "number",
        description: "Health score (0-100)",
        required: true,
      },
      {
        name: "trend",
        type: "string",
        description: "Trend direction (up, down, stable)",
        required: true,
      },
      {
        name: "color",
        type: "string",
        description: "Color code for visualization",
        required: true,
      }
    ],
    handler: async ({ category, score, trend, color }) => {
      await addHealthMetric(
        category,
        score,
        trend as 'up' | 'down' | 'stable',
        color
      );
      return `Added health metric: ${category} - ${score}`;
    },
  });

  useCopilotAction({
    name: "addCorrelationAnalysis",
    description: "Add a new correlation analysis",
    parameters: [
      {
        name: "title",
        type: "string",
        description: "Analysis title",
        required: true,
      },
      {
        name: "description",
        type: "string",
        description: "Analysis description",
        required: true,
      },
      {
        name: "correlation",
        type: "number",
        description: "Correlation coefficient (-1 to 1)",
        required: true,
      },
      {
        name: "suggestion",
        type: "string",
        description: "Optional suggestion",
        required: false,
      },
      {
        name: "confidenceLevel",
        type: "string",
        description: "Confidence level (low, medium, high)",
        required: false,
      }
    ],
    handler: async ({ title, description, correlation, suggestion, confidenceLevel }) => {
      await addCorrelationAnalysis(
        title,
        description,
        correlation,
        suggestion,
        confidenceLevel as 'low' | 'medium' | 'high' || 'medium'
      );
      return `Added correlation analysis: ${title}`;
    },
  });

  useCopilotAction({
    name: "updateTimeRange",
    description: "Update the time range for insights analysis",
    parameters: [
      {
        name: "timeRange",
        type: "string",
        description: "Time range (week, month, quarter)",
        required: true,
      }
    ],
    handler: async ({ timeRange }) => {
      updateTimeRange(timeRange as 'week' | 'month' | 'quarter');
      return `Updated time range to ${timeRange}`;
    },
  });

  return {
    aiInsights,
    healthMetrics,
    correlationAnalyses,
    healthTrends,
    healthScore,
    timeRange,
    loading,
    error,
    addAIInsight,
    addHealthMetric,
    addCorrelationAnalysis,
    removeAIInsight,
    removeCorrelationAnalysis,
    updateTimeRange,
    refetch: loadAllData
  };
};
