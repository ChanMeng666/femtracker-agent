// 共享的健康分数计算器，确保首页和insights页面数据一致性

export interface HealthScores {
  overallScore: number;
  cycleHealth: number;
  nutritionScore: number;
  exerciseScore: number;
  fertilityScore: number;
  lifestyleScore: number;
  symptomsScore: number;
}

export interface HealthData {
  exercises: any[];
  meals: any[];
  waterIntake: any[];
  symptoms: any[];
  moods: any[];
  lifestyle: any[];
  fertility: any[];
  cycles: any[];
}

export const calculateHealthScores = (data: HealthData): HealthScores => {
  const exerciseScore = calculateExerciseScore(data.exercises || []);
  const nutritionScore = calculateNutritionScore(data.meals || [], data.waterIntake || []);
  const symptomsScore = calculateSymptomsScore(data.symptoms || [], data.moods || []);
  const lifestyleScore = calculateLifestyleScore(data.lifestyle || []);
  const fertilityScore = calculateFertilityScore(data.fertility || []);
  const cycleHealth = calculateCycleHealth(data.cycles || []);
  
  const overallScore = Math.round(
    (exerciseScore + nutritionScore + symptomsScore + lifestyleScore + fertilityScore + cycleHealth) / 6
  );

  return {
    overallScore,
    cycleHealth,
    nutritionScore,
    exerciseScore,
    fertilityScore,
    lifestyleScore,
    symptomsScore
  };
};

// 运动健康分数计算 (0-100)
const calculateExerciseScore = (exercises: any[]): number => {
  if (exercises.length === 0) return 50;

  const recentExercises = exercises.slice(0, 14);
  const totalDays = 14;
  const exerciseDays = new Set(recentExercises.map(e => e.date)).size;
  const totalMinutes = recentExercises.reduce((sum, e) => sum + (e.duration_minutes || 0), 0);
  const avgIntensity = recentExercises.length > 0 
    ? recentExercises.reduce((sum, e) => sum + (e.intensity || 5), 0) / recentExercises.length 
    : 5;

  let score = 50;
  
  const exerciseFrequency = exerciseDays / totalDays;
  if (exerciseFrequency >= 0.5) score += 30;
  else if (exerciseFrequency >= 0.35) score += 20;
  else if (exerciseFrequency >= 0.2) score += 10;
  
  const weeklyMinutes = totalMinutes * (7 / totalDays);
  if (weeklyMinutes >= 150) score += 25;
  else if (weeklyMinutes >= 100) score += 15;
  else if (weeklyMinutes >= 50) score += 8;
  
  if (avgIntensity >= 7) score += 25;
  else if (avgIntensity >= 5) score += 15;
  else if (avgIntensity >= 3) score += 8;

  return Math.min(score, 100);
};

// 营养健康分数计算 (0-100)
const calculateNutritionScore = (meals: any[], waterIntake: any[]): number => {
  let score = 50;

  const recentMeals = meals.slice(0, 21);
  const mealDays = new Set(recentMeals.map(m => m.date)).size;
  const mealsPerDay = recentMeals.length / Math.max(mealDays, 1);
  
  if (mealsPerDay >= 3) score += 30;
  else if (mealsPerDay >= 2) score += 20;
  else if (mealsPerDay >= 1) score += 10;

  const recentWater = waterIntake.slice(0, 14);
  const waterDays = new Set(recentWater.map(w => w.date)).size;
  if (waterDays > 0) {
    const avgDailyWater = recentWater.reduce((sum, w) => sum + (w.amount_ml || 0), 0) / waterDays;
    if (avgDailyWater >= 2000) score += 35;
    else if (avgDailyWater >= 1500) score += 25;
    else if (avgDailyWater >= 1000) score += 15;
    else if (avgDailyWater >= 500) score += 8;
  }

  const recordedDays = new Set([...recentMeals.map(m => m.date), ...recentWater.map(w => w.date)]).size;
  if (recordedDays >= 10) score += 15;
  else if (recordedDays >= 5) score += 10;
  else if (recordedDays >= 2) score += 5;

  return Math.min(score, 100);
};

