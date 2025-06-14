"use client";

import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import Link from "next/link";
import "@copilotkit/react-ui/styles.css";

export default function SymptomMoodTracker() {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const moods = [
    { emoji: "😊", label: "开心", value: "happy" },
    { emoji: "😐", label: "平常", value: "neutral" },
    { emoji: "😔", label: "低落", value: "sad" },
    { emoji: "😡", label: "烦躁", value: "angry" },
    { emoji: "😰", label: "焦虑", value: "anxious" },
    { emoji: "😴", label: "疲惫", value: "tired" }
  ];

  const symptoms = [
    { icon: "🤕", label: "头痛", value: "headache" },
    { icon: "😣", label: "腹痛", value: "abdominal_pain" },
    { icon: "🤒", label: "乳房胀痛", value: "breast_tenderness" },
    { icon: "😵", label: "恶心", value: "nausea" },
    { icon: "💧", label: "分泌物变化", value: "discharge_change" },
    { icon: "🌡️", label: "体温变化", value: "temperature_change" },
    { icon: "😪", label: "失眠", value: "insomnia" },
    { icon: "🍎", label: "食欲变化", value: "appetite_change" }
  ];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
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
                    😰 症状情绪助手
                  </h1>
                  <p className="text-sm text-gray-600">记录症状与情绪，获得健康管理建议</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  AI 情绪分析
                </span>
              </div>
            </div>
          </header>

          {/* 主要内容 */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* 今日情绪记录 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">今日情绪状态</h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {moods.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        selectedMood === mood.value
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-3xl">{mood.emoji}</span>
                      <span className="text-sm font-medium text-gray-700">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 症状记录 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">症状记录</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {symptoms.map((symptom) => (
                    <button
                      key={symptom.value}
                      onClick={() => toggleSymptom(symptom.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        selectedSymptoms.includes(symptom.value)
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-2xl">{symptom.icon}</span>
                      <span className="text-sm font-medium text-gray-700 text-center">{symptom.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 情绪趋势图表 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">情绪趋势（最近7天）</h2>
                <div className="relative h-48 bg-gray-50 rounded-lg p-4">
                  {/* 简化的情绪趋势图 */}
                  <div className="h-full flex items-end justify-between">
                    {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, index) => {
                      const heights = [60, 40, 80, 70, 50, 85, 75]; // 示例数据
                      return (
                        <div key={day} className="flex flex-col items-center gap-2">
                          <div
                            className="bg-gradient-to-t from-blue-400 to-purple-400 rounded-t-md w-8 transition-all hover:opacity-75"
                            style={{ height: `${heights[index]}%` }}
                          ></div>
                          <span className="text-xs text-gray-600">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <span>情绪指数</span>
                  </div>
                  <span>•</span>
                  <span>平均情绪指数: 67/100</span>
                </div>
              </div>

              {/* 症状统计 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">本月症状统计</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🤕</span>
                        <span className="font-medium text-gray-800">头痛</span>
                      </div>
                      <span className="text-red-600 font-bold">8次</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">😣</span>
                        <span className="font-medium text-gray-800">腹痛</span>
                      </div>
                      <span className="text-yellow-600 font-bold">5次</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🤒</span>
                        <span className="font-medium text-gray-800">乳房胀痛</span>
                      </div>
                      <span className="text-purple-600 font-bold">3次</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">😪</span>
                        <span className="font-medium text-gray-800">失眠</span>
                      </div>
                      <span className="text-blue-600 font-bold">6次</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">😵</span>
                        <span className="font-medium text-gray-800">恶心</span>
                      </div>
                      <span className="text-green-600 font-bold">2次</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg border border-teal-200">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🍎</span>
                        <span className="font-medium text-gray-800">食欲变化</span>
                      </div>
                      <span className="text-teal-600 font-bold">4次</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI健康建议 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-sm border border-blue-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🤖</span>
                  <h2 className="text-xl font-semibold text-gray-800">AI 健康建议</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                    <span className="text-lg">💡</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">情绪管理建议</p>
                      <p className="text-xs text-gray-600">您本周情绪较为稳定，建议继续保持规律作息和适度运动来维持良好的情绪状态</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                    <span className="text-lg">⚠️</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">症状关注</p>
                      <p className="text-xs text-gray-600">头痛频率较高，建议注意休息并观察是否与月经周期相关，必要时咨询医生</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                    <span className="text-lg">🧘‍♀️</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">放松建议</p>
                      <p className="text-xs text-gray-600">可以尝试冥想、深呼吸或瑜伽来缓解压力，改善睡眠质量</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 快速记录按钮 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">快速操作</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors">
                    <span className="text-2xl">💊</span>
                    <span className="text-sm font-medium text-gray-800">服用药物</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors">
                    <span className="text-2xl">📝</span>
                    <span className="text-sm font-medium text-gray-800">添加笔记</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-colors">
                    <span className="text-2xl">🧘‍♀️</span>
                    <span className="text-sm font-medium text-gray-800">冥想提醒</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-xl border border-yellow-200 transition-colors">
                    <span className="text-2xl">📊</span>
                    <span className="text-sm font-medium text-gray-800">生成报告</span>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* CopilotKit 侧边栏 */}
        <CopilotSidebar
          instructions="您是一个专业的女性健康助手，专门帮助用户追踪和管理症状与情绪。您可以回答关于PMS症状、情绪管理、压力缓解等相关问题，并根据用户的记录提供个性化建议。请用温和、关怀的语气与用户交流。"
          labels={{
            title: "😰 症状情绪助手",
            initial: "您好！我是您的专属症状情绪管理助手。我可以帮助您追踪和管理各种生理症状及情绪变化。\n\n我能帮您：\n• 记录和分析症状模式\n• 提供情绪管理建议\n• 解答PMS相关疑问\n• 推荐缓解方法和技巧\n\n请告诉我您今天的感受如何？",
          }}
          defaultOpen={false}
        />
      </div>
    </CopilotKit>
  );
} 