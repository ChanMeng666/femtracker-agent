"use client";

import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import Link from "next/link";
import "@copilotkit/react-ui/styles.css";

export default function ExerciseTracker() {
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [exerciseDuration, setExerciseDuration] = useState<number>(30);
  const [exerciseIntensity, setExerciseIntensity] = useState<string>("");

  const exerciseTypes = [
    { type: "cardio", label: "有氧运动", icon: "🏃‍♀️", color: "bg-red-50 border-red-200", examples: "跑步、游泳、骑行" },
    { type: "strength", label: "力量训练", icon: "🏋️‍♀️", color: "bg-blue-50 border-blue-200", examples: "举重、俯卧撑、深蹲" },
    { type: "yoga", label: "瑜伽伸展", icon: "🧘‍♀️", color: "bg-purple-50 border-purple-200", examples: "瑜伽、普拉提、拉伸" },
    { type: "walking", label: "步行散步", icon: "🚶‍♀️", color: "bg-green-50 border-green-200", examples: "散步、快走、爬楼梯" }
  ];

  const intensityLevels = [
    { level: "low", label: "轻度", color: "bg-green-100 text-green-800", description: "轻松对话" },
    { level: "moderate", label: "中度", color: "bg-yellow-100 text-yellow-800", description: "微喘但能说话" },
    { level: "high", label: "高强度", color: "bg-red-100 text-red-800", description: "大喘气" }
  ];

  const weeklyProgress = [
    { day: "周一", minutes: 45, type: "瑜伽" },
    { day: "周二", minutes: 30, type: "跑步" },
    { day: "周三", minutes: 0, type: "休息" },
    { day: "周四", minutes: 40, type: "力量" },
    { day: "周五", minutes: 25, type: "散步" },
    { day: "周六", minutes: 60, type: "游泳" },
    { day: "周日", minutes: 35, type: "瑜伽" }
  ];

  const totalWeeklyMinutes = weeklyProgress.reduce((sum, day) => sum + day.minutes, 0);

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <div className="flex h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
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
                    🏃‍♀️ 运动健康助手
                  </h1>
                  <p className="text-sm text-gray-600">运动追踪与个性化健身建议</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
                  本周: {totalWeeklyMinutes}分钟
                </span>
              </div>
            </div>
          </header>

          {/* 主要内容 */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* 运动概览 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">运动概览</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-teal-50 rounded-xl border border-teal-200">
                    <div className="text-3xl font-bold text-teal-600 mb-1">{totalWeeklyMinutes}</div>
                    <div className="text-sm text-gray-600">本周运动</div>
                    <div className="text-xs text-teal-600 mt-1">分钟</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-1">5</div>
                    <div className="text-sm text-gray-600">活跃天数</div>
                    <div className="text-xs text-blue-600 mt-1">本周</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600 mb-1">68</div>
                    <div className="text-sm text-gray-600">运动评分</div>
                    <div className="text-xs text-purple-600 mt-1">良好</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-1">78%</div>
                    <div className="text-sm text-gray-600">目标达成</div>
                    <div className="text-xs text-green-600 mt-1">150分钟/周</div>
                  </div>
                </div>
              </div>

              {/* 本周运动进度 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">本周运动进度</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">周目标: 150分钟</span>
                    <span className="text-sm text-gray-600">{totalWeeklyMinutes}/150 分钟</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-teal-400 to-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min((totalWeeklyMinutes / 150) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-7 gap-2 mt-6">
                    {weeklyProgress.map((day, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs text-gray-600 mb-2">{day.day}</div>
                        <div 
                          className={`h-16 rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all ${
                            day.minutes > 0 
                              ? 'bg-teal-100 text-teal-800 border border-teal-200' 
                              : 'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}
                        >
                          <div className="text-lg mb-1">
                            {day.minutes > 0 ? getExerciseIcon(day.type) : '😴'}
                          </div>
                          <div>{day.minutes > 0 ? `${day.minutes}分` : '休息'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 运动类型选择 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">今日运动记录</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {exerciseTypes.map((exercise) => (
                    <button
                      key={exercise.type}
                      onClick={() => setSelectedExercise(exercise.type)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedExercise === exercise.type
                          ? 'border-teal-500 bg-teal-50 shadow-md'
                          : `${exercise.color} border-2 hover:shadow-sm`
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{exercise.icon}</span>
                        <span className="font-medium text-gray-800">{exercise.label}</span>
                      </div>
                      <p className="text-xs text-gray-600 text-left">{exercise.examples}</p>
                    </button>
                  ))}
                </div>

                {/* 运动强度选择 */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">运动强度</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {intensityLevels.map((intensity) => (
                      <button
                        key={intensity.level}
                        onClick={() => setExerciseIntensity(intensity.level)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          exerciseIntensity === intensity.level
                            ? 'border-teal-500 bg-teal-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`inline-flex px-2 py-1 rounded-full text-sm font-medium mb-2 ${intensity.color}`}>
                          {intensity.label}
                        </div>
                        <p className="text-xs text-gray-600">{intensity.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 运动时长 */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">运动时长</h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="5"
                      max="120"
                      step="5"
                      value={exerciseDuration}
                      onChange={(e) => setExerciseDuration(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-lg font-semibold text-gray-800 min-w-[60px]">{exerciseDuration}分钟</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5分钟</span>
                    <span>60分钟</span>
                    <span>120分钟</span>
                  </div>
                </div>

                <button className="w-full py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium">
                  记录运动
                </button>
              </div>

              {/* 运动建议 */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl shadow-sm border border-teal-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🤖</span>
                  <h2 className="text-xl font-semibold text-gray-800">AI 运动建议</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                      <span className="text-lg">💪</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">本周表现</p>
                        <p className="text-xs text-gray-600">运动频率很好，建议继续保持5次/周的活跃度</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                      <span className="text-lg">🎯</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">目标达成</p>
                        <p className="text-xs text-gray-600">再运动15分钟即可达成本周150分钟目标</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                      <span className="text-lg">🧘‍♀️</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">运动搭配</p>
                        <p className="text-xs text-gray-600">有氧和力量训练搭配合理，瑜伽有助于放松</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                      <span className="text-lg">📅</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">周期适应</p>
                        <p className="text-xs text-gray-600">经期可选择轻度瑜伽和散步，避免高强度运动</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 快速操作 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">快速操作</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="flex flex-col items-center gap-2 p-4 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors">
                    <span className="text-2xl">🏃‍♀️</span>
                    <span className="text-sm font-medium text-gray-800">开始跑步</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors">
                    <span className="text-2xl">🏋️‍♀️</span>
                    <span className="text-sm font-medium text-gray-800">力量训练</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors">
                    <span className="text-2xl">🧘‍♀️</span>
                    <span className="text-sm font-medium text-gray-800">瑜伽冥想</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-colors">
                    <span className="text-2xl">📊</span>
                    <span className="text-sm font-medium text-gray-800">查看报告</span>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* CopilotKit 侧边栏 */}
        <CopilotSidebar
          instructions="您是一个专业的运动健康助手，专门帮助用户进行运动追踪和健身指导。您可以回答关于运动类型、运动强度、训练计划等相关问题，并根据用户的运动记录和身体状况提供个性化的健身建议。请用专业、激励的语气与用户交流。"
          labels={{
            title: "🏃‍♀️ 运动健康助手",
            initial: "您好！我是您的专属运动健康助手。我可以帮助您制定科学的运动计划，追踪运动进度，并提供个性化的健身指导。\n\n我能帮您：\n• 制定个性化运动计划\n• 追踪运动进度和效果\n• 推荐适合的运动类型\n• 指导运动强度和时长\n• 解答健身相关疑问\n\n想要开始什么类型的运动呢？",
          }}
          defaultOpen={false}
        />
      </div>
    </CopilotKit>
  );
}

function getExerciseIcon(type: string): string {
  const iconMap: { [key: string]: string } = {
    '瑜伽': '🧘‍♀️',
    '跑步': '🏃‍♀️',
    '力量': '🏋️‍♀️',
    '散步': '🚶‍♀️',
    '游泳': '🏊‍♀️'
  };
  return iconMap[type] || '🏃‍♀️';
} 