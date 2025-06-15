"use client";

import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HealthOverview {
  overallScore: number;
  cycleHealth: number;
  nutritionScore: number;
  exerciseScore: number;
  fertilityScore: number;
  lifestyleScore: number;
  symptomsScore: number;
  lastUpdated: string;
}

interface QuickRecord {
  date: string;
  type: 'weight' | 'mood' | 'symptom' | 'exercise' | 'meal' | 'sleep' | 'water';
  value: string;
  notes?: string;
}

interface PersonalizedTip {
  id: string;
  type: 'reminder' | 'suggestion' | 'warning' | 'achievement';
  category: string;
  message: string;
  actionText?: string;
  actionLink?: string;
}

// Main component that wraps everything in CopilotKit
export default function Home() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <HomeContent />
    </CopilotKit>
  );
}

// Internal component that uses CopilotKit hooks
function HomeContent() {
  const router = useRouter();
  
  const [healthOverview, setHealthOverview] = useState<HealthOverview>({
    overallScore: 78,
    cycleHealth: 82,
    nutritionScore: 75,
    exerciseScore: 68,
    fertilityScore: 85,
    lifestyleScore: 72,
    symptomsScore: 76,
    lastUpdated: new Date().toISOString().split('T')[0]
  });

  const [quickRecords, setQuickRecords] = useState<QuickRecord[]>([
    {
      date: new Date().toISOString().split('T')[0],
      type: 'weight',
      value: '58.5 kg',
      notes: 'Morning weight'
    }
  ]);

  const [personalizedTips, setPersonalizedTips] = useState<PersonalizedTip[]>([
    {
      id: '1',
      type: 'reminder',
      category: 'Cycle Health',
      message: 'Your period is expected in 3 days. Consider tracking symptoms and preparing.',
      actionText: 'Track Cycle',
      actionLink: '/cycle-tracker'
    },
    {
      id: '2',
      type: 'suggestion',
      category: 'Exercise',
      message: 'You\'ve been inactive for 2 days. A light walk could boost your energy.',
      actionText: 'Log Exercise',
      actionLink: '/exercise'
    },
    {
      id: '3',
      type: 'achievement',
      category: 'Nutrition',
      message: 'Great job! You\'ve maintained good nutrition for 5 consecutive days.',
      actionText: 'View Details',
      actionLink: '/nutrition'
    }
  ]);

  // Make home page data readable by AI
  useCopilotReadable({
    description: "Current health overview and personalized tips for the user",
    value: {
      healthOverview,
      quickRecords,
      personalizedTips,
      healthStatus: healthOverview.overallScore >= 80 ? "Excellent" : 
                   healthOverview.overallScore >= 70 ? "Good" : 
                   healthOverview.overallScore >= 60 ? "Average" : "Needs Improvement",
      todayDate: new Date().toISOString().split('T')[0]
    }
  });

  // AI Action: Smart navigation
  useCopilotAction({
    name: "navigateToPage",
    description: "Navigate to a specific health tracking page or feature",
    parameters: [
      {
        name: "destination",
        type: "string",
        description: "Page to navigate to (dashboard, cycle-tracker, nutrition, exercise, fertility, lifestyle, symptom-mood, recipe, insights, settings)",
        required: true,
      }
    ],
    handler: ({ destination }) => {
      const validPages = [
        'dashboard', 'cycle-tracker', 'nutrition', 'exercise', 
        'fertility', 'lifestyle', 'symptom-mood', 'recipe', 
        'insights', 'settings'
      ];
      
      if (validPages.includes(destination)) {
        router.push(`/${destination}`);
      }
    },
  });

  // AI Action: Update health overview scores
  useCopilotAction({
    name: "updateHealthOverview",
    description: "Update health scores in the overview",
    parameters: [
      {
        name: "scoreType",
        type: "string",
        description: "Type of score to update (overall, cycle, nutrition, exercise, fertility, lifestyle, symptoms)",
        required: true,
      },
      {
        name: "score",
        type: "number",
        description: "New score value (0-100)",
        required: true,
      }
    ],
    handler: ({ scoreType, score }) => {
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
    },
  });

  // AI Action: Quick record entry
  useCopilotAction({
    name: "addQuickRecord",
    description: "Quickly record health data like weight, mood, symptoms, exercise, meals, sleep, or water intake",
    parameters: [
      {
        name: "type",
        type: "string",
        description: "Type of record (weight, mood, symptom, exercise, meal, sleep, water)",
        required: true,
      },
      {
        name: "value",
        type: "string",
        description: "Value or description of the record",
        required: true,
      },
      {
        name: "notes",
        type: "string",
        description: "Additional notes (optional)",
        required: false,
      }
    ],
    handler: ({ type, value, notes }) => {
      const validTypes = ['weight', 'mood', 'symptom', 'exercise', 'meal', 'sleep', 'water'];
      if (validTypes.includes(type)) {
        const newRecord: QuickRecord = {
          date: new Date().toISOString().split('T')[0],
          type: type as QuickRecord['type'],
          value,
          notes
        };
        setQuickRecords(prev => [newRecord, ...prev.slice(0, 9)]); // Keep only last 10 records
      }
    },
  });

  // AI Action: Add personalized tip
  useCopilotAction({
    name: "addPersonalizedTip",
    description: "Add a personalized health tip or reminder",
    parameters: [
      {
        name: "type",
        type: "string",
        description: "Type of tip (reminder, suggestion, warning, achievement)",
        required: true,
      },
      {
        name: "category",
        type: "string",
        description: "Health category (Cycle Health, Nutrition, Exercise, Fertility, Lifestyle, Symptoms)",
        required: true,
      },
      {
        name: "message",
        type: "string",
        description: "Tip message content",
        required: true,
      },
      {
        name: "actionText",
        type: "string",
        description: "Action button text (optional)",
        required: false,
      },
      {
        name: "actionLink",
        type: "string",
        description: "Action link URL (optional)",
        required: false,
      }
    ],
    handler: ({ type, category, message, actionText, actionLink }) => {
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
        setPersonalizedTips(prev => [newTip, ...prev.slice(0, 4)]); // Keep only last 5 tips
      }
    },
  });

  // AI Action: Remove personalized tip
  useCopilotAction({
    name: "removePersonalizedTip",
    description: "Remove a personalized tip by ID or category",
    parameters: [
      {
        name: "identifier",
        type: "string",
        description: "Tip ID or category to remove",
        required: true,
      }
    ],
    handler: ({ identifier }) => {
      setPersonalizedTips(prev => prev.filter(tip => 
        tip.id !== identifier && tip.category !== identifier
      ));
    },
  });

  // AI Action: Get health summary
  useCopilotAction({
    name: "getHealthSummary",
    description: "Get a comprehensive health summary and insights",
    parameters: [],
    handler: () => {
      const summary = {
        overallHealth: healthOverview.overallScore >= 80 ? "Excellent" : 
                      healthOverview.overallScore >= 70 ? "Good" : 
                      healthOverview.overallScore >= 60 ? "Average" : "Needs Improvement",
        topAreas: [
          { name: "Fertility", score: healthOverview.fertilityScore },
          { name: "Cycle Health", score: healthOverview.cycleHealth },
          { name: "Nutrition", score: healthOverview.nutritionScore }
        ].sort((a, b) => b.score - a.score),
        needsAttention: [
          { name: "Exercise", score: healthOverview.exerciseScore },
          { name: "Lifestyle", score: healthOverview.lifestyleScore }
        ].filter(area => area.score < 70),
        recentRecords: quickRecords.slice(0, 3),
        activeTips: personalizedTips.length
      };
      return summary;
    },
  });

  const getTipIcon = (type: string) => {
    switch (type) {
      case 'reminder': return '⏰';
      case 'suggestion': return '💡';
      case 'warning': return '⚠️';
      case 'achievement': return '🎉';
      default: return '📝';
    }
  };

  const getTipColor = (type: string) => {
    switch (type) {
      case 'reminder': return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'suggestion': return 'border-green-200 bg-green-50 text-green-800';
      case 'warning': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'achievement': return 'border-purple-200 bg-purple-50 text-purple-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'weight': return '⚖️';
      case 'mood': return '😊';
      case 'symptom': return '🤒';
      case 'exercise': return '🏃‍♀️';
      case 'meal': return '🍽️';
      case 'sleep': return '😴';
      case 'water': return '💧';
      default: return '📝';
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <main className="flex flex-col gap-8">
              {/* Header */}
              <div className="flex items-center justify-center mb-4">
                <Image
                  className="dark:invert"
                  src="/next.svg"
                  alt="Next.js logo"
                  width={180}
                  height={38}
                  priority
                />
              </div>
              
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-red-400 bg-clip-text text-transparent">
                  FemTracker Agent
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Your Intelligent Women&apos;s Health Assistant - AI-Powered Comprehensive Health Guidance
                </p>
              </div>

              {/* Health Overview */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">🎯 Health Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">{healthOverview.overallScore}</div>
                    <div className="text-sm text-gray-600">Overall Health</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600 mb-1">{healthOverview.cycleHealth}</div>
                    <div className="text-sm text-gray-600">Cycle Health</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">{healthOverview.nutritionScore}</div>
                    <div className="text-sm text-gray-600">Nutrition</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600 mb-1">{healthOverview.exerciseScore}</div>
                    <div className="text-sm text-gray-600">Exercise</div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Last updated: {healthOverview.lastUpdated}
                </p>
              </div>

              {/* Quick Records */}
              {quickRecords.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">📝 Recent Quick Records</h2>
                  <div className="space-y-3">
                    {quickRecords.slice(0, 3).map((record, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-xl">{getRecordIcon(record.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{record.type}</span>
                            <span className="text-gray-600">-</span>
                            <span className="text-gray-800">{record.value}</span>
                          </div>
                          {record.notes && (
                            <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{record.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Personalized Tips */}
              {personalizedTips.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">💡 Personalized Tips</h2>
                  <div className="space-y-4">
                    {personalizedTips.slice(0, 3).map((tip) => (
                      <div key={tip.id} className={`border rounded-lg p-4 ${getTipColor(tip.type)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <span className="text-xl">{getTipIcon(tip.type)}</span>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{tip.category}</span>
                              </div>
                              <p className="text-sm mb-2">{tip.message}</p>
                            </div>
                          </div>
                          {tip.actionText && tip.actionLink && (
                            <Link
                              href={tip.actionLink}
                              className="px-3 py-1 bg-white text-gray-700 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium whitespace-nowrap ml-4"
                            >
                              {tip.actionText}
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Health Dashboard Entry */}
              <div className="w-full">
                <Link
                  href="/dashboard"
                  className="w-full rounded-2xl border border-solid border-transparent transition-colors flex items-center justify-center bg-gradient-to-r from-purple-600 via-pink-500 to-red-400 text-white gap-3 hover:from-purple-700 hover:via-pink-600 hover:to-red-500 font-semibold text-lg h-16 px-8 shadow-lg"
                >
                  📊 Health Dashboard - View Comprehensive Health Status
                </Link>
              </div>

              {/* Professional Agent Navigation */}
              <div className="w-full">
                <h2 className="text-xl font-semibold mb-6 text-center">🤖 Professional Health Assistants</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link
                    href="/cycle-tracker"
                    className="group rounded-xl border border-solid border-gray-200 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-red-50 text-gray-800 gap-2 hover:from-pink-100 hover:to-red-100 hover:shadow-md font-medium text-sm p-6 h-32"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">🩸</span>
                    <span className="font-semibold">Cycle Tracking</span>
                    <span className="text-xs text-gray-600 text-center">Menstrual cycle recording and prediction</span>
                  </Link>
                  
                  <Link
                    href="/symptom-mood"
                    className="group rounded-xl border border-solid border-gray-200 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800 gap-2 hover:from-blue-100 hover:to-purple-100 hover:shadow-md font-medium text-sm p-6 h-32"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">😰</span>
                    <span className="font-semibold">Symptoms & Mood</span>
                    <span className="text-xs text-gray-600 text-center">Symptom tracking and mood management</span>
                  </Link>

                  <Link
                    href="/fertility"
                    className="group rounded-xl border border-solid border-gray-200 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 text-gray-800 gap-2 hover:from-green-100 hover:to-emerald-100 hover:shadow-md font-medium text-sm p-6 h-32"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">🤰</span>
                    <span className="font-semibold">Fertility Health</span>
                    <span className="text-xs text-gray-600 text-center">Ovulation prediction and conception guidance</span>
                  </Link>

                  <Link
                    href="/nutrition"
                    className="group rounded-xl border border-solid border-gray-200 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50 text-gray-800 gap-2 hover:from-orange-100 hover:to-yellow-100 hover:shadow-md font-medium text-sm p-6 h-32"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">🥗</span>
                    <span className="font-semibold">Nutrition Guidance</span>
                    <span className="text-xs text-gray-600 text-center">Nutritional supplements and dietary advice</span>
                  </Link>

                  <Link
                    href="/exercise"
                    className="group rounded-xl border border-solid border-gray-200 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 text-gray-800 gap-2 hover:from-teal-100 hover:to-cyan-100 hover:shadow-md font-medium text-sm p-6 h-32"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">🏃‍♀️</span>
                    <span className="font-semibold">Exercise Health</span>
                    <span className="text-xs text-gray-600 text-center">Activity tracking and fitness advice</span>
                  </Link>

                  <Link
                    href="/lifestyle"
                    className="group rounded-xl border border-solid border-gray-200 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 text-gray-800 gap-2 hover:from-indigo-100 hover:to-purple-100 hover:shadow-md font-medium text-sm p-6 h-32"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">😴</span>
                    <span className="font-semibold">Lifestyle</span>
                    <span className="text-xs text-gray-600 text-center">Sleep and stress management</span>
                  </Link>
                </div>
              </div>

              {/* Additional Features */}
              <div className="w-full">
                <h2 className="text-lg font-medium mb-4 text-center text-gray-600">🔧 More Features</h2>
                <div className="flex gap-4 items-center flex-col sm:flex-row justify-center">
                  <Link
                    href="/recipe"
                    className="rounded-full border border-solid border-gray-300 transition-colors flex items-center justify-center bg-white text-gray-800 gap-2 hover:bg-gray-50 font-medium text-sm h-10 px-5"
                  >
                    🍳 Smart Recipes
                  </Link>
                  <Link
                    href="/insights"
                    className="rounded-full border border-solid border-purple-300 transition-colors flex items-center justify-center bg-purple-50 text-purple-800 gap-2 hover:bg-purple-100 font-medium text-sm h-10 px-5"
                  >
                    📊 Health Insights
                  </Link>
                  <Link
                    href="/settings"
                    className="rounded-full border border-solid border-emerald-300 transition-colors flex items-center justify-center bg-emerald-50 text-emerald-800 gap-2 hover:bg-emerald-100 font-medium text-sm h-10 px-5"
                  >
                    ⚙️ Settings
                  </Link>
                  <a
                    className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm h-10 px-5"
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    💻 Source Code
                  </a>
                </div>
              </div>

              <div className="text-sm text-gray-500 text-center max-w-4xl mx-auto">
                <p className="font-medium mb-3">🌟 System Features:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500">🤖</span>
                    <span>AI-Powered Health Assistant</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-pink-500">🩸</span>
                    <span>Smart Menstrual Cycle Tracking</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">📊</span>
                    <span>Comprehensive Health Data Analysis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500">🤰</span>
                    <span>Conception and Fertility Health Guidance</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-500">🥗</span>
                    <span>Personalized Nutrition and Exercise Advice</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-500">😴</span>
                    <span>Sleep and Emotional Health Management</span>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* AI Sidebar */}
      <CopilotSidebar
        instructions="You are a smart home health assistant helping users navigate their health journey and manage their wellness data. You have access to the user's complete health overview and can help them:

1. **Smart Navigation:**
   - Navigate to any health tracking page or feature
   - Quick access to specific health tools and resources
   - Jump to relevant pages based on user needs

2. **Health Overview Management:**
   - View and update health scores across all categories
   - Monitor overall health status and progress
   - Track health improvements over time

3. **Quick Data Recording:**
   - Rapidly record weight, mood, symptoms, exercise, meals, sleep, or water intake
   - Add notes and context to health records
   - Maintain daily health tracking streaks

4. **Personalized Health Tips:**
   - Add custom reminders and health suggestions
   - Create achievement celebrations and warnings
   - Manage health tips based on user patterns and needs

5. **Health Insights:**
   - Provide comprehensive health summaries
   - Identify areas that need attention
   - Analyze health trends and patterns
   - Suggest action plans for improvement

6. **Intelligent Recommendations:**
   - Based on cycle phase, suggest appropriate activities
   - Recommend nutrition and exercise based on current health status
   - Provide timely reminders for health tracking

You can see all health data in real-time and provide intelligent, personalized guidance to help users achieve their wellness goals."
        defaultOpen={false}
        labels={{
          title: "Home Health AI Assistant",
          initial: "🏠 Welcome to your Personal Health Hub! I'm your AI assistant ready to help you navigate your health journey.\n\n**🎯 Health Overview:**\n- \"What's my overall health status?\"\n- \"Update my exercise score to 80\"\n- \"Show me areas that need attention\"\n\n**🚀 Smart Navigation:**\n- \"Take me to nutrition tracking\"\n- \"Navigate to cycle tracker\"\n- \"Open health dashboard\"\n\n**📝 Quick Recording:**\n- \"Record my weight as 58 kg\"\n- \"Log that I'm feeling happy today\"\n- \"Add exercise: 30 minutes yoga\"\n- \"Record meal: healthy breakfast\"\n\n**💡 Personal Tips:**\n- \"Add reminder to drink more water\"\n- \"Create achievement for 7-day streak\"\n- \"Remove the exercise warning\"\n\n**📊 Health Insights:**\n- \"Give me my health summary\"\n- \"What should I focus on this week?\"\n- \"Show me my recent activity\"\n\nI'm here to make your health tracking effortless and provide personalized guidance based on your unique health patterns!"
        }}
      />
    </div>
  );
}
