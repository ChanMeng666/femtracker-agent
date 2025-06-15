"use client";

import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import Link from "next/link";

// Main component that wraps everything in CopilotKit
export default function HealthInsights() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <HealthInsightsContent />
    </CopilotKit>
  );
}

// Internal component that uses CopilotKit hooks
function HealthInsightsContent() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("month");

  const timeRanges = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" }
  ];

  const [healthMetrics, setHealthMetrics] = useState([
    { category: "Cycle Health", score: 82, trend: "up", color: "text-pink-600 bg-pink-100" },
    { category: "Nutrition Status", score: 75, trend: "stable", color: "text-orange-600 bg-orange-100" },
    { category: "Exercise Health", score: 68, trend: "up", color: "text-teal-600 bg-teal-100" },
    { category: "Fertility Health", score: 85, trend: "up", color: "text-green-600 bg-green-100" },
    { category: "Lifestyle", score: 72, trend: "down", color: "text-indigo-600 bg-indigo-100" },
    { category: "Symptoms & Mood", score: 76, trend: "stable", color: "text-purple-600 bg-purple-100" }
  ]);

  const overallScore = Math.round(healthMetrics.reduce((sum, metric) => sum + metric.score, 0) / healthMetrics.length);

  const [insights, setInsights] = useState([
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
  ]);

  const [correlationAnalyses, setCorrelationAnalyses] = useState([
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
  ]);

  // Make insights data readable by AI
  useCopilotReadable({
    description: "Current health insights data and analysis",
    value: {
      selectedTimeRange,
      healthMetrics,
      overallScore,
      insights,
      correlationAnalyses,
      timeRanges
    }
  });

  // AI Action: Change time range
  useCopilotAction({
    name: "setTimeRange",
    description: "Change the analysis time range",
    parameters: [{
      name: "timeRange",
      type: "string",
      description: "Time range for analysis (week, month, quarter, year)",
      required: true,
    }],
    handler: ({ timeRange }) => {
      const validRanges = ["week", "month", "quarter", "year"];
      if (validRanges.includes(timeRange)) {
        setSelectedTimeRange(timeRange);
      }
    },
  });

  // AI Action: Update health metric score
  useCopilotAction({
    name: "updateHealthMetric",
    description: "Update a specific health metric score and trend",
    parameters: [
      {
        name: "category",
        type: "string",
        description: "Health category to update",
        required: true,
      },
      {
        name: "score",
        type: "number",
        description: "New score (0-100)",
        required: false,
      },
      {
        name: "trend",
        type: "string",
        description: "Trend direction (up, down, stable)",
        required: false,
      }
    ],
    handler: ({ category, score, trend }) => {
      setHealthMetrics(prev => prev.map(metric => {
        if (metric.category === category) {
          return {
            ...metric,
            ...(score !== undefined && score >= 0 && score <= 100 && { score }),
            ...(trend && ["up", "down", "stable"].includes(trend) && { trend })
          };
        }
        return metric;
      }));
    },
  });

  // AI Action: Add insight
  useCopilotAction({
    name: "addInsight",
    description: "Add a new health insight",
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
        description: "Recommendation text",
        required: false,
      }
    ],
    handler: ({ type, category, title, description, recommendation }) => {
      const validTypes = ["positive", "improvement", "warning", "neutral"];
      if (validTypes.includes(type)) {
        const newInsight = {
          type,
          category,
          title,
          description,
          recommendation: recommendation || ""
        };
        setInsights(prev => [...prev, newInsight]);
      }
    },
  });

  // AI Action: Update insight
  useCopilotAction({
    name: "updateInsight",
    description: "Update an existing insight",
    parameters: [
      {
        name: "title",
        type: "string",
        description: "Title of insight to update",
        required: true,
      },
      {
        name: "description",
        type: "string",
        description: "New description",
        required: false,
      },
      {
        name: "recommendation",
        type: "string",
        description: "New recommendation",
        required: false,
      },
      {
        name: "type",
        type: "string",
        description: "New type (positive, improvement, warning, neutral)",
        required: false,
      }
    ],
    handler: ({ title, description, recommendation, type }) => {
      setInsights(prev => prev.map(insight => {
        if (insight.title === title) {
          return {
            ...insight,
            ...(description && { description }),
            ...(recommendation && { recommendation }),
            ...(type && ["positive", "improvement", "warning", "neutral"].includes(type) && { type })
          };
        }
        return insight;
      }));
    },
  });

  // AI Action: Remove insight
  useCopilotAction({
    name: "removeInsight",
    description: "Remove an insight by title",
    parameters: [{
      name: "title",
      type: "string",
      description: "Title of insight to remove",
      required: true,
    }],
    handler: ({ title }) => {
      setInsights(prev => prev.filter(insight => insight.title !== title));
    },
  });

  // AI Action: Add correlation analysis
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
        description: "Correlation value (0-1)",
        required: true,
      },
      {
        name: "suggestion",
        type: "string",
        description: "Suggestion based on analysis",
        required: true,
      }
    ],
    handler: ({ title, description, correlation, suggestion }) => {
      if (correlation >= 0 && correlation <= 1) {
        const newAnalysis = {
          title,
          description,
          correlation,
          suggestion
        };
        setCorrelationAnalyses(prev => [...prev, newAnalysis]);
      }
    },
  });

  // AI Action: Update correlation analysis
  useCopilotAction({
    name: "updateCorrelationAnalysis",
    description: "Update an existing correlation analysis",
    parameters: [
      {
        name: "title",
        type: "string",
        description: "Title of analysis to update",
        required: true,
      },
      {
        name: "correlation",
        type: "number",
        description: "New correlation value (0-1)",
        required: false,
      },
      {
        name: "suggestion",
        type: "string",
        description: "New suggestion",
        required: false,
      }
    ],
    handler: ({ title, correlation, suggestion }) => {
      setCorrelationAnalyses(prev => prev.map(analysis => {
        if (analysis.title === title) {
          return {
            ...analysis,
            ...(correlation !== undefined && correlation >= 0 && correlation <= 1 && { correlation }),
            ...(suggestion && { suggestion })
          };
        }
        return analysis;
      }));
    },
  });

  // AI Action: Clear all insights
  useCopilotAction({
    name: "clearAllInsights",
    description: "Clear all health insights",
    parameters: [],
    handler: () => {
      setInsights([]);
    },
  });

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
        instructions="You are a professional health insights analyst helping users understand their comprehensive health data and trends. You have access to their complete health insights data and can help them:

