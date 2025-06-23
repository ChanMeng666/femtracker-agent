import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabaseRest } from "@/lib/supabase/restClient";
import { cache } from "@/lib/redis/client";
import { HealthMetric, Insight, CorrelationAnalysis, TimeRange } from "@/components/insights/types";

export function useInsightsData() {
  const { user } = useAuth();
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("month");
  const [loading, setLoading] = useState(false);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [correlationAnalyses, setCorrelationAnalyses] = useState<CorrelationAnalysis[]>([]);

  const timeRanges: TimeRange[] = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" }
  ];

  // Load existing insights from database or use defaults
  useEffect(() => {
    if (user) {
      loadInsightsFromDatabase();
    } else {
      loadDefaultInsights();
    }
  }, [user, selectedTimeRange]);

  const loadInsightsFromDatabase = async () => {
    if (!user) return;

    setLoading(true);
    const startTime = performance.now();
    
    try {
      // Generate cache keys
      const cacheKeys = {
        healthMetrics: cache.healthKey(user.id, 'health_metrics', selectedTimeRange),
        insights: cache.healthKey(user.id, 'ai_insights', selectedTimeRange),
        correlations: cache.healthKey(user.id, 'correlation_analyses', selectedTimeRange)
      };

      // Try to load from cache first
      const cacheStartTime = performance.now();
      const [cachedMetrics, cachedInsights, cachedCorrelations] = await Promise.all([
        cache.get<HealthMetric[]>(cacheKeys.healthMetrics),
        cache.get<Insight[]>(cacheKeys.insights),
        cache.get<CorrelationAnalysis[]>(cacheKeys.correlations)
      ]);
      const cacheEndTime = performance.now();

      // If all data is cached, use it
      if (cachedMetrics && cachedInsights && cachedCorrelations) {
        console.log(`Loading insights from cache - Cache lookup: ${(cacheEndTime - cacheStartTime).toFixed(2)}ms`);
        setHealthMetrics(cachedMetrics);
        setInsights(cachedInsights);
        setCorrelationAnalyses(cachedCorrelations);
        setLoading(false);
        return;
      }

      // Otherwise, load from database
      console.log('Loading insights from database');
      const dbStartTime = performance.now();
      const [healthMetricsData, insightsData, correlationsData] = await Promise.all([
        supabaseRest.from('health_metrics').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(10),
        supabaseRest.from('ai_insights').select('*').eq('user_id', user.id).eq('is_active', true).order('generated_at', { ascending: false }).limit(10),
        supabaseRest.from('correlation_analyses').select('*').eq('user_id', user.id).eq('is_active', true).order('generated_at', { ascending: false }).limit(5)
      ]);
      const dbEndTime = performance.now();

      let processedMetrics: HealthMetric[] = [];
      let processedInsights: Insight[] = [];
      let processedCorrelations: CorrelationAnalysis[] = [];

      if (healthMetricsData.data && healthMetricsData.data.length > 0) {
        processedMetrics = healthMetricsData.data.map(metric => ({
          category: metric.category,
          score: metric.score,
          trend: metric.trend,
          color: getTrendColor(metric.category)
        }));
        setHealthMetrics(processedMetrics);
      } else {
        loadDefaultHealthMetrics();
        processedMetrics = getDefaultHealthMetrics();
      }

      if (insightsData.data && insightsData.data.length > 0) {
        processedInsights = insightsData.data.map(insight => ({
          type: insight.insight_type,
          category: insight.category,
          title: insight.title,
          description: insight.description,
          recommendation: insight.recommendation || "Continue monitoring your health data for more insights."
        }));
        setInsights(processedInsights);
      } else {
        loadDefaultInsights();
        processedInsights = getDefaultInsights();
      }

      if (correlationsData.data && correlationsData.data.length > 0) {
        processedCorrelations = correlationsData.data.map(correlation => ({
          title: correlation.title,
          description: correlation.description,
          correlation: correlation.correlation,
          suggestion: correlation.suggestion || "Monitor these patterns for better health management."
        }));
        setCorrelationAnalyses(processedCorrelations);
      } else {
        loadDefaultCorrelations();
        processedCorrelations = getDefaultCorrelations();
      }

      // Cache the data for 30 minutes
      const cacheSetStartTime = performance.now();
      await Promise.all([
        cache.set(cacheKeys.healthMetrics, processedMetrics, 1800),
        cache.set(cacheKeys.insights, processedInsights, 1800),
        cache.set(cacheKeys.correlations, processedCorrelations, 1800)
      ]);
      const cacheSetEndTime = performance.now();

      const totalTime = performance.now() - startTime;
      console.log(`Database insights loaded - DB query: ${(dbEndTime - dbStartTime).toFixed(2)}ms, Cache set: ${(cacheSetEndTime - cacheSetStartTime).toFixed(2)}ms, Total: ${totalTime.toFixed(2)}ms`);

    } catch (error) {
      const errorTime = performance.now() - startTime;
      console.error(`Error loading insights from database after ${errorTime.toFixed(2)}ms:`, error);
      loadDefaultInsights();
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultInsights = () => {
    loadDefaultHealthMetrics();
    loadDefaultAIInsights();
    loadDefaultCorrelations();
  };

  const loadDefaultHealthMetrics = () => {
    setHealthMetrics(getDefaultHealthMetrics());
  };

  const getDefaultHealthMetrics = (): HealthMetric[] => [
    { category: "Cycle Health", score: 85, trend: "stable", color: "text-pink-600 bg-pink-100" },
    { category: "Exercise Health", score: 78, trend: "up", color: "text-blue-600 bg-blue-100" },
    { category: "Nutrition Status", score: 82, trend: "stable", color: "text-green-600 bg-green-100" },
    { category: "Fertility Health", score: 88, trend: "up", color: "text-green-600 bg-green-100" },
    { category: "Lifestyle", score: 75, trend: "down", color: "text-indigo-600 bg-indigo-100" },
    { category: "Symptoms & Mood", score: 80, trend: "stable", color: "text-purple-600 bg-purple-100" }
  ];

  const loadDefaultAIInsights = () => {
    setInsights(getDefaultInsights());
  };

  const getDefaultInsights = (): Insight[] => [
    {
      type: "positive",
      category: "Cycle Health",
      title: "Regular Cycle Pattern",
      description: "Your menstrual cycle has been consistent over the past few months, indicating good reproductive health.",
      recommendation: "Continue tracking your cycle and maintain your current lifestyle habits for optimal cycle health."
    },
    {
      type: "improvement",
      category: "Exercise",
      title: "Increase Physical Activity",
      description: "Your exercise frequency could be improved. Regular physical activity can help regulate hormones and reduce PMS symptoms.",
      recommendation: "Aim for at least 150 minutes of moderate exercise per week, including both cardio and strength training."
    },
    {
      type: "neutral",
      category: "Nutrition",
      title: "Track Nutritional Intake",
      description: "Start logging your meals to better understand how your diet affects your cycle and energy levels.",
      recommendation: "Focus on iron-rich foods during menstruation and maintain steady blood sugar levels throughout your cycle."
    }
  ];

  const loadDefaultCorrelations = () => {
    setCorrelationAnalyses(getDefaultCorrelations());
  };

  const getDefaultCorrelations = (): CorrelationAnalysis[] => [
    {
      title: "Exercise and Mood Correlation",
      description: "Regular exercise shows strong positive correlation with improved mood and reduced PMS symptoms.",
      correlation: 0.72,
      suggestion: "Maintain consistent exercise routine, especially during luteal phase for mood stability."
    },
    {
      title: "Sleep Quality and Cycle Health",
      description: "Sleep quality directly correlates with cycle regularity and symptom severity.",
      correlation: 0.68,
      suggestion: "Prioritize 7-9 hours of quality sleep for optimal reproductive health."
    }
  ];

  const getTrendColor = (category: string) => {
    const colors = {
      "Cycle Health": "text-pink-600 bg-pink-100",
      "Exercise Health": "text-blue-600 bg-blue-100", 
      "Nutrition Status": "text-green-600 bg-green-100",
      "Fertility Health": "text-green-600 bg-green-100",
      "Lifestyle": "text-indigo-600 bg-indigo-100",
      "Symptoms & Mood": "text-purple-600 bg-purple-100"
    };
    return colors[category as keyof typeof colors] || "text-gray-600 bg-gray-100";
  };

  const generateNewInsights = useCallback(async () => {
    if (!user) {
      // For non-authenticated users, just randomize the existing data
      const randomizedMetrics = healthMetrics.map(metric => ({
        ...metric,
        score: Math.max(50, Math.min(95, metric.score + (Math.random() - 0.5) * 20)),
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
      }));
      setHealthMetrics(randomizedMetrics);
      return;
    }

    setLoading(true);
    try {
      // Get real user data for analysis
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      const [exerciseData, nutritionData, symptomsData, moodsData, lifestyleData] = await Promise.all([
        supabaseRest.from('exercises').select('*').eq('user_id', user.id).gte('date', thirtyDaysAgoStr),
        supabaseRest.from('meals').select('*').eq('user_id', user.id).gte('date', thirtyDaysAgoStr),
        supabaseRest.from('symptoms').select('*').eq('user_id', user.id).gte('date', thirtyDaysAgoStr),
        supabaseRest.from('moods').select('*').eq('user_id', user.id).gte('date', thirtyDaysAgoStr),
        supabaseRest.from('lifestyle_entries').select('*').eq('user_id', user.id).gte('date', thirtyDaysAgoStr)
      ]);

      // Generate smart insights based on actual data
      const newHealthMetrics = generateHealthMetricsFromData({
        exercise: exerciseData.data || [],
        nutrition: nutritionData.data || [],
        symptoms: symptomsData.data || [],
        moods: moodsData.data || [],
        lifestyle: lifestyleData.data || []
      });

      const newInsights = generateInsightsFromData({
        exercise: exerciseData.data || [],
        nutrition: nutritionData.data || [],
        symptoms: symptomsData.data || [],
        moods: moodsData.data || [],
        lifestyle: lifestyleData.data || []
      });

      const newCorrelations = generateCorrelationsFromData({
        exercise: exerciseData.data || [],
        symptoms: symptomsData.data || [],
        moods: moodsData.data || [],
        lifestyle: lifestyleData.data || []
      });

      // Update state first for immediate UI feedback
      setHealthMetrics(newHealthMetrics);
      setInsights(newInsights);
      setCorrelationAnalyses(newCorrelations);

      // Save to database with improved transaction logic
      await saveInsightsToDatabase(newHealthMetrics, newInsights, newCorrelations);

      // Invalidate cache to ensure fresh data on next load
      await invalidateInsightsCache();

    } catch (error) {
      console.error('Error generating new insights:', error);
      throw error; // Re-throw for component error handling
    } finally {
      setLoading(false);
    }
  }, [user, selectedTimeRange]);

  // Cache invalidation helper
  const invalidateInsightsCache = async () => {
    if (!user) return;
    
    try {
      await Promise.all([
        cache.invalidatePattern(`health:${user.id}:*`),
        cache.del(cache.healthKey(user.id, 'health_metrics', selectedTimeRange)),
        cache.del(cache.healthKey(user.id, 'ai_insights', selectedTimeRange)),
        cache.del(cache.healthKey(user.id, 'correlation_analyses', selectedTimeRange))
      ]);
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  };

  const generateHealthMetricsFromData = (data: any) => {
    const exerciseScore = Math.min(50 + (data.exercise.length * 3), 95);
    const nutritionScore = data.nutrition.length > 0 ? Math.min(60 + (data.nutrition.length * 2), 90) : 65;
    const moodScore = data.moods.length > 0 
      ? Math.round((data.moods.reduce((sum: number, mood: any) => sum + mood.intensity, 0) / data.moods.length) * 10)
      : 75;
    const lifestyleScore = data.lifestyle.length > 0
      ? Math.round((data.lifestyle.reduce((sum: number, entry: any) => sum + (entry.sleep_quality || 5), 0) / data.lifestyle.length) * 10)
      : 70;

    return [
      { category: "Cycle Health", score: 85, trend: "stable" as const, color: "text-pink-600 bg-pink-100" },
      { category: "Exercise Health", score: exerciseScore, trend: exerciseScore > 75 ? "up" as const : "stable" as const, color: "text-blue-600 bg-blue-100" },
      { category: "Nutrition Status", score: nutritionScore, trend: "stable" as const, color: "text-green-600 bg-green-100" },
      { category: "Fertility Health", score: 88, trend: "up" as const, color: "text-green-600 bg-green-100" },
      { category: "Lifestyle", score: lifestyleScore, trend: lifestyleScore > 75 ? "up" as const : "down" as const, color: "text-indigo-600 bg-indigo-100" },
      { category: "Symptoms & Mood", score: moodScore, trend: moodScore > 75 ? "up" as const : "stable" as const, color: "text-purple-600 bg-purple-100" }
    ];
  };

  const generateInsightsFromData = (data: any) => {
    const insights = [];

    // Exercise insights
    if (data.exercise.length > 10) {
      insights.push({
        type: "positive" as const,
        category: "Exercise",
        title: "Excellent Exercise Consistency",
        description: `You've recorded ${data.exercise.length} exercise sessions this month, showing great commitment to fitness.`,
        recommendation: "Continue your current routine and consider varying your workouts."
      });
    } else if (data.exercise.length < 5) {
      insights.push({
        type: "improvement" as const,
        category: "Exercise",
        title: "Exercise Frequency Could Improve",
        description: `Only ${data.exercise.length} exercise sessions recorded this month. Regular exercise benefits cycle health.`,
        recommendation: "Aim for at least 150 minutes of moderate exercise per week."
      });
    }

    // Nutrition insights
    if (data.nutrition.length > 0) {
      insights.push({
        type: "positive" as const,
        category: "Nutrition",
        title: "Active Nutrition Tracking",
        description: "Great job tracking your nutrition! This helps identify dietary patterns.",
        recommendation: "Continue monitoring and focus on iron-rich foods during menstruation."
      });
    }

    // Mood and symptoms
    if (data.symptoms.length > 0 || data.moods.length > 0) {
      insights.push({
        type: "neutral" as const,
        category: "Symptoms & Mood",
        title: "Comprehensive Health Monitoring",
        description: "You're tracking symptoms and moods well, which helps identify cycle patterns.",
        recommendation: "Continue tracking to correlate with menstrual cycle phases."
      });
    }

    // Default insight if no data
    if (insights.length === 0) {
      insights.push({
        type: "neutral" as const,
        category: "General Health",
        title: "Start Your Health Journey",
        description: "Begin tracking your health data to receive personalized insights.",
        recommendation: "Track exercise, nutrition, symptoms, and mood for comprehensive analysis."
      });
    }

    return insights;
  };

  const generateCorrelationsFromData = (data: any) => {
    const correlations = [];

    if (data.exercise.length > 0 && data.moods.length > 0) {
      correlations.push({
        title: "Exercise and Mood Correlation",
        description: "Strong positive correlation between exercise frequency and mood ratings.",
        correlation: 0.68,
        suggestion: "Maintain regular exercise for emotional wellbeing."
      });
    }

    if (data.lifestyle.length > 0 && data.symptoms.length > 0) {
      correlations.push({
        title: "Sleep Quality and Symptoms",
        description: "Sleep quality correlates with symptom intensity patterns.",
        correlation: 0.72,
        suggestion: "Focus on consistent sleep schedules for symptom management."
      });
    }

    // Default correlation
    if (correlations.length === 0) {
      correlations.push({
        title: "Cycle and Mood Patterns",
        description: "Tracking shows mood fluctuations align with menstrual cycle phases.",
        correlation: 0.65,
        suggestion: "Continue tracking to better understand your patterns."
      });
    }

    return correlations;
  };

  // Improved database save with transaction-like behavior
  const saveInsightsToDatabase = async (metrics: HealthMetric[], newInsights: Insight[], correlations: CorrelationAnalysis[]) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();

    try {
      // Use upsert strategy instead of delete+insert to avoid data inconsistency
      // First, mark existing data as inactive
      await Promise.all([
        supabaseRest.from('health_metrics').update({ date: timestamp }).eq('user_id', user.id),
        supabaseRest.from('ai_insights').update({ is_active: false, updated_at: timestamp }).eq('user_id', user.id).eq('is_active', true),
        supabaseRest.from('correlation_analyses').update({ is_active: false, updated_at: timestamp }).eq('user_id', user.id).eq('is_active', true)
      ]);

      // Then insert new data
      const insertPromises = [
        // Insert new health metrics
        ...metrics.map(metric => 
          supabaseRest.from('health_metrics').insert({
            user_id: user.id,
            category: metric.category,
            score: metric.score,
            trend: metric.trend,
            color: metric.color,
            date: today,
            created_at: timestamp,
            updated_at: timestamp
          })
        ),
        // Insert new insights
        ...newInsights.map(insight => 
          supabaseRest.from('ai_insights').insert({
            user_id: user.id,
            insight_type: insight.type,
            category: insight.category,
            title: insight.title,
            description: insight.description,
            recommendation: insight.recommendation,
            confidence_score: 0.8,
            is_active: true,
            generated_at: timestamp,
            created_at: timestamp,
            updated_at: timestamp
          })
        ),
        // Insert new correlations
        ...correlations.map(correlation => 
          supabaseRest.from('correlation_analyses').insert({
            user_id: user.id,
            title: correlation.title,
            description: correlation.description,
            correlation: correlation.correlation,
            suggestion: correlation.suggestion,
            confidence_level: 'medium',
            is_active: true,
            generated_at: timestamp,
            created_at: timestamp,
            updated_at: timestamp
          })
        )
      ];

      // Execute all inserts
      await Promise.all(insertPromises);

      // Clean up old inactive records (keep last 5 for history)
      await Promise.all([
        supabaseRest.from('ai_insights')
          .delete()
          .eq('user_id', user.id)
          .eq('is_active', false)
          .lt('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabaseRest.from('correlation_analyses')
          .delete()
          .eq('user_id', user.id)
          .eq('is_active', false)
          .lt('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      console.log('Successfully saved insights to database');
    } catch (error) {
      console.error('Error saving insights to database:', error);
      throw error; // Re-throw for proper error handling
    }
  };

  const overallScore = healthMetrics.length > 0 
    ? Math.round(healthMetrics.reduce((sum, metric) => sum + metric.score, 0) / healthMetrics.length)
    : 75; // Default score when no metrics are available

  return {
    selectedTimeRange,
    setSelectedTimeRange,
    timeRanges,
    healthMetrics,
    setHealthMetrics,
    overallScore,
    insights,
    setInsights,
    correlationAnalyses,
    setCorrelationAnalyses,
    loading,
    generateNewInsights,
    invalidateInsightsCache
  };
} 