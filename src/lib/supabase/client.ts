import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  email: string
  full_name?: string
  age?: number
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface MenstrualCycle {
  id: string
  user_id: string
  start_date: string
  end_date?: string
  cycle_length?: number
  notes?: string
  created_at: string
}

export interface PeriodDay {
  id: string
  cycle_id: string
  date: string
  flow_intensity: 'Light' | 'Medium' | 'Heavy' | 'Spotting'
  created_at: string
}

export interface Symptom {
  id: string
  user_id: string
  date: string
  symptom_type: string
  severity: number
  notes?: string
  created_at: string
}

export interface Mood {
  id: string
  user_id: string
  date: string
  mood_type: string
  intensity: number
  notes?: string
  created_at: string
}

export interface Exercise {
  id: string
  user_id: string
  date: string
  exercise_type: string
  duration_minutes: number
  intensity: number
  calories_burned?: number
  notes?: string
  created_at: string
}

export interface Meal {
  id: string
  user_id: string
  date: string
  meal_time: string
  foods: string[]
  calories?: number
  nutrients?: string[]
  notes?: string
  created_at: string
}

export interface WaterIntake {
  id: string
  user_id: string
  date: string
  amount_ml: number
  recorded_at: string
}

export interface LifestyleEntry {
  id: string
  user_id: string
  date: string
  sleep_hours?: number
  sleep_quality?: number
  stress_level?: number
  stress_triggers?: string[]
  coping_methods?: string[]
  weight_kg?: number
  created_at: string
}

export interface HealthInsight {
  id: string
  user_id: string
  date: string
  insight_type: 'warning' | 'tip' | 'achievement' | 'medical_advice'
  category: string
  title: string
  description: string
  priority: number
  action_required: boolean
  is_read: boolean
  created_at: string
}

export interface NotificationRule {
  id: string
  user_id: string
  name: string
  type: 'cycle' | 'health' | 'custom'
  enabled: boolean
  schedule: {
    time: string
    days: number[]
    frequency: 'daily' | 'weekly' | 'cycle-based'
  }
  message: string
  conditions?: {
    cycleDay?: number
    phase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal'
  }
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  rule_id?: string
  title: string
  message: string
  type: string
  priority: string
  is_read: boolean
  sent_at: string
  read_at?: string
}

export interface QuickRecord {
  id: string
  user_id: string
  date: string
  record_type: 'weight' | 'mood' | 'symptom' | 'exercise' | 'meal' | 'sleep' | 'water'
  value: string
  notes?: string
  created_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  theme: string
  primary_color: string
  font_size: string
  notifications: Record<string, boolean>
  privacy: Record<string, boolean>
  accessibility: Record<string, boolean>
  behavior: Record<string, boolean>
  created_at: string
  updated_at: string
}

// 新增类型定义 - 第一阶段功能
export interface PersonalizedTip {
  id: string
  user_id: string
  tip_type: 'reminder' | 'suggestion' | 'warning' | 'achievement'
  category: string
  message: string
  action_text?: string
  action_link?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// 原始health_insights表的接口（来自database-setup.sql）
export interface HealthInsightDB {
  id: string
  user_id: string
  date: string
  insight_type: 'warning' | 'tip' | 'achievement' | 'medical_advice'
  category: string
  title: string
  description: string
  priority: number
  action_required: boolean
  is_read: boolean
  is_active?: boolean  // 新增字段
  created_at: string
  updated_at?: string  // 新增字段
}

// 新的AI洞察表接口（来自database-schema-extension.sql）
export interface AIInsightExtended {
  id: string
  user_id: string
  insight_type: 'positive' | 'improvement' | 'warning' | 'neutral'
  category: string
  title: string
  description: string
  recommendation?: string
  confidence_score: number
  is_active: boolean
  generated_at: string
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface HealthOverview {
  id: string
  user_id: string
  overall_score: number
  cycle_health: number
  nutrition_score: number
  exercise_score: number
  fertility_score: number
  lifestyle_score: number
  symptoms_score: number
  last_updated: string
  created_at: string
  updated_at: string
}

export interface AIInsight {
  id: string
  user_id: string
  insight_type: 'positive' | 'improvement' | 'warning' | 'neutral'
  category: string
  title: string
  description: string
  recommendation?: string
  confidence_score: number
  is_active: boolean
  generated_at: string
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface HealthMetric {
  id: string
  user_id: string
  category: string
  score: number
  trend: 'up' | 'down' | 'stable'
  color: string
  date: string
  created_at: string
  updated_at: string
}

export interface CorrelationAnalysis {
  id: string
  user_id: string
  title: string
  description: string
  correlation: number
  suggestion?: string
  confidence_level: 'low' | 'medium' | 'high'
  is_active: boolean
  generated_at: string
  expires_at?: string
  created_at: string
  updated_at: string
} 