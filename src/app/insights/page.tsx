"use client";

import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import Link from "next/link";

export default function HealthInsights() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("month");

  const timeRanges = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" }
  ];

  const healthMetrics = [
    { category: "Cycle Health", score: 82, trend: "up", color: "text-pink-600 bg-pink-100" },
    { category: "Nutrition Status", score: 75, trend: "stable", color: "text-orange-600 bg-orange-100" },
    { category: "Exercise Health", score: 68, trend: "up", color: "text-teal-600 bg-teal-100" },
    { category: "Fertility Health", score: 85, trend: "up", color: "text-green-600 bg-green-100" },
    { category: "Lifestyle", score: 72, trend: "down", color: "text-indigo-600 bg-indigo-100" },
    { category: "Symptoms & Mood", score: 76, trend: "stable", color: "text-purple-600 bg-purple-100" }
  ];

  const overallScore = Math.round(healthMetrics.reduce((sum, metric) => sum + metric.score, 0) / healthMetrics.length);

  const insights = [
    {
      type: "positive",
      category: "Fertility Health",
      title: "Ovulation Regularity Good",
      description: "Your basal body temperature change shows regular ovulation cycles, with excellent fertility health status. Continue to maintain a healthy lifestyle.",
      recommendation: "Suggestion to continue monitoring basal body temperature and maintaining balanced nutrition"
    },
    {
      type: "improvement",
      category: "Exercise Health",
      title: "Exercise Needs to Increase",
      description: "This month's exercise time decreased by 15% compared to last month. It's recommended to increase daily activity to maintain healthy weight and cardiovascular health.",
      recommendation: "Develop a weekly 150 minutes moderate intensity exercise plan"
    },
    {
      type: "warning",
      category: "Sleep Quality",
      title: "Sleep Quality Decreased",
      description: "The sleep quality score decreased last week, possibly related to increased stress. Suggestion to adjust sleep schedule.",
      recommendation: "Establish a regular sleep ritual, reduce screen time before bed"
    },
    {
      type: "neutral",
      category: "Nutrition Status",
      title: "Nutrition Intake Basic Balance",
      description: "Overall nutrition intake is balanced, but iron intake is slightly insufficient. Suggestion to pay special attention to iron supplementation during menstruation.",
      recommendation: "Increase iron-rich foods, such as lean meat and spinach"
    }
  ];

  const correlationAnalyses = [
    {
      title: "Menstrual Cycle and Mood Fluctuation",
      description: "Data shows that you have a larger mood fluctuation 5-7 days before menstruation, which is normal PMS manifestation",
      correlation: 0.78,
      suggestion: "You can consider increasing relaxation activities during this period"
    },
    {
      title: "Exercise and Sleep Quality",
      description: "Sleep quality on exercise days is 23% higher than non-exercise days",
      correlation: 0.65,
      suggestion: "Suggestion to maintain regular exercise for improved sleep"
    },
    {
      title: "Stress Level and Symptom Intensity",
      description: "PMS symptoms significantly worsened during high-stress periods",
      correlation: 0.72,
      suggestion: "Learning stress management techniques can alleviate symptoms"
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return "📈";
      case "down": return "📉";
      case "stable": return "➡️";
      default: return "➡️";
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "positive": return "✅";
      case "improvement": return "💡";
      case "warning": return "⚠️";
      case "neutral": return "📊";
      default: return "📊";
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "positive": return "border-green-200 bg-green-50";
      case "improvement": return "border-blue-200 bg-blue-50";
      case "warning": return "border-yellow-200 bg-yellow-50";
      case "neutral": return "border-gray-200 bg-gray-50";
      default: return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <div className="flex h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Navigation */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  ← Dashboard
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    📊 Health Insights Assistant
                  </h1>
                  <p className="text-sm text-gray-600">Comprehensive Health Analysis and Intelligent Suggestions</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm"
                >
                  {timeRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  Overall Score: {overallScore} points
                </span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              
              {/* Health Score Overview */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Health Score Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {healthMetrics.map((metric, index) => (
                    <div key={index} className="relative p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-800">{metric.category}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-lg">{getTrendIcon(metric.trend)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-lg font-bold ${metric.color}`}>
                          {metric.score}
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all"
                            style={{ width: `${metric.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Overall Score */}
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                    <div className="text-4xl font-bold text-purple-600">{overallScore}</div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">Overall Health Score</div>
                      <div className="text-sm text-gray-600">
                        {overallScore >= 80 ? "Excellent" : overallScore >= 70 ? "Good" : overallScore >= 60 ? "Average" : "Needs Improvement"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Intelligent Insights */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">🤖</span>
                  <h2 className="text-xl font-semibold text-gray-800">AI Intelligent Insights</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {insights.map((insight, index) => (
                    <div key={index} className={`border rounded-xl p-4 ${getInsightColor(insight.type)}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{getInsightIcon(insight.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-white px-2 py-1 rounded-full font-medium text-gray-600">
                              {insight.category}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-800 mb-2">{insight.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                          <div className="bg-white/80 rounded-lg p-2">
                            <p className="text-xs text-gray-700">
                              <strong>Suggestion:</strong> {insight.recommendation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Correlation Analysis */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">🔗 Data Correlation Analysis</h2>
                <div className="space-y-6">
                  {correlationAnalyses.map((analysis, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-800">{analysis.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Correlation</span>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            analysis.correlation >= 0.7 ? 'bg-red-100 text-red-800' :
                            analysis.correlation >= 0.5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {(analysis.correlation * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{analysis.description}</p>
                      <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                        <p className="text-xs text-blue-800">
                          <strong>💡 Suggestion:</strong> {analysis.suggestion}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Trend Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">📈 Health Trend Analysis</h2>
                
                {/* Simplified Trend Chart */}
                <div className="h-64 bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="h-full flex items-end justify-between">
                    {['1 week ago', '6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', '1 day ago', 'Today'].map((day, index) => {
                      const scores = [72, 75, 78, 74, 76, 79, 77, 78]; // Sample data
                      const normalizedHeight = (scores[index] / 100) * 100;
                      return (
                        <div key={day} className="flex flex-col items-center gap-2">
                          <div className="text-xs text-gray-600 mb-1">{scores[index]}</div>
                          <div
                            className="bg-gradient-to-t from-purple-400 to-pink-400 rounded-t-md w-6 transition-all hover:opacity-75"
                            style={{ height: `${normalizedHeight}%` }}
                          ></div>
                          <div className="text-xs text-gray-500 transform -rotate-45 origin-left">{day}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Trend Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600 mb-1">+6%</div>
                    <div className="text-sm text-gray-600">This Week Improvement</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600 mb-1">3 items</div>
                    <div className="text-sm text-gray-600">Rising Indicators</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600 mb-1">Stable</div>
                    <div className="text-sm text-gray-600">Overall Trend</div>
                  </div>
                </div>
              </div>

              {/* Personalized Recommendations */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-sm border border-purple-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">💝</span>
                  <h2 className="text-xl font-semibold text-gray-800">Personalized Improvement Plan</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-white/60 rounded-lg">
                      <h3 className="font-medium text-gray-800 mb-2">🎯 Short-term Goal (This Week)</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Maintain regular sleep schedule (7-8 hours)</li>
                        <li>• Record symptoms daily for better tracking</li>
                        <li>• Increase water intake to 8 glasses per day</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-white/60 rounded-lg">
                      <h3 className="font-medium text-gray-800 mb-2">🌟 Long-term Goal (This Month)</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Establish consistent exercise routine</li>
                        <li>• Optimize nutrition based on cycle phases</li>
                        <li>• Improve stress management techniques</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/60 rounded-lg">
                      <h3 className="font-medium text-gray-800 mb-2">📚 Recommended Resources</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• <a href="#" className="text-purple-600 hover:underline">Cycle-based Nutrition Guide</a></li>
                        <li>• <a href="#" className="text-purple-600 hover:underline">Mindfulness and Stress Relief</a></li>
                        <li>• <a href="#" className="text-purple-600 hover:underline">Exercise During Different Phases</a></li>
                      </ul>
                    </div>
                    <div className="p-4 bg-white/60 rounded-lg">
                      <h3 className="font-medium text-gray-800 mb-2">🔔 Reminder Settings</h3>
                      <div className="space-y-2">
                        <button className="w-full text-left px-3 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm hover:bg-purple-200 transition-colors">
                          Set Daily Health Check Reminder
                        </button>
                        <button className="w-full text-left px-3 py-2 bg-pink-100 text-pink-800 rounded-lg text-sm hover:bg-pink-200 transition-colors">
                          Enable Weekly Progress Review
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* CopilotKit Sidebar */}
        <CopilotSidebar
          instructions="You are a professional health data analyst, dedicated to helping users understand their health data and trends. You need to: 1. Analyze health data patterns 2. Provide personalized health insights 3. Suggest improvement plans 4. Answer questions about health trends. Please answer in a professional and caring manner."
          labels={{
            title: "📊 Health Insights Assistant",
            initial: "Hello! I'm your health insights assistant. I can help you: \n\n• Analyze your health data trends \n• Provide personalized health insights \n• Create improvement plans \n• Answer questions about your health patterns \n\nWhat would you like to explore about your health data?",
          }}
          defaultOpen={false}
        />
      </div>
    </CopilotKit>
  );
} 