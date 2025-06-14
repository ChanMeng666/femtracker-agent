"use client";

import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import Link from "next/link";
import "@copilotkit/react-ui/styles.css";

export default function HealthInsights() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("month");

  const timeRanges = [
    { value: "week", label: "本周" },
    { value: "month", label: "本月" },
    { value: "quarter", label: "本季度" },
    { value: "year", label: "本年" }
  ];

  const healthMetrics = [
    { category: "周期健康", score: 82, trend: "up", color: "text-pink-600 bg-pink-100" },
    { category: "营养状况", score: 75, trend: "stable", color: "text-orange-600 bg-orange-100" },
    { category: "运动健康", score: 68, trend: "up", color: "text-teal-600 bg-teal-100" },
    { category: "生育健康", score: 85, trend: "up", color: "text-green-600 bg-green-100" },
    { category: "生活方式", score: 72, trend: "down", color: "text-indigo-600 bg-indigo-100" },
    { category: "症状情绪", score: 76, trend: "stable", color: "text-purple-600 bg-purple-100" }
  ];

  const overallScore = Math.round(healthMetrics.reduce((sum, metric) => sum + metric.score, 0) / healthMetrics.length);

  const insights = [
    {
      type: "positive",
      category: "生育健康",
      title: "排卵规律性良好",
      description: "您的基础体温变化显示排卵周期规律，生育健康状况优秀。继续保持健康的生活方式。",
      recommendation: "建议继续监测基础体温，保持营养均衡"
    },
    {
      type: "improvement",
      category: "运动健康",
      title: "运动量需要增加",
      description: "本月运动时间较上月减少15%，建议增加日常活动量以维持健康体重和心血管健康。",
      recommendation: "制定每周150分钟中等强度运动计划"
    },
    {
      type: "warning",
      category: "睡眠质量",
      title: "睡眠质量下降",
      description: "最近一周睡眠质量评分下降，可能与压力增加有关。建议调整作息时间。",
      recommendation: "建立规律睡前仪式，减少睡前屏幕时间"
    },
    {
      type: "neutral",
      category: "营养状况",
      title: "营养摄入基本均衡",
      description: "整体营养摄入均衡，但铁质摄入略显不足，建议在月经期特别关注铁质补充。",
      recommendation: "增加富含铁质的食物，如瘦肉、菠菜等"
    }
  ];

  const correlationAnalyses = [
    {
      title: "月经周期与情绪波动",
      description: "数据显示您在月经前5-7天情绪波动较大，这是正常的PMS表现",
      correlation: 0.78,
      suggestion: "可考虑在此期间增加放松活动"
    },
    {
      title: "运动与睡眠质量",
      description: "运动日的睡眠质量平均比非运动日高23%",
      correlation: 0.65,
      suggestion: "建议保持规律运动以改善睡眠"
    },
    {
      title: "压力水平与症状强度",
      description: "高压力期间PMS症状明显加重",
      correlation: 0.72,
      suggestion: "学习压力管理技巧可缓解症状"
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
        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 头部导航 */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  ← 仪表盘
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    📊 健康洞察助手
                  </h1>
                  <p className="text-sm text-gray-600">综合健康分析与智能建议</p>
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
                  综合评分: {overallScore}分
                </span>
              </div>
            </div>
          </header>

          {/* 主要内容 */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              
              {/* 健康评分概览 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">健康评分概览</h2>
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

                {/* 总体评分 */}
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                    <div className="text-4xl font-bold text-purple-600">{overallScore}</div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">综合健康评分</div>
                      <div className="text-sm text-gray-600">
                        {overallScore >= 80 ? "优秀" : overallScore >= 70 ? "良好" : overallScore >= 60 ? "一般" : "需改善"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI智能洞察 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">🤖</span>
                  <h2 className="text-xl font-semibold text-gray-800">AI 智能洞察</h2>
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
                              <strong>建议：</strong> {insight.recommendation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 数据关联分析 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">🔗 数据关联分析</h2>
                <div className="space-y-6">
                  {correlationAnalyses.map((analysis, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-800">{analysis.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">相关性</span>
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
                          <strong>💡 建议：</strong> {analysis.suggestion}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 健康趋势图表 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">📈 健康趋势分析</h2>
                
                {/* 简化的趋势图 */}
                <div className="h-64 bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="h-full flex items-end justify-between">
                    {['1周前', '6天前', '5天前', '4天前', '3天前', '2天前', '1天前', '今天'].map((day, index) => {
                      const scores = [72, 75, 78, 74, 76, 79, 77, 78]; // 示例数据
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

                {/* 趋势总结 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600 mb-1">+6%</div>
                    <div className="text-sm text-gray-600">本周改善</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600 mb-1">3项</div>
                    <div className="text-sm text-gray-600">上升指标</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600 mb-1">稳定</div>
                    <div className="text-sm text-gray-600">整体趋势</div>
                  </div>
                </div>
              </div>

              {/* 个性化建议 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-sm border border-purple-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">💝</span>
                  <h2 className="text-xl font-semibold text-gray-800">个性化改善计划</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-white/60 rounded-lg">
                      <h3 className="font-medium text-gray-800 mb-2">🎯 短期目标（本周）</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 增加30分钟日常运动</li>
                        <li>• 每晚10点前开始睡前仪式</li>
                        <li>• 补充富含铁质的食物</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-white/60 rounded-lg">
                      <h3 className="font-medium text-gray-800 mb-2">🏆 中期目标（本月）</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 建立规律运动习惯</li>
                        <li>• 优化睡眠环境</li>
                        <li>• 学习压力管理技巧</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/60 rounded-lg">
                      <h3 className="font-medium text-gray-800 mb-2">📱 智能提醒</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 每日基础体温测量</li>
                        <li>• 睡前1小时放松提醒</li>
                        <li>• 营养补充时间提醒</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-white/60 rounded-lg">
                      <h3 className="font-medium text-gray-800 mb-2">📊 追踪重点</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 睡眠质量变化</li>
                        <li>• 运动对情绪的影响</li>
                        <li>• PMS症状强度</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* CopilotKit 侧边栏 */}
        <CopilotSidebar
          instructions="您是一个专业的健康洞察分析师，拥有综合分析各种健康数据的能力。您可以解读健康趋势、发现数据关联性、提供个性化改善建议。请用专业、洞察力强的语气与用户交流，帮助用户理解复杂的健康数据并制定改善计划。"
          labels={{
            title: "📊 健康洞察助手",
            initial: "您好！我是您的专属健康洞察分析师。我可以帮助您深入理解健康数据，发现隐藏的健康模式，并提供科学的改善建议。\n\n我能帮您：\n• 分析健康数据趋势\n• 发现各项指标关联性\n• 识别健康改善机会\n• 制定个性化健康计划\n• 预测健康风险\n\n想了解哪方面的健康洞察呢？",
          }}
          defaultOpen={false}
        />
      </div>
    </CopilotKit>
  );
} 