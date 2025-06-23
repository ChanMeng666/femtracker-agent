import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabaseRest } from "@/lib/supabase/restClient";

interface RecommendationItem {
  icon: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface PersonalizedRecommendationsProps {
  healthMetrics?: Array<{ category: string; score: number; trend: string }>;
  insights?: Array<{ type: string; category: string; recommendation: string }>;
}

export function PersonalizedRecommendations({ healthMetrics = [], insights = [] }: PersonalizedRecommendationsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [shortTermGoals, setShortTermGoals] = useState<RecommendationItem[]>([]);
  const [longTermGoals, setLongTermGoals] = useState<RecommendationItem[]>([]);
  const [resources, setResources] = useState<RecommendationItem[]>([]);

  useEffect(() => {
    generateRecommendations();
  }, [healthMetrics, insights, user]);

  const generateRecommendations = async () => {
    setLoading(true);
    
    try {
      let userHealthData = { exercise: [], nutrition: [], lifestyle: [], symptoms: [] };
      
      if (user) {
        // Get recent user data for more personalized recommendations
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const [exerciseData, nutritionData, lifestyleData, symptomsData] = await Promise.all([
          supabaseRest.from('exercises').select('*').eq('user_id', user.id).gte('date', thirtyDaysAgo.toISOString().split('T')[0]),
          supabaseRest.from('meals').select('*').eq('user_id', user.id).gte('date', thirtyDaysAgo.toISOString().split('T')[0]),
          supabaseRest.from('lifestyle_entries').select('*').eq('user_id', user.id).gte('date', thirtyDaysAgo.toISOString().split('T')[0]),
          supabaseRest.from('symptoms').select('*').eq('user_id', user.id).gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        ]);

        userHealthData = {
          exercise: exerciseData.data || [],
          nutrition: nutritionData.data || [],
          lifestyle: lifestyleData.data || [],
          symptoms: symptomsData.data || []
        };
      }

      const recommendations = generateSmartRecommendations(healthMetrics, insights, userHealthData);
      
      setShortTermGoals(recommendations.shortTerm);
      setLongTermGoals(recommendations.longTerm);
      setResources(recommendations.resources);
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setDefaultRecommendations();
    } finally {
      setLoading(false);
    }
  };

  const generateSmartRecommendations = (metrics: any[], userInsights: any[], userData: any) => {
    const shortTerm: RecommendationItem[] = [];
    const longTerm: RecommendationItem[] = [];
    const resources: RecommendationItem[] = [];

    // Analyze health metrics for recommendations
    const lowScoreMetrics = metrics.filter(m => m.score < 70);
    const decliningMetrics = metrics.filter(m => m.trend === 'down');

    // Exercise recommendations
    const exerciseMetric = metrics.find(m => m.category.includes('Exercise'));
    const exerciseCount = userData.exercise.length;
    
    if (!exerciseMetric || exerciseMetric.score < 75 || exerciseCount < 8) {
      shortTerm.push({
        icon: '🏃‍♀️',
        title: 'Increase Physical Activity',
        description: 'Aim for 3-4 exercise sessions this week to boost your fitness score',
        priority: 'high',
        category: 'exercise'
      });
      
      longTerm.push({
        icon: '💪',
        title: 'Build Consistent Exercise Routine',
        description: 'Establish a sustainable weekly exercise schedule with varied activities',
        priority: 'high',
        category: 'exercise'
      });

      resources.push({
        icon: '📱',
        title: 'Cycle-Synced Workout Guide',
        description: 'Learn how to optimize exercise based on your menstrual cycle phases',
        priority: 'medium',
        category: 'exercise'
      });
    }

    // Nutrition recommendations
    const nutritionMetric = metrics.find(m => m.category.includes('Nutrition'));
    const nutritionCount = userData.nutrition.length;
    
    if (!nutritionMetric || nutritionMetric.score < 75 || nutritionCount < 15) {
      shortTerm.push({
        icon: '🥗',
        title: 'Improve Nutrition Tracking',
        description: 'Track your meals daily and focus on iron-rich foods during menstruation',
        priority: 'medium',
        category: 'nutrition'
      });

      resources.push({
        icon: '📚',
        title: 'Menstrual Cycle Nutrition Guide',
        description: 'Discover what to eat during each phase of your cycle for optimal health',
        priority: 'medium',
        category: 'nutrition'
      });
    }

    // Lifestyle recommendations
    const lifestyleMetric = metrics.find(m => m.category.includes('Lifestyle'));
    const avgSleepQuality = userData.lifestyle.length > 0 
      ? userData.lifestyle.reduce((sum: number, entry: any) => sum + (entry.sleep_quality || 5), 0) / userData.lifestyle.length
      : 5;
    
    if (!lifestyleMetric || lifestyleMetric.score < 75 || avgSleepQuality < 7) {
      shortTerm.push({
        icon: '😴',
        title: 'Optimize Sleep Schedule',
        description: 'Maintain 7-8 hours of quality sleep with consistent bedtime routine',
        priority: 'high',
        category: 'lifestyle'
      });

      longTerm.push({
        icon: '🧘‍♀️',
        title: 'Develop Stress Management',
        description: 'Learn and practice stress reduction techniques like meditation or yoga',
        priority: 'medium',
        category: 'lifestyle'
      });

      resources.push({
        icon: '🌙',
        title: 'Sleep Hygiene Best Practices',
        description: 'Tips for improving sleep quality and establishing healthy sleep habits',
        priority: 'medium',
        category: 'lifestyle'
      });
    }

    // Symptom and mood recommendations
    const symptomCount = userData.symptoms.length;
    const moodMetric = metrics.find(m => m.category.includes('Mood'));
    
    if (symptomCount > 10 || (moodMetric && moodMetric.score < 70)) {
      shortTerm.push({
        icon: '📝',
        title: 'Track Symptoms Consistently',
        description: 'Daily symptom tracking helps identify patterns and triggers',
        priority: 'medium',
        category: 'symptoms'
      });

      resources.push({
        icon: '🩺',
        title: 'Understanding PMS Symptoms',
        description: 'Learn about common symptoms and when to consult healthcare providers',
        priority: 'low',
        category: 'symptoms'
      });
    }

    // Add insights-based recommendations
    userInsights.forEach(insight => {
      if (insight.type === 'warning' || insight.type === 'improvement') {
        if (insight.recommendation) {
          longTerm.push({
            icon: '⚠️',
            title: `Address ${insight.category} Concerns`,
            description: insight.recommendation,
            priority: insight.type === 'warning' ? 'high' : 'medium',
            category: insight.category.toLowerCase()
          });
        }
      }
    });

    // Default recommendations if no specific issues found
    if (shortTerm.length === 0) {
      shortTerm.push({
        icon: '✨',
        title: 'Maintain Current Health Habits',
        description: 'Continue your excellent health tracking and lifestyle habits',
        priority: 'low',
        category: 'general'
      });
    }

    if (longTerm.length === 0) {
      longTerm.push({
        icon: '🎯',
        title: 'Set New Health Goals',
        description: 'Consider challenging yourself with new health and wellness objectives',
        priority: 'low',
        category: 'general'
      });
    }

    // Always include some general resources
    if (resources.length < 3) {
      resources.push({
        icon: '📖',
        title: 'Women\'s Health Resources',
        description: 'Comprehensive guide to understanding your reproductive health',
        priority: 'low',
        category: 'general'
      });
    }

    return { shortTerm: shortTerm.slice(0, 3), longTerm: longTerm.slice(0, 3), resources: resources.slice(0, 4) };
  };

  const setDefaultRecommendations = () => {
    setShortTermGoals([
      {
        icon: '😴',
        title: 'Maintain Regular Sleep Schedule',
        description: 'Aim for 7-8 hours of quality sleep each night',
        priority: 'high',
        category: 'lifestyle'
      },
      {
        icon: '📝',
        title: 'Track Daily Symptoms',
        description: 'Record symptoms daily for better pattern recognition',
        priority: 'medium',
        category: 'symptoms'
      },
      {
        icon: '💧',
        title: 'Stay Hydrated',
        description: 'Drink 8 glasses of water daily for optimal health',
        priority: 'medium',
        category: 'nutrition'
      }
    ]);

    setLongTermGoals([
      {
        icon: '💪',
        title: 'Build Exercise Routine',
        description: 'Establish consistent physical activity habits',
        priority: 'high',
        category: 'exercise'
      },
      {
        icon: '🥗',
        title: 'Optimize Cycle Nutrition',
        description: 'Align your diet with menstrual cycle phases',
        priority: 'medium',
        category: 'nutrition'
      },
      {
        icon: '🧘‍♀️',
        title: 'Master Stress Management',
        description: 'Develop effective stress reduction techniques',
        priority: 'medium',
        category: 'lifestyle'
      }
    ]);

    setResources([
      {
        icon: '📚',
        title: 'Cycle-based Nutrition Guide',
        description: 'Learn what to eat during each menstrual phase',
        priority: 'medium',
        category: 'nutrition'
      },
      {
        icon: '🧘‍♀️',
        title: 'Mindfulness and Stress Relief',
        description: 'Meditation and relaxation techniques for better health',
        priority: 'medium',
        category: 'lifestyle'
      },
      {
        icon: '🏃‍♀️',
        title: 'Exercise During Different Phases',
        description: 'Optimize workouts based on your cycle',
        priority: 'medium',
        category: 'exercise'
      }
    ]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-sm border border-purple-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">💝</span>
          <h2 className="text-xl font-semibold text-gray-800">Personalized Improvement Plan</h2>
        </div>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-sm border border-purple-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">💝</span>
        <h2 className="text-xl font-semibold text-gray-800">Personalized Improvement Plan</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 bg-white/60 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <span>🎯</span>
              Short-term Goals (This Week)
            </h3>
            <div className="space-y-3">
              {shortTermGoals.map((goal, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getPriorityColor(goal.priority)}`}>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{goal.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-800">{goal.title}</div>
                      <div className="text-xs text-gray-600 mt-1">{goal.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-white/60 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <span>🌟</span>
              Long-term Goals (This Month)
            </h3>
            <div className="space-y-3">
              {longTermGoals.map((goal, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getPriorityColor(goal.priority)}`}>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{goal.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-800">{goal.title}</div>
                      <div className="text-xs text-gray-600 mt-1">{goal.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-white/60 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <span>📚</span>
              Recommended Resources
            </h3>
            <div className="space-y-3">
              {resources.map((resource, index) => (
                <div key={index} className="p-3 bg-white/60 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{resource.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-purple-700 hover:text-purple-800">{resource.title}</div>
                      <div className="text-xs text-gray-600 mt-1">{resource.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-white/60 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <span>🔔</span>
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm hover:bg-purple-200 transition-colors">
                📱 Set Daily Health Check Reminder
              </button>
              <button className="w-full text-left px-3 py-2 bg-pink-100 text-pink-800 rounded-lg text-sm hover:bg-pink-200 transition-colors">
                📊 Enable Weekly Progress Review
              </button>
              <button className="w-full text-left px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                🎯 Create Personal Health Goals
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 