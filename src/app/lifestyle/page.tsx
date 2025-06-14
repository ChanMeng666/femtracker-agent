"use client";

import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import Link from "next/link";
import "@copilotkit/react-ui/styles.css";

export default function LifestyleTracker() {
  const [sleepQuality, setSleepQuality] = useState<string>("");
  const [stressLevel, setStressLevel] = useState<string>("");
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [bedtime, setBedtime] = useState<string>("23:00");
  const [wakeTime, setWakeTime] = useState<string>("06:30");

  const sleepQualityOptions = [
    { value: "excellent", label: "优秀", icon: "😴", color: "bg-green-50 border-green-200", description: "睡得很香，精神饱满" },
    { value: "good", label: "良好", icon: "😊", color: "bg-blue-50 border-blue-200", description: "睡得不错，感觉还好" },
    { value: "fair", label: "一般", icon: "😐", color: "bg-yellow-50 border-yellow-200", description: "睡眠质量一般" },
    { value: "poor", label: "较差", icon: "😞", color: "bg-red-50 border-red-200", description: "睡得不好，感觉疲惫" }
  ];

  const stressLevels = [
    { value: "low", label: "低压力", icon: "😌", color: "bg-green-50 border-green-200", description: "感觉轻松愉快" },
    { value: "moderate", label: "中等压力", icon: "😐", color: "bg-yellow-50 border-yellow-200", description: "有一些压力但可控" },
    { value: "high", label: "高压力", icon: "😰", color: "bg-orange-50 border-orange-200", description: "感觉压力较大" },
    { value: "very_high", label: "极高压力", icon: "😫", color: "bg-red-50 border-red-200", description: "压力山大，很焦虑" }
  ];

  const weeklyData = [
    { day: "周一", sleep: 7.5, quality: "good", stress: "moderate" },
    { day: "周二", sleep: 6.5, quality: "fair", stress: "high" },
    { day: "周三", sleep: 8.0, quality: "excellent", stress: "low" },
    { day: "周四", sleep: 7.0, quality: "good", stress: "moderate" },
    { day: "周五", sleep: 6.0, quality: "poor", stress: "high" },
    { day: "周六", sleep: 9.0, quality: "excellent", stress: "low" },
    { day: "周日", sleep: 8.5, quality: "good", stress: "low" }
  ];

  const averageSleep = weeklyData.reduce((sum, day) => sum + day.sleep, 0) / weeklyData.length;

  const getQualityIcon = (quality: string) => {
    const qualityMap: { [key: string]: string } = {
      'excellent': '😴',
      'good': '😊',
      'fair': '😐',
      'poor': '😞'
    };
    return qualityMap[quality] || '😐';
  };

  const getStressIcon = (stress: string) => {
    const stressMap: { [key: string]: string } = {
      'low': '😌',
      'moderate': '😐',
      'high': '😰',
      'very_high': '😫'
    };
    return stressMap[stress] || '😐';
  };

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
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
                    😴 生活方式助手
                  </h1>
                  <p className="text-sm text-gray-600">睡眠质量与压力管理</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                  生活评分: 72分
                </span>
              </div>
            </div>
          </header>

          {/* 主要内容 */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* 生活方式概览 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">生活方式概览</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                    <div className="text-3xl font-bold text-indigo-600 mb-1">{averageSleep.toFixed(1)}h</div>
                    <div className="text-sm text-gray-600">平均睡眠</div>
                    <div className="text-xs text-indigo-600 mt-1">本周</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600 mb-1">72</div>
                    <div className="text-sm text-gray-600">睡眠质量</div>
                    <div className="text-xs text-purple-600 mt-1">评分</div>
                  </div>
                  <div className="text-center p-4 bg-pink-50 rounded-xl border border-pink-200">
                    <div className="text-3xl font-bold text-pink-600 mb-1">中等</div>
                    <div className="text-sm text-gray-600">压力水平</div>
                    <div className="text-xs text-pink-600 mt-1">平均</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-1">85%</div>
                    <div className="text-sm text-gray-600">作息规律</div>
                    <div className="text-xs text-blue-600 mt-1">良好</div>
                  </div>
                </div>
              </div>

              {/* 睡眠追踪 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">💤 睡眠追踪</h2>
                
                {/* 睡眠时间设置 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">就寝时间</label>
                    <input
                      type="time"
                      value={bedtime}
                      onChange={(e) => setBedtime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">起床时间</label>
                    <input
                      type="time"
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">睡眠时长</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="12"
                        value={sleepHours}
                        onChange={(e) => setSleepHours(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <span className="text-sm text-gray-600">小时</span>
                    </div>
                  </div>
                </div>

                {/* 睡眠质量选择 */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">昨晚睡眠质量</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {sleepQualityOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSleepQuality(option.value)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          sleepQuality === option.value
                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                            : `${option.color} border-2 hover:shadow-sm`
                        }`}
                      >
                        <div className="text-3xl mb-2">{option.icon}</div>
                        <div className="font-medium text-gray-800 mb-1">{option.label}</div>
                        <div className="text-xs text-gray-600">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 本周睡眠趋势 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">本周睡眠趋势</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {weeklyData.map((day, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs text-gray-600 mb-2">{day.day}</div>
                        <div className="bg-gray-100 rounded-lg p-3 space-y-2">
                          <div className="text-2xl">{getQualityIcon(day.quality)}</div>
                          <div className="text-sm font-medium text-gray-800">{day.sleep}h</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 压力管理 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">🧘‍♀️ 压力管理</h2>
                
                {/* 压力水平选择 */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">今日压力水平</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stressLevels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setStressLevel(level.value)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          stressLevel === level.value
                            ? 'border-purple-500 bg-purple-50 shadow-md'
                            : `${level.color} border-2 hover:shadow-sm`
                        }`}
                      >
                        <div className="text-3xl mb-2">{level.icon}</div>
                        <div className="font-medium text-gray-800 mb-1">{level.label}</div>
                        <div className="text-xs text-gray-600">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 压力缓解活动 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">压力缓解活动</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors">
                      <span className="text-2xl">🧘‍♀️</span>
                      <span className="text-sm font-medium text-gray-800">冥想</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors">
                      <span className="text-2xl">🫁</span>
                      <span className="text-sm font-medium text-gray-800">深呼吸</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-colors">
                      <span className="text-2xl">🚶‍♀️</span>
                      <span className="text-sm font-medium text-gray-800">散步</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 bg-pink-50 hover:bg-pink-100 rounded-xl border border-pink-200 transition-colors">
                      <span className="text-2xl">🎵</span>
                      <span className="text-sm font-medium text-gray-800">听音乐</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 生活习惯建议 */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-sm border border-indigo-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">💡</span>
                  <h2 className="text-xl font-semibold text-gray-800">个性化生活建议</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-white/60 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">😴</span>
                        <span className="font-medium text-gray-800">睡眠优化</span>
                      </div>
                      <p className="text-sm text-gray-600">保持规律作息，睡前1小时避免蓝光，创造安静的睡眠环境</p>
                    </div>
                    <div className="p-4 bg-white/60 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🧘‍♀️</span>
                        <span className="font-medium text-gray-800">压力缓解</span>
                      </div>
                      <p className="text-sm text-gray-600">每日10分钟冥想，定期进行深呼吸练习，适当的运动</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/60 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">📱</span>
                        <span className="font-medium text-gray-800">数字健康</span>
                      </div>
                      <p className="text-sm text-gray-600">设置手机夜间模式，睡前1小时减少屏幕时间</p>
                    </div>
                    <div className="p-4 bg-white/60 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🌿</span>
                        <span className="font-medium text-gray-800">环境优化</span>
                      </div>
                      <p className="text-sm text-gray-600">保持卧室温度在18-22°C，使用遮光窗帘，考虑香薰</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI洞察 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🤖</span>
                  <h2 className="text-xl font-semibold text-gray-800">AI 健康洞察</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <span className="text-lg">📊</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">睡眠分析</p>
                      <p className="text-xs text-gray-600">您的睡眠时长合理，但质量有待提升。建议睡前放松训练</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="text-lg">🎯</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">压力模式</p>
                      <p className="text-xs text-gray-600">工作日压力偏高，建议增加放松活动，周末保持低压力状态</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg border border-pink-200">
                    <span className="text-lg">💪</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">改善建议</p>
                      <p className="text-xs text-gray-600">结合运动和冥想，可显著改善睡眠质量和压力管理</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* CopilotKit 侧边栏 */}
        <CopilotSidebar
          instructions="您是一个专业的生活方式健康助手，专门帮助用户管理睡眠质量和压力水平。您可以回答关于睡眠优化、压力缓解、生活习惯改善等相关问题，并根据用户的记录提供个性化的生活方式建议。请用温和、关怀的语气与用户交流。"
          labels={{
            title: "😴 生活方式助手",
            initial: "您好！我是您的专属生活方式健康助手。我可以帮助您改善睡眠质量、管理压力，并建立健康的生活习惯。\n\n我能帮您：\n• 分析睡眠模式和质量\n• 提供压力管理技巧\n• 推荐放松和冥想方法\n• 制定健康作息计划\n• 优化生活环境\n\n最近睡眠质量如何？有什么压力困扰吗？",
          }}
          defaultOpen={false}
        />
      </div>
    </CopilotKit>
  );
} 