// 症状和情绪健康分数计算 (0-100)
const calculateSymptomsScore = (symptoms: any[], moods: any[]): number => {
  let score = 80;

  const recentSymptoms = symptoms.slice(0, 30);
  if (recentSymptoms.length > 0) {
    const avgSeverity = recentSymptoms.reduce((sum, s) => sum + (s.severity || 5), 0) / recentSymptoms.length;
    const symptomDensity = recentSymptoms.length / 30;
    
    score -= Math.round(avgSeverity * 3);
    score -= Math.round(symptomDensity * 20);
  }

  const recentMoods = moods.slice(0, 20);
  if (recentMoods.length > 0) {
    const avgMoodIntensity = recentMoods.reduce((sum, m) => sum + (m.intensity || 5), 0) / recentMoods.length;
    const moodScore = Math.round(avgMoodIntensity * 4);
    score = Math.max(score - 40, 20) + moodScore;
  }

  return Math.max(Math.min(score, 100), 0);
};

// 生活方式健康分数计算 (0-100)
const calculateLifestyleScore = (lifestyle: any[]): number => {
  if (lifestyle.length === 0) return 60;

  const recentEntries = lifestyle.slice(0, 14);
  let score = 40;

  const sleepEntries = recentEntries.filter(e => e.sleep_quality);
  if (sleepEntries.length > 0) {
    const avgSleepQuality = sleepEntries.reduce((sum, e) => sum + e.sleep_quality, 0) / sleepEntries.length;
    score += Math.round(avgSleepQuality * 3.5);
  }

  const sleepHourEntries = recentEntries.filter(e => e.sleep_hours);
  if (sleepHourEntries.length > 0) {
    const avgSleepHours = sleepHourEntries.reduce((sum, e) => sum + e.sleep_hours, 0) / sleepHourEntries.length;
    if (avgSleepHours >= 7 && avgSleepHours <= 9) score += 25;
    else if (avgSleepHours >= 6 && avgSleepHours <= 10) score += 15;
    else if (avgSleepHours >= 5) score += 8;
  }

  const stressEntries = recentEntries.filter(e => e.stress_level);
  if (stressEntries.length > 0) {
    const avgStressLevel = stressEntries.reduce((sum, e) => sum + e.stress_level, 0) / stressEntries.length;
    score += Math.round((10 - avgStressLevel) * 2.5);
  }

  if (recentEntries.length >= 10) score += 15;
  else if (recentEntries.length >= 5) score += 10;
  else if (recentEntries.length >= 2) score += 5;

  return Math.min(score, 100);
};

// 生育健康分数计算 (0-100)
const calculateFertilityScore = (fertilityRecords: any[]): number => {
  if (fertilityRecords.length === 0) return 70;

  let score = 50;
  const recentRecords = fertilityRecords.slice(0, 30);

  const bbtRecords = recentRecords.filter(r => r.bbt_celsius);
  if (bbtRecords.length >= 20) score += 25;
  else if (bbtRecords.length >= 10) score += 15;
  else if (bbtRecords.length >= 5) score += 8;

  const mucusRecords = recentRecords.filter(r => r.cervical_mucus);
  if (mucusRecords.length >= 15) score += 20;
  else if (mucusRecords.length >= 8) score += 12;
  else if (mucusRecords.length >= 3) score += 6;

  const ovulationRecords = recentRecords.filter(r => r.ovulation_test);
  if (ovulationRecords.length >= 10) score += 20;
  else if (ovulationRecords.length >= 5) score += 12;
  else if (ovulationRecords.length >= 2) score += 6;

  if (recentRecords.length >= 20) score += 5;
  else if (recentRecords.length >= 10) score += 3;

  return Math.min(score, 100);
};

// 月经周期健康分数计算 (0-100)
const calculateCycleHealth = (cycles: any[]): number => {
  if (cycles.length === 0) return 65;

  let score = 60;
  const recentCycles = cycles.slice(0, 3);

  if (recentCycles.length >= 2) {
    const cycleLengths = recentCycles
      .filter(c => c.cycle_length)
      .map(c => c.cycle_length);
    
    if (cycleLengths.length >= 2) {
      const avgLength = cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length;
      const lengthVariation = Math.max(...cycleLengths) - Math.min(...cycleLengths);
      
      if (avgLength >= 21 && avgLength <= 35) score += 20;
      else if (avgLength >= 18 && avgLength <= 40) score += 10;
      
      if (lengthVariation <= 3) score += 20;
      else if (lengthVariation <= 7) score += 15;
      else if (lengthVariation <= 14) score += 8;
    }
  }

  if (recentCycles.length >= 3) score += 20;
  else if (recentCycles.length >= 2) score += 15;
  else if (recentCycles.length >= 1) score += 10;

  return Math.min(score, 100);
};

// 获取趋势指标
export const getTrendFromScore = (score: number): "up" | "down" | "stable" => {
  if (score >= 80) return "up";
  if (score <= 50) return "down";
  return "stable";
}; 