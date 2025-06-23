import { useState, useEffect } from 'react';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth/useAuth';
import { 
  supabaseRest
} from '@/lib/supabase/restClient';
import { calculateHealthScores, type HealthData } from '@/utils/shared/healthScoreCalculator';

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
  const router = useRouter();
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
    description: "User's complete health dashboard data with real-time database integration and navigation capabilities",
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
      recentRecords: quickRecords.slice(0, 5),
      availablePages: [
        { name: "home", path: "/", description: "Dashboard with health overview" },
        { name: "cycle tracker", path: "/cycle-tracker", description: "Menstrual cycle tracking" },
        { name: "symptoms", path: "/symptom-mood", description: "Symptom and mood tracking" },
        { name: "nutrition", path: "/nutrition", description: "Nutrition and meal tracking" },
        { name: "fertility", path: "/fertility", description: "Fertility health monitoring" },
        { name: "exercise", path: "/exercise", description: "Exercise and fitness tracking" },
        { name: "lifestyle", path: "/lifestyle", description: "Sleep and stress tracking" },
        { name: "insights", path: "/insights", description: "Health insights and analytics" },
        { name: "recipe", path: "/recipe", description: "Recipe creation and management" },
        { name: "settings", path: "/settings", description: "App settings and preferences" }
      ]
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

  // 新增：基于真实数据计算健康分数的函数
  const calculateHealthScoresFromRealData = async () => {
    if (!user) return;

    try {
      // 计算时间范围：最近30天
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // 并行获取各模块的数据
      const [
        exerciseData,
        mealData,
        waterData,
        symptomsData,
        moodsData,
        lifestyleData,
        fertilityData,
        cycleData
      ] = await Promise.all([
        supabaseRest.from('exercises').select('*').eq('user_id', user.id).gte('date', startDateStr).lte('date', endDateStr),
        supabaseRest.from('meals').select('*').eq('user_id', user.id).gte('date', startDateStr).lte('date', endDateStr),
        supabaseRest.from('water_intake').select('*').eq('user_id', user.id).gte('date', startDateStr).lte('date', endDateStr),
        supabaseRest.from('symptoms').select('*').eq('user_id', user.id).gte('date', startDateStr).lte('date', endDateStr),
        supabaseRest.from('moods').select('*').eq('user_id', user.id).gte('date', startDateStr).lte('date', endDateStr),
        supabaseRest.from('lifestyle_entries').select('*').eq('user_id', user.id).gte('date', startDateStr).lte('date', endDateStr),
        supabaseRest.from('fertility_records').select('*').eq('user_id', user.id).gte('date', startDateStr).lte('date', endDateStr),
        supabaseRest.from('menstrual_cycles').select('*').eq('user_id', user.id).gte('start_date', startDateStr)
      ]);

      // 使用共享计算器
      const healthData: HealthData = {
        exercises: exerciseData.data || [],
        meals: mealData.data || [],
        waterIntake: waterData.data || [],
        symptoms: symptomsData.data || [],
        moods: moodsData.data || [],
        lifestyle: lifestyleData.data || [],
        fertility: fertilityData.data || [],
        cycles: cycleData.data || []
      };

      const calculatedScores = calculateHealthScores(healthData);

      console.log('Calculated health scores:', calculatedScores);

      // 保存到数据库 - 使用简单的查询和更新策略
      const healthData_db = {
        user_id: user.id,
        overall_score: calculatedScores.overallScore,
        cycle_health: calculatedScores.cycleHealth,
        nutrition_score: calculatedScores.nutritionScore,
        exercise_score: calculatedScores.exerciseScore,
        fertility_score: calculatedScores.fertilityScore,
        lifestyle_score: calculatedScores.lifestyleScore,
        symptoms_score: calculatedScores.symptomsScore,
        last_updated: new Date().toISOString().split('T')[0]
      };

      console.log('Attempting to save health data:', healthData_db);

      // 先检查记录是否存在
      const { data: existingData } = await supabaseRest
        .from('health_overview')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (existingData) {
        // 更新现有记录
        const updateData = { ...healthData_db };
        delete (updateData as any).user_id;
        const result = await supabaseRest
          .from('health_overview')
          .update(updateData)
          .eq('user_id', user.id);
        
        if (result.error) {
          console.error('Health overview update failed:', result.error);
          throw new Error(`Failed to update health overview: ${JSON.stringify(result.error)}`);
        }
      } else {
        // 插入新记录
        const result = await supabaseRest
          .from('health_overview')
          .insert([healthData_db]);
        
        if (result.error) {
          console.error('Health overview insert failed:', result.error);
          throw new Error(`Failed to insert health overview: ${JSON.stringify(result.error)}`);
        }
      }

      console.log('Health overview saved successfully');

      // 更新本地状态
      setHealthOverview({
        overallScore: calculatedScores.overallScore,
        cycleHealth: calculatedScores.cycleHealth,
        nutritionScore: calculatedScores.nutritionScore,
        exerciseScore: calculatedScores.exerciseScore,
        fertilityScore: calculatedScores.fertilityScore,
        lifestyleScore: calculatedScores.lifestyleScore,
        symptomsScore: calculatedScores.symptomsScore,
        lastUpdated: new Date().toISOString().split('T')[0]
      });

      console.log('Health overview updated with real data:', calculatedScores);

    } catch (error) {
      console.error('Error calculating health scores from real data:', error);
      throw error;
    }
  };

  // 运动健康分数计算 (0-100)
  const calculateExerciseScore = (exercises: any[]) => {
    if (exercises.length === 0) return 50; // 基础分数

    const recentExercises = exercises.slice(0, 14); // 最近14天
    const totalDays = 14;
    const exerciseDays = new Set(recentExercises.map(e => e.date)).size;
    const totalMinutes = recentExercises.reduce((sum, e) => sum + (e.duration_minutes || 0), 0);
    const avgIntensity = recentExercises.length > 0 
      ? recentExercises.reduce((sum, e) => sum + (e.intensity || 5), 0) / recentExercises.length 
      : 5;

    let score = 50;
    
    // 运动频率评分 (0-30分)
    const exerciseFrequency = exerciseDays / totalDays;
    if (exerciseFrequency >= 0.5) score += 30; // 每周3.5天以上
    else if (exerciseFrequency >= 0.35) score += 20; // 每周2.5天
    else if (exerciseFrequency >= 0.2) score += 10; // 每周1.5天
    
    // 运动时长评分 (0-25分)
    const weeklyMinutes = totalMinutes * (7 / totalDays); // 换算为周平均
    if (weeklyMinutes >= 150) score += 25; // WHO建议
    else if (weeklyMinutes >= 100) score += 15;
    else if (weeklyMinutes >= 50) score += 8;
    
    // 运动强度评分 (0-25分)
    if (avgIntensity >= 7) score += 25;
    else if (avgIntensity >= 5) score += 15;
    else if (avgIntensity >= 3) score += 8;

    return Math.min(score, 100);
  };

  // 营养健康分数计算 (0-100)
  const calculateNutritionScore = (meals: any[], waterIntake: any[]) => {
    let score = 50;

    // 饮食规律性评分 (0-30分)
    const recentMeals = meals.slice(0, 21); // 最近21天
    const mealDays = new Set(recentMeals.map(m => m.date)).size;
    const mealsPerDay = recentMeals.length / Math.max(mealDays, 1);
    
    if (mealsPerDay >= 3) score += 30; // 一日三餐
    else if (mealsPerDay >= 2) score += 20;
    else if (mealsPerDay >= 1) score += 10;

    // 水分摄入评分 (0-35分)
    const recentWater = waterIntake.slice(0, 14); // 最近14天
    const waterDays = new Set(recentWater.map(w => w.date)).size;
    if (waterDays > 0) {
      const avgDailyWater = recentWater.reduce((sum, w) => sum + (w.amount_ml || 0), 0) / waterDays;
      if (avgDailyWater >= 2000) score += 35; // 推荐水量
      else if (avgDailyWater >= 1500) score += 25;
      else if (avgDailyWater >= 1000) score += 15;
      else if (avgDailyWater >= 500) score += 8;
    }

    // 营养记录完整性评分 (0-15分)
    const recordedDays = new Set([...recentMeals.map(m => m.date), ...recentWater.map(w => w.date)]).size;
    if (recordedDays >= 10) score += 15;
    else if (recordedDays >= 5) score += 10;
    else if (recordedDays >= 2) score += 5;

    return Math.min(score, 100);
  };

  // 症状和情绪健康分数计算 (0-100)
  const calculateSymptomsScore = (symptoms: any[], moods: any[]) => {
    let score = 80; // 起始分数较高，症状越少分数越高

    // 症状严重程度评分 (扣分制)
    const recentSymptoms = symptoms.slice(0, 30); // 最近30个记录
    if (recentSymptoms.length > 0) {
      const avgSeverity = recentSymptoms.reduce((sum, s) => sum + (s.severity || 5), 0) / recentSymptoms.length;
      const symptomDensity = recentSymptoms.length / 30; // 症状记录密度
      
      score -= Math.round(avgSeverity * 3); // 严重程度扣分
      score -= Math.round(symptomDensity * 20); // 症状频率扣分
    }

    // 情绪状态评分 (0-40分)
    const recentMoods = moods.slice(0, 20); // 最近20个记录
    if (recentMoods.length > 0) {
      const avgMoodIntensity = recentMoods.reduce((sum, m) => sum + (m.intensity || 5), 0) / recentMoods.length;
      const moodScore = Math.round(avgMoodIntensity * 4); // 转换为40分制
      score = Math.max(score - 40, 20) + moodScore; // 重新计算基础分数
    }

    return Math.max(Math.min(score, 100), 0);
  };

  // 生活方式健康分数计算 (0-100)
  const calculateLifestyleScore = (lifestyle: any[]) => {
    if (lifestyle.length === 0) return 60; // 无数据时的基础分数

    const recentEntries = lifestyle.slice(0, 14); // 最近14天
    let score = 40;

    // 睡眠质量评分 (0-35分)
    const sleepEntries = recentEntries.filter(e => e.sleep_quality);
    if (sleepEntries.length > 0) {
      const avgSleepQuality = sleepEntries.reduce((sum, e) => sum + e.sleep_quality, 0) / sleepEntries.length;
      score += Math.round(avgSleepQuality * 3.5); // 转换为35分制
    }

    // 睡眠时长评分 (0-25分)
    const sleepHourEntries = recentEntries.filter(e => e.sleep_hours);
    if (sleepHourEntries.length > 0) {
      const avgSleepHours = sleepHourEntries.reduce((sum, e) => sum + e.sleep_hours, 0) / sleepHourEntries.length;
      if (avgSleepHours >= 7 && avgSleepHours <= 9) score += 25; // 理想睡眠时长
      else if (avgSleepHours >= 6 && avgSleepHours <= 10) score += 15;
      else if (avgSleepHours >= 5) score += 8;
    }

    // 压力水平评分 (0-25分，压力越低分数越高)
    const stressEntries = recentEntries.filter(e => e.stress_level);
    if (stressEntries.length > 0) {
      const avgStressLevel = stressEntries.reduce((sum, e) => sum + e.stress_level, 0) / stressEntries.length;
      score += Math.round((10 - avgStressLevel) * 2.5); // 反向计分
    }

    // 记录完整性评分 (0-15分)
    if (recentEntries.length >= 10) score += 15;
    else if (recentEntries.length >= 5) score += 10;
    else if (recentEntries.length >= 2) score += 5;

    return Math.min(score, 100);
  };

  // 生育健康分数计算 (0-100)
  const calculateFertilityScore = (fertilityRecords: any[]) => {
    if (fertilityRecords.length === 0) return 70; // 无数据时的基础分数

    let score = 50;
    const recentRecords = fertilityRecords.slice(0, 30); // 最近30天

    // BBT记录完整性和规律性 (0-25分)
    const bbtRecords = recentRecords.filter(r => r.bbt_celsius);
    if (bbtRecords.length >= 20) score += 25;
    else if (bbtRecords.length >= 10) score += 15;
    else if (bbtRecords.length >= 5) score += 8;

    // 宫颈粘液观察记录 (0-20分)
    const mucusRecords = recentRecords.filter(r => r.cervical_mucus);
    if (mucusRecords.length >= 15) score += 20;
    else if (mucusRecords.length >= 8) score += 12;
    else if (mucusRecords.length >= 3) score += 6;

    // 排卵试纸检测记录 (0-20分)
    const ovulationRecords = recentRecords.filter(r => r.ovulation_test);
    if (ovulationRecords.length >= 10) score += 20;
    else if (ovulationRecords.length >= 5) score += 12;
    else if (ovulationRecords.length >= 2) score += 6;

    // 整体记录一致性 (0-5分)
    if (recentRecords.length >= 20) score += 5;
    else if (recentRecords.length >= 10) score += 3;

    return Math.min(score, 100);
  };

  // 月经周期健康分数计算 (0-100)
  const calculateCycleHealth = (cycles: any[]) => {
    if (cycles.length === 0) return 65; // 无数据时的基础分数

    let score = 60;
    const recentCycles = cycles.slice(0, 3); // 最近3个周期

    // 周期规律性评分 (0-40分)
    if (recentCycles.length >= 2) {
      const cycleLengths = recentCycles
        .filter(c => c.cycle_length)
        .map(c => c.cycle_length);
      
      if (cycleLengths.length >= 2) {
        const avgLength = cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length;
        const lengthVariation = Math.max(...cycleLengths) - Math.min(...cycleLengths);
        
        // 理想周期长度评分
        if (avgLength >= 21 && avgLength <= 35) score += 20;
        else if (avgLength >= 18 && avgLength <= 40) score += 10;
        
        // 周期规律性评分
        if (lengthVariation <= 3) score += 20; // 非常规律
        else if (lengthVariation <= 7) score += 15; // 较规律
        else if (lengthVariation <= 14) score += 8; // 一般
      }
    }

    // 记录完整性评分 (0-20分)
    if (recentCycles.length >= 3) score += 20;
    else if (recentCycles.length >= 2) score += 15;
    else if (recentCycles.length >= 1) score += 10;

    return Math.min(score, 100);
  };

  const loadHealthOverview = async () => {
    if (!user) return;

    // 首先尝试从数据库加载现有的健康概览
    const { data, error } = await supabaseRest
      .from('health_overview')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && (error as any).message !== 'No rows returned') {
      console.error('Error loading health overview:', error);
      return;
    }

    if (data) {
      // 如果有数据，检查是否需要更新（如果超过1天则重新计算）
      const lastUpdated = new Date((data as any).last_updated);
      const now = new Date();
      const daysDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff >= 1) {
        // 数据过期，重新计算
        console.log('Health overview data is outdated, recalculating...');
        await calculateHealthScoresFromRealData();
      } else {
        // 使用现有数据
        setHealthOverview({
          overallScore: (data as any).overall_score,
          cycleHealth: (data as any).cycle_health,
          nutritionScore: (data as any).nutrition_score,
          exerciseScore: (data as any).exercise_score,
          fertilityScore: (data as any).fertility_score,
          lifestyleScore: (data as any).lifestyle_score,
          symptomsScore: (data as any).symptoms_score,
          lastUpdated: (data as any).last_updated
        });
      }
    } else {
      // 没有数据，首次计算
      console.log('No health overview data found, calculating for the first time...');
      await calculateHealthScoresFromRealData();
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
        type: tip.tip_type as FrontendPersonalizedTip['type'],
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
  
  // AI Action: Refresh health overview data
  useCopilotAction({
    name: "refreshHealthOverview",
    description: "Refresh and recalculate health overview scores based on current user data from all app modules (exercise, nutrition, lifestyle, etc.)",
    parameters: [],
    handler: async () => {
      if (!user) {
        return "Please log in to refresh health data";
      }

      try {
        setLoading(true);
        await calculateHealthScoresFromRealData();
        return "Health overview refreshed successfully! All scores have been recalculated based on your recent activity data including exercise, nutrition, lifestyle, symptoms, fertility, and cycle data.";
      } catch (error) {
        console.error('Error refreshing health overview:', error);
        return "Failed to refresh health overview. Please try again later.";
      } finally {
        setLoading(false);
      }
    },
  });

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

  useCopilotAction({
    name: "navigateToPage",
    description: "Navigate to a specific page in the app. Available pages: cycle tracker, symptoms, nutrition, fertility, exercise, lifestyle, insights, recipe, settings, home",
    parameters: [
      {
        name: "pageName",
        type: "string",
        description: "Name of the page to navigate to. Options: home, cycle, symptoms, nutrition, fertility, exercise, lifestyle, insights, recipe, settings",
        required: true,
      }
    ],
    handler: async ({ pageName }) => {
      const pageMap: { [key: string]: string } = {
        'home': '/',
        'cycle': '/cycle-tracker',
        'cycle tracker': '/cycle-tracker',
        'cycle-tracker': '/cycle-tracker',
        'symptoms': '/symptom-mood',
        'symptom': '/symptom-mood',
        'mood': '/symptom-mood',
        'symptom-mood': '/symptom-mood',
        'nutrition': '/nutrition',
        'fertility': '/fertility',
        'fertility health': '/fertility',
        'exercise': '/exercise',
        'workout': '/exercise',
        'fitness': '/exercise',
        'lifestyle': '/lifestyle',
        'insights': '/insights',
        'health insights': '/insights',
        'recipe': '/recipe',
        'recipes': '/recipe',
        'cooking': '/recipe',
        'settings': '/settings',
        'setting': '/settings'
      };

      const normalizedPageName = pageName.toLowerCase().trim();
      const targetPath = pageMap[normalizedPageName];

      if (targetPath) {
        router.push(targetPath);
        return `Successfully navigated to ${pageName} page.`;
      } else {
        const availablePages = Object.keys(pageMap).filter(key => !key.includes('-')).join(', ');
        return `Page "${pageName}" not found. Available pages: ${availablePages}`;
      }
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
    refetch: loadAllData,
    calculateHealthScoresFromRealData
  };
};