1. **Time Range Analysis:**
   - Change analysis time ranges (week, month, quarter, year)
   - Compare health trends across different periods

2. **Health Metrics Management:**
   - Update individual health metric scores (0-100) for categories like Cycle Health, Nutrition, Exercise, etc.
   - Modify trend directions (up, down, stable) for each category
   - Monitor overall health score calculations

3. **Health Insights Management:**
   - Add new health insights with specific types (positive, improvement, warning, neutral)
   - Update existing insights with new descriptions, recommendations, or types
   - Remove outdated or irrelevant insights
   - Clear all insights when needed

4. **Correlation Analysis:**
   - Add new correlation analyses between health factors
   - Update correlation values (0-1) and suggestions
   - Track relationships between different health metrics

5. **Data Analysis & Recommendations:**
   - Analyze health patterns and trends over time
   - Provide personalized improvement suggestions
   - Identify areas requiring attention
   - Generate comprehensive health reports

You can see all health insights data in real-time and make updates to help users achieve optimal health understanding and improvement."
        labels={{
          title: "📊 Health Insights AI Assistant",
          initial: "👋 Hi! I'm your health insights analyst. I can help you understand your health data and provide comprehensive analysis.\n\n**📈 Time Range Analysis:**\n- \"Change time range to this week\"\n- \"Set analysis period to quarterly\"\n\n**📊 Health Metrics:**\n- \"Update Exercise Health score to 80\"\n- \"Set Nutrition trend to up\"\n- \"What's my overall health score?\"\n\n**💡 Insights Management:**\n- \"Add a positive insight about my cycle health\"\n- \"Update the sleep quality insight with new recommendations\"\n- \"Remove the nutrition warning insight\"\n\n**🔗 Correlation Analysis:**\n- \"Add correlation between exercise and sleep quality with 0.75 correlation\"\n- \"Update stress and symptoms correlation to 0.68\"\n\n**📋 Analysis & Reports:**\n- \"Analyze my health trends this month\"\n- \"Which areas need improvement?\"\n- \"Generate a health summary report\"\n- \"What correlations show strongest patterns?\"\n\nI can see all your health data and provide deep insights!"
        }}
        defaultOpen={false}
      />
    </div>
  );
} 