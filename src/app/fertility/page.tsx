"use client";

import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import Link from "next/link";
import "@copilotkit/react-ui/styles.css";

export default function FertilityTracker() {
  const [bbt, setBbt] = useState<string>("");
  const [cervicalMucus, setCervicalMucus] = useState<string>("");
  const [ovulationTest, setOvulationTest] = useState<string>("");

  const cervicalMucusTypes = [
    { value: "dry", label: "干燥", icon: "🌵", color: "bg-yellow-50 border-yellow-200" },
    { value: "sticky", label: "粘稠", icon: "🍯", color: "bg-orange-50 border-orange-200" },
    { value: "creamy", label: "乳状", icon: "🥛", color: "bg-blue-50 border-blue-200" },
    { value: "watery", label: "水样", icon: "💧", color: "bg-cyan-50 border-cyan-200" },
    { value: "egg_white", label: "蛋清样", icon: "🥚", color: "bg-green-50 border-green-200" }
  ];

  const ovulationTestResults = [
    { value: "negative", label: "阴性", icon: "❌", color: "bg-red-50 border-red-200" },
    { value: "low", label: "弱阳性", icon: "⚡", color: "bg-yellow-50 border-yellow-200" },
    { value: "positive", label: "阳性", icon: "✅", color: "bg-green-50 border-green-200" }
  ];

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <div className="flex h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
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
                    🤰 生育健康助手
                  </h1>
                  <p className="text-sm text-gray-600">排卵追踪与备孕指导</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  排卵期预测中
                </span>
              </div>
            </div>
          </header>

          {/* 主要内容 */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* 生育状态概览 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">生育状态概览</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-1">85分</div>
                    <div className="text-sm text-gray-600">生育健康评分</div>
                    <div className="text-xs text-green-600 mt-1">状态良好</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600 mb-1">2天后</div>
                    <div className="text-sm text-gray-600">预计排卵时间</div>
                    <div className="text-xs text-purple-600 mt-1">高受孕期</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-1">36.7°C</div>
                    <div className="text-sm text-gray-600">今日基础体温</div>
                    <div className="text-xs text-blue-600 mt-1">正常范围</div>
                  </div>
                </div>
              </div>

              {/* 基础体温记录 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">基础体温记录</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 w-24">今日体温:</label>
                    <input
                      type="number"
                      step="0.1"
                      min="35"
                      max="40"
                      placeholder="36.5"
                      value={bbt}
                      onChange={(e) => setBbt(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <span className="text-sm text-gray-600">°C</span>
                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      记录
                    </button>
                  </div>
                  
                  {/* 体温趋势图 */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">体温趋势图（最近14天）</h3>
                    <div className="h-48 bg-gray-50 rounded-lg p-4 relative">
                      <div className="absolute inset-4 flex items-end justify-between">
                        {Array.from({ length: 14 }, (_, i) => {
                          const temps = [36.2, 36.3, 36.1, 36.4, 36.5, 36.6, 36.8, 37.0, 37.1, 36.9, 37.0, 36.8, 36.7, 36.5];
                          const normalizedHeight = ((temps[i] - 36.0) / 1.5) * 100;
                          const isCurrentDay = i === 13;
                          return (
                            <div key={i} className="flex flex-col items-center gap-1">
                              <div className="text-xs text-gray-600 mb-1">{temps[i]}°</div>
                              <div
                                className={`w-3 rounded-full transition-all ${
                                  isCurrentDay ? 'bg-green-500' : 'bg-blue-400'
                                } ${isCurrentDay ? 'ring-2 ring-green-300' : ''}`}
                                style={{ height: `${Math.max(normalizedHeight, 10)}px` }}
                              ></div>
                              <div className="text-xs text-gray-500 mt-1">{i + 1}</div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 h-px bg-red-300 opacity-50" style={{ bottom: '45%' }}>
                        <span className="absolute right-0 -top-4 text-xs text-red-500">排卵线</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 宫颈粘液记录 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">宫颈粘液记录</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {cervicalMucusTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setCervicalMucus(type.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        cervicalMucus === type.value
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : `${type.color} border-2 hover:shadow-sm`
                      }`}
                    >
                      <span className="text-2xl">{type.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{type.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>提示：</strong> 蛋清样粘液通常表示即将排卵，是最佳受孕时机
                  </p>
                </div>
              </div>

              {/* 排卵试纸记录 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">排卵试纸结果</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ovulationTestResults.map((result) => (
                    <button
                      key={result.value}
                      onClick={() => setOvulationTest(result.value)}
                      className={`flex flex-col items-center gap-2 p-6 rounded-xl border-2 transition-all ${
                        ovulationTest === result.value
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : `${result.color} border-2 hover:shadow-sm`
                      }`}
                    >
                      <span className="text-3xl">{result.icon}</span>
                      <span className="text-lg font-medium text-gray-700">{result.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 受孕几率预测 */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-green-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🎯</span>
                  <h2 className="text-xl font-semibold text-gray-800">受孕几率预测</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                      <span className="text-sm font-medium text-gray-800">今日受孕几率</span>
                      <span className="text-2xl font-bold text-green-600">78%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                      <span className="text-sm font-medium text-gray-800">明日受孕几率</span>
                      <span className="text-2xl font-bold text-purple-600">85%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                      <span className="text-sm font-medium text-gray-800">后天受孕几率</span>
                      <span className="text-2xl font-bold text-orange-600">92%</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                      <span className="text-lg">💡</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">最佳受孕时机</p>
                        <p className="text-xs text-gray-600">未来2-3天是您的最佳受孕期，建议安排同房</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                      <span className="text-lg">📊</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">数据综合分析</p>
                        <p className="text-xs text-gray-600">基于体温、粘液和试纸结果的综合预测</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 备孕建议 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">💝 个性化备孕建议</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🍎</span>
                        <span className="font-medium text-gray-800">营养建议</span>
                      </div>
                      <p className="text-sm text-gray-600">补充叶酸、维生素D和铁质，多吃新鲜蔬果</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🏃‍♀️</span>
                        <span className="font-medium text-gray-800">运动建议</span>
                      </div>
                      <p className="text-sm text-gray-600">适度运动保持健康，避免过度激烈运动</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">😴</span>
                        <span className="font-medium text-gray-800">生活作息</span>
                      </div>
                      <p className="text-sm text-gray-600">保持规律作息，充足睡眠，减少压力</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🚭</span>
                        <span className="font-medium text-gray-800">健康习惯</span>
                      </div>
                      <p className="text-sm text-gray-600">戒烟戒酒，避免有害物质，保持心情愉悦</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* CopilotKit 侧边栏 */}
        <CopilotSidebar
          instructions="您是一个专业的生育健康助手，专门帮助用户追踪排卵、提供备孕指导。您可以回答关于排卵期计算、基础体温、宫颈粘液、排卵试纸等相关问题，并根据用户的数据提供个性化的备孕建议。请用专业、温暖的语气与用户交流。"
          labels={{
            title: "🤰 生育健康助手",
            initial: "您好！我是您的专属生育健康助手。我可以帮助您追踪排卵、分析生育信号，并提供科学的备孕指导。\n\n我能帮您：\n• 分析基础体温变化\n• 解读宫颈粘液信号\n• 指导排卵试纸使用\n• 预测最佳受孕时机\n• 提供个性化备孕建议\n\n有什么关于备孕的问题想要咨询吗？",
          }}
          defaultOpen={false}
        />
      </div>
    </CopilotKit>
  );
} 