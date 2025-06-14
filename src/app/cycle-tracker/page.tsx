"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import Link from "next/link";
import { useState } from "react";
import "@copilotkit/react-ui/styles.css";

interface CycleData {
  currentDay: number;
  currentPhase: string;
  lastPeriodDate: string | null;
  cycleLength: number;
  periodLength: number;
  daysUntilOvulation: number;
  daysUntilNextPeriod: number;
  symptoms: string[];
  mood: string;
  notes: string[];
}

// 计算周期阶段的函数
function calculatePhase(dayInCycle: number): string {
  if (dayInCycle <= 5) return "月经期";
  if (dayInCycle <= 13) return "卵泡期";
  if (dayInCycle <= 16) return "排卵期";
  return "黄体期";
}

// 计算排卵和下次月经的天数
function calculateDays(currentDay: number, cycleLength: number) {
  const ovulationDay = Math.floor(cycleLength * 0.5); // 大约周期的一半
  const daysUntilOvulation = Math.max(0, ovulationDay - currentDay);
  const daysUntilNextPeriod = Math.max(0, cycleLength - currentDay);
  return { daysUntilOvulation, daysUntilNextPeriod };
}

// 将CopilotKit相关的功能提取到一个单独的组件中
function CycleTrackerContent() {
  const [cycleData, setCycleData] = useState<CycleData>({
    currentDay: 1, // 默认第1天，因为用户说今天是第一天来月经
    currentPhase: "月经期",
    lastPeriodDate: new Date().toISOString().split('T')[0], // 今天的日期
    cycleLength: 28,
    periodLength: 5,
    daysUntilOvulation: 13,
    daysUntilNextPeriod: 27,
    symptoms: [],
    mood: "开心", // 用户提到的心情
    notes: []
  });

  // 让 AI 可以读取当前的周期数据
  useCopilotReadable({
    description: "当前用户的月经周期数据",
    value: cycleData,
  });

  // 记录月经开始的动作
  useCopilotAction({
    name: "recordPeriodStart",
    description: "记录月经开始日期",
    parameters: [
      {
        name: "date",
        type: "string",
        description: "月经开始日期 (YYYY-MM-DD 格式)",
        required: true,
      },
    ],
    handler: async ({ date }) => {
      const today = new Date();
      const periodDate = new Date(date);
      const daysDiff = Math.floor((today.getTime() - periodDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const newCurrentDay = Math.max(1, daysDiff);
      const newPhase = calculatePhase(newCurrentDay);
      const { daysUntilOvulation, daysUntilNextPeriod } = calculateDays(newCurrentDay, cycleData.cycleLength);
      
      setCycleData(prev => ({
        ...prev,
        currentDay: newCurrentDay,
        currentPhase: newPhase,
        lastPeriodDate: date,
        daysUntilOvulation,
        daysUntilNextPeriod
      }));
      
      return `已记录月经开始日期：${date}，当前周期第${newCurrentDay}天，处于${newPhase}`;
    },
  });

  // 记录心情的动作
  useCopilotAction({
    name: "recordMood",
    description: "记录当前心情状态",
    parameters: [
      {
        name: "mood",
        type: "string",
        description: "心情描述，如：开心、烦躁、疲惫、正常等",
        required: true,
      },
    ],
    handler: async ({ mood }) => {
      setCycleData(prev => ({
        ...prev,
        mood
      }));
      return `已记录心情：${mood}`;
    },
  });

  // 记录症状的动作
  useCopilotAction({
    name: "recordSymptoms",
    description: "记录月经相关症状",
    parameters: [
      {
        name: "symptoms",
        type: "string",
        description: "症状描述，多个症状用逗号分隔",
        required: true,
      },
    ],
    handler: async ({ symptoms }) => {
      const symptomList = symptoms.split(',').map(s => s.trim());
      setCycleData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, ...symptomList]
      }));
      return `已记录症状：${symptoms}`;
    },
  });

  // 添加笔记的动作
  useCopilotAction({
    name: "addNote",
    description: "添加周期相关笔记",
    parameters: [
      {
        name: "note",
        type: "string",
        description: "要添加的笔记内容",
        required: true,
      },
    ],
    handler: async ({ note }) => {
      setCycleData(prev => ({
        ...prev,
        notes: [...prev.notes, `${new Date().toLocaleDateString()}: ${note}`]
      }));
      return `已添加笔记：${note}`;
    },
  });

  // 更新周期长度的动作
  useCopilotAction({
    name: "updateCycleLength",
    description: "更新用户的平均周期长度",
    parameters: [
      {
        name: "length",
        type: "number",
        description: "新的周期长度（天数）",
        required: true,
      },
    ],
    handler: async ({ length }) => {
      const { daysUntilOvulation, daysUntilNextPeriod } = calculateDays(cycleData.currentDay, length);
      setCycleData(prev => ({
        ...prev,
        cycleLength: length,
        daysUntilOvulation,
        daysUntilNextPeriod
      }));
      return `已更新周期长度为${length}天`;
    },
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-red-50">
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
                  🩸 周期追踪助手
                </h1>
                <p className="text-sm text-gray-600">记录月经周期，获得个性化健康洞察</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
                AI 智能分析
              </span>
            </div>
          </div>
        </header>

        {/* 主要内容 */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* 当前周期状态卡片 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">当前周期状态</h2>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">实时追踪中</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-pink-50 rounded-xl border border-pink-200">
                  <div className="text-3xl font-bold text-pink-600 mb-1">第{cycleData.currentDay}天</div>
                  <div className="text-sm text-gray-600">当前周期</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{cycleData.daysUntilOvulation}天</div>
                  <div className="text-sm text-gray-600">预计排卵</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{cycleData.daysUntilNextPeriod}天</div>
                  <div className="text-sm text-gray-600">下次月经</div>
                </div>
              </div>

              {/* 当前心情和最新记录 */}
              {(cycleData.mood || cycleData.symptoms.length > 0) && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">最新记录</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cycleData.mood && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <span className="text-lg">😊</span>
                        <span className="text-sm text-gray-700">心情：{cycleData.mood}</span>
                      </div>
                    )}
                    {cycleData.symptoms.length > 0 && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                        <span className="text-lg">📝</span>
                        <span className="text-sm text-gray-700">症状：{cycleData.symptoms.slice(-2).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 周期可视化 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">周期可视化</h2>
              <div className="relative">
                {/* 周期环形图 */}
                <div className="w-64 h-64 mx-auto relative">
                  <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
                    {/* 背景圆 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    {/* 月经期 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="39.6 180.4"
                      strokeDashoffset="0"
                      className="text-red-400"
                    />
                    {/* 卵泡期 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="63.8 156.2"
                      strokeDashoffset="-39.6"
                      className="text-pink-400"
                    />
                    {/* 排卵期 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="24.2 195.8"
                      strokeDashoffset="-103.4"
                      className="text-purple-400"
                    />
                    {/* 黄体期 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="92.4 127.6"
                      strokeDashoffset="-127.6"
                      className="text-blue-400"
                    />
                    {/* 当前位置指示器 */}
                    <circle
                      cx="50"
                      cy="15"
                      r="3"
                      fill="currentColor"
                      className="text-gray-800"
                      transform={`rotate(${(cycleData.currentDay / cycleData.cycleLength) * 360} 50 50)`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">第{cycleData.currentDay}天</div>
                      <div className="text-sm text-gray-600">{cycleData.currentPhase}</div>
                    </div>
                  </div>
                </div>
                
                {/* 图例 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">月经期 (1-5天)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-pink-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">卵泡期 (6-13天)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">排卵期 (14-16天)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">黄体期 (17-28天)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 快速记录 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">快速记录</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    const newCurrentDay = 1;
                    const newPhase = "月经期";
                    const { daysUntilOvulation, daysUntilNextPeriod } = calculateDays(newCurrentDay, cycleData.cycleLength);
                    
                    setCycleData(prev => ({
                      ...prev,
                      currentDay: newCurrentDay,
                      currentPhase: newPhase,
                      lastPeriodDate: today,
                      daysUntilOvulation,
                      daysUntilNextPeriod
                    }));
                  }}
                  className="flex flex-col items-center gap-2 p-4 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors"
                >
                  <span className="text-2xl">🩸</span>
                  <span className="text-sm font-medium text-gray-800">开始月经</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors">
                  <span className="text-2xl">🥚</span>
                  <span className="text-sm font-medium text-gray-800">排卵迹象</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-pink-50 hover:bg-pink-100 rounded-xl border border-purple-200 transition-colors">
                  <span className="text-2xl">💊</span>
                  <span className="text-sm font-medium text-gray-800">服用药物</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors">
                  <span className="text-2xl">📝</span>
                  <span className="text-sm font-medium text-gray-800">添加笔记</span>
                </button>
              </div>
            </div>

            {/* AI洞察 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-sm border border-purple-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🤖</span>
                <h2 className="text-xl font-semibold text-gray-800">AI 健康洞察</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                  <span className="text-lg">📊</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">周期规律性分析</p>
                    <p className="text-xs text-gray-600">
                      您当前处于{cycleData.currentPhase}，周期第{cycleData.currentDay}天。
                      {cycleData.mood && `心情状态：${cycleData.mood}。`}
                      建议继续保持良好的生活习惯。
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                  <span className="text-lg">🎯</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">排卵预测</p>
                    <p className="text-xs text-gray-600">
                      根据您的周期数据，预计在{cycleData.daysUntilOvulation}天后排卵，
                      {cycleData.daysUntilNextPeriod}天后下次月经。可以开始监测排卵迹象。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 最近笔记 */}
            {cycleData.notes.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">最近笔记</h2>
                <div className="space-y-2">
                  {cycleData.notes.slice(-3).map((note, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CopilotKit 侧边栏 */}
      <CopilotSidebar
        instructions={`您是一个专业的女性健康助手，专门帮助用户追踪和管理月经周期。

当前用户的周期信息：
- 周期第${cycleData.currentDay}天，处于${cycleData.currentPhase}
- 上次月经开始日期：${cycleData.lastPeriodDate || '未记录'}
- 预计${cycleData.daysUntilOvulation}天后排卵
- 预计${cycleData.daysUntilNextPeriod}天后下次月经
- 当前心情：${cycleData.mood || '未记录'}

您可以：
1. 使用recordPeriodStart记录月经开始日期
2. 使用recordMood记录心情变化
3. 使用recordSymptoms记录症状
4. 使用addNote添加笔记
5. 使用updateCycleLength更新周期长度

请用温和、专业的语气与用户交流，根据她们的数据提供个性化建议。`}
        labels={{
          title: "🩸 周期助手",
          initial: "您好！我是您的专属周期追踪助手。我已经注意到您今天开始了新的月经周期，心情很开心！😊\n\n现在显示您处于月经期第1天。我能帮您：\n• 记录和分析月经周期数据\n• 预测排卵期和下次月经\n• 追踪症状和心情变化\n• 提供个性化健康建议\n\n您可以告诉我任何周期相关的信息，我会实时更新页面上的数据！",
        }}
        defaultOpen={true}
      />
    </div>
  );
}

export default function CycleTracker() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <CycleTrackerContent />
    </CopilotKit>
  );
}