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
function calculatePhase(dayInCycle: number, periodLength: number = 5): string {
  if (dayInCycle <= periodLength) return "月经期";
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

// 生成个性化健康洞察
function generateHealthInsights(cycleData: CycleData) {
  const insights = [];
  
  // 基于当前周期阶段的洞察
  if (cycleData.currentPhase === "月经期") {
    if (cycleData.currentDay <= 2) {
      insights.push({
        icon: "🩸",
        title: "月经期护理建议",
        content: `您正处于月经期第${cycleData.currentDay}天，这是身体排毒的重要时期。建议多休息，避免剧烈运动，可以适当进行瑜伽或散步。${cycleData.mood ? `考虑到您当前的心情是${cycleData.mood}，` : ''}建议多摄入铁质丰富的食物如红肉、菠菜等。`
      });
    } else {
      insights.push({
        icon: "🌸",
        title: "月经期中后段调理",
        content: `月经期第${cycleData.currentDay}天，经血量通常开始减少。可以适当增加轻度运动，如散步或拉伸。${cycleData.periodLength > 7 ? '您的月经周期较长，建议关注是否有异常出血情况。' : ''}保持充足睡眠有助于身体恢复。`
      });
    }
  } else if (cycleData.currentPhase === "卵泡期") {
    insights.push({
      icon: "🌱",
      title: "卵泡期活力提升",
      content: `卵泡期是身体能量逐渐恢复的时期。这个阶段雌激素水平上升，是进行较强度运动的好时机。建议增加蛋白质摄入，支持卵泡发育。距离排卵还有${cycleData.daysUntilOvulation}天，可以开始关注身体变化。`
    });
  } else if (cycleData.currentPhase === "排卵期") {
    insights.push({
      icon: "🥚",
      title: "排卵期最佳状态",
      content: `您正处于排卵期，这是女性一个月中精力最充沛的时期！雌激素水平达到峰值，适合进行重要决策和挑战性活动。如果有备孕计划，这是最佳受孕期。注意观察排卵症状如分泌物变化。`
    });
  } else if (cycleData.currentPhase === "黄体期") {
    if (cycleData.daysUntilNextPeriod > 7) {
      insights.push({
        icon: "🌙",
        title: "黄体期前期稳定",
        content: `黄体期前期，孕激素开始上升。这个阶段情绪较为稳定，适合完成需要专注力的工作。建议增加复合碳水化合物摄入，如全谷类食物，有助于稳定血糖和情绪。`
      });
    } else {
      insights.push({
        icon: "🌊",
        title: "经前期调理准备",
        content: `距离下次月经还有${cycleData.daysUntilNextPeriod}天，进入经前期。可能会出现情绪波动、乳房胀痛等PMS症状。建议减少咖啡因摄入，增加镁元素补充，进行适度有氧运动缓解不适。`
      });
    }
  }

  // 基于心情的个性化建议
  if (cycleData.mood) {
    const moodLower = cycleData.mood.toLowerCase();
    if (moodLower.includes('难过') || moodLower.includes('沮丧') || moodLower.includes('抑郁')) {
      insights.push({
        icon: "🤗",  
        title: "情绪关怀建议",
        content: `注意到您的心情是${cycleData.mood}，这在月经周期中是正常的。建议多进行深呼吸练习，听舒缓音乐，或者与朋友聊天。维生素B6和镁元素补充可能有助于改善情绪，但请咨询医生后使用。`
      });
    } else if (moodLower.includes('烦躁') || moodLower.includes('焦虑') || moodLower.includes('紧张')) {
      insights.push({
        icon: "🧘‍♀️",
        title: "情绪平衡建议", 
        content: `您目前感到${cycleData.mood}，这与激素波动有关。建议进行冥想或瑜伽练习，避免高糖高咖啡因食物。规律作息和适度运动能帮助平衡情绪。考虑尝试薰衣草精油或洋甘菊茶来放松心情。`
      });
    } else if (moodLower.includes('疲惫') || moodLower.includes('累') || moodLower.includes('疲劳')) {
      insights.push({
        icon: "😴",
        title: "能量恢复建议",
        content: `感受到${cycleData.mood}是身体的正常反应。建议确保每晚7-9小时充足睡眠，多摄入富含铁质的食物如瘦肉、豆类。避免过度劳累，给身体充分休息时间。适当的维生素B群补充可能有助于提升能量。`
      });
    } else if (moodLower.includes('开心') || moodLower.includes('愉快') || moodLower.includes('好')) {
      insights.push({
        icon: "✨",
        title: "积极状态保持", 
        content: `很高兴您的心情是${cycleData.mood}！保持这种积极状态有助于整体健康。这是进行新挑战或重要决策的好时机。继续保持规律作息和均衡饮食，让这种好状态持续更久。`
      });
    }
  }

  // 基于周期长度的建议
  if (cycleData.cycleLength < 21) {
    insights.push({
      icon: "⚠️",
      title: "周期偏短关注",
      content: `您的周期长度为${cycleData.cycleLength}天，相对较短。虽然21-35天都属于正常范围，但如果持续出现短周期，建议咨询妇科医生，了解是否需要进一步检查激素水平。`
    });
  } else if (cycleData.cycleLength > 35) {
    insights.push({
      icon: "📊",
      title: "周期偏长监测",
      content: `您的周期长度为${cycleData.cycleLength}天，相对较长。这可能与生活压力、体重变化或激素水平有关。建议记录详细的周期数据，必要时咨询医生评估甲状腺功能和激素水平。`
    });
  }

  // 基于月经持续时间的建议
  if (cycleData.periodLength > 7) {
    insights.push({
      icon: "🏥",
      title: "月经期时长关注",
      content: `您的月经持续${cycleData.periodLength}天，时间相对较长。建议观察经血量是否过多，是否影响日常生活。如果伴有严重痛经或贫血症状，应及时就医。保持充足铁质摄入很重要。`
    });
  } else if (cycleData.periodLength < 3) {
    insights.push({
      icon: "📋",
      title: "月经期时长监测",
      content: `您的月经持续${cycleData.periodLength}天，时间相对较短。这可能是正常个体差异，但如果伴有其他症状或最近有变化，建议咨询医生了解是否需要进一步评估。`
    });
  }

  // 营养和生活方式建议
  const nutritionAdvice: Record<string, string> = {
    "月经期": "多摄入铁质丰富的食物，如红肉、菠菜、豆类。避免过多冰冷食物，温开水有助于缓解痛经。",
    "卵泡期": "增加蛋白质和维生素E摄入，支持卵泡发育。多吃新鲜蔬果，保持营养均衡。",
    "排卵期": "保持均衡饮食，多喝水。避免过度节食，为身体提供充足能量。",
    "黄体期": "增加复合碳水化合物摄入，如燕麦、全麦面包。适量补充镁元素和维生素B6。"
  };

  insights.push({
    icon: "🥗",
    title: "营养建议",
    content: nutritionAdvice[cycleData.currentPhase] || "保持均衡饮食，多摄入新鲜蔬果和优质蛋白质。"
  });

  return insights.slice(0, 3); // 最多返回3个洞察
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
      const newPhase = calculatePhase(newCurrentDay, cycleData.periodLength);
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

  // 更新当前周期天数的动作
  useCopilotAction({
    name: "updateCurrentDay",
    description: "更新用户当前处于月经周期的第几天",
    parameters: [
      {
        name: "day",
        type: "number",
        description: "当前周期的天数（1-28天）",
        required: true,
      },
    ],
    handler: async ({ day }) => {
      const newPhase = calculatePhase(day, cycleData.periodLength);
      const { daysUntilOvulation, daysUntilNextPeriod } = calculateDays(day, cycleData.cycleLength);
      
      setCycleData(prev => ({
        ...prev,
        currentDay: day,
        currentPhase: newPhase,
        daysUntilOvulation,
        daysUntilNextPeriod
      }));
      
      return `已更新为周期第${day}天，当前处于${newPhase}`;
    },
  });

  // 更新月经持续天数的动作
  useCopilotAction({
    name: "updatePeriodLength",
    description: "更新用户月经持续的天数",
    parameters: [
      {
        name: "length",
        type: "number",
        description: "月经持续天数（通常3-7天）",
        required: true,
      },
    ],
    handler: async ({ length }) => {
      setCycleData(prev => {
        const newPhase = calculatePhase(prev.currentDay, length);
        return {
          ...prev,
          periodLength: length,
          currentPhase: newPhase
        };
      });
      return `已更新月经持续天数为${length}天`;
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
                      strokeDasharray={`${(cycleData.periodLength / cycleData.cycleLength) * 220} ${220 - (cycleData.periodLength / cycleData.cycleLength) * 220}`}
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
                      strokeDasharray={`${((13 - cycleData.periodLength) / cycleData.cycleLength) * 220} ${220 - ((13 - cycleData.periodLength) / cycleData.cycleLength) * 220}`}
                      strokeDashoffset={`-${(cycleData.periodLength / cycleData.cycleLength) * 220}`}
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
                      strokeDasharray={`${(3 / cycleData.cycleLength) * 220} ${220 - (3 / cycleData.cycleLength) * 220}`}
                      strokeDashoffset={`-${(13 / cycleData.cycleLength) * 220}`}
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
                      strokeDasharray={`${((cycleData.cycleLength - 16) / cycleData.cycleLength) * 220} ${220 - ((cycleData.cycleLength - 16) / cycleData.cycleLength) * 220}`}
                      strokeDashoffset={`-${(16 / cycleData.cycleLength) * 220}`}
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
                    <span className="text-sm text-gray-700">月经期 (1-{cycleData.periodLength}天)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-pink-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">卵泡期 ({cycleData.periodLength + 1}-13天)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">排卵期 (14-16天)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">黄体期 (17-{cycleData.cycleLength}天)</span>
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
                    const newPhase = calculatePhase(newCurrentDay, cycleData.periodLength);
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
                {generateHealthInsights(cycleData).map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                    <span className="text-lg">{insight.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{insight.title}</p>
                      <p className="text-xs text-gray-600">{insight.content}</p>
                    </div>
                  </div>
                ))}
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
- 月经持续天数：${cycleData.periodLength}天
- 预计${cycleData.daysUntilOvulation}天后排卵
- 预计${cycleData.daysUntilNextPeriod}天后下次月经
- 当前心情：${cycleData.mood || '未记录'}

您可以使用以下功能：
1. recordPeriodStart - 记录月经开始日期
2. updateCurrentDay - 更新当前周期天数（当用户说"我处于第X天"时使用）
3. updatePeriodLength - 更新月经持续天数（当用户说"我月经持续X天"时使用）
4. recordMood - 记录心情变化
5. recordSymptoms - 记录症状
6. addNote - 添加笔记
7. updateCycleLength - 更新整个周期长度

重要指导原则：
- 当用户说"我处于月经第X天"或类似表达时，使用updateCurrentDay更新天数
- 当用户说"我月经持续X天"或"一次月经大概X天"时，使用updatePeriodLength更新持续天数
- 当用户提到心情时，使用recordMood记录
- 始终确认操作结果并更新页面数据

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