"use client";

import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import Link from "next/link";
import "@copilotkit/react-ui/styles.css";

export default function NutritionTracker() {
  const [waterIntake, setWaterIntake] = useState<number>(1200);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<string[]>([]);

  const nutritionFocus = [
    { type: "iron", label: "铁质补充", icon: "🍖", color: "bg-red-50 border-red-200", foods: "红肉、菠菜、豆类" },
    { type: "calcium", label: "钙质补充", icon: "🥛", color: "bg-blue-50 border-blue-200", foods: "奶制品、绿叶菜" },
    { type: "magnesium", label: "镁元素", icon: "🥜", color: "bg-yellow-50 border-yellow-200", foods: "坚果、全谷物" },
    { type: "omega3", label: "Omega-3", icon: "🐟", color: "bg-cyan-50 border-cyan-200", foods: "深海鱼、亚麻籽" },
    { type: "vitaminD", label: "维生素D", icon: "☀️", color: "bg-orange-50 border-orange-200", foods: "蛋黄、奶制品" },
    { type: "antiInflammatory", label: "抗炎食物", icon: "🫐", color: "bg-purple-50 border-purple-200", foods: "浆果、绿茶" }
  ];

  const todayMeals = [
    { time: "早餐", foods: ["燕麦粥", "蓝莓", "杏仁"], calories: 320, nutrients: ["纤维", "抗氧化剂"] },
    { time: "午餐", foods: ["三文鱼", "绿叶沙拉", "糙米"], calories: 480, nutrients: ["Omega-3", "蛋白质"] },
    { time: "晚餐", foods: ["鸡胸肉", "西兰花", "红薯"], calories: 410, nutrients: ["蛋白质", "维生素C"] }
  ];

  const toggleFoodType = (type: string) => {
    setSelectedFoodTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <div className="flex h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50">
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
                    🥗 营养指导助手
                  </h1>
                  <p className="text-sm text-gray-600">个性化营养建议与饮食追踪</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  营养评分: 75分
                </span>
              </div>
            </div>
          </header>

          {/* 主要内容 */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* 今日营养概览 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">今日营养概览</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-1">1210</div>
                    <div className="text-sm text-gray-600">卡路里</div>
                    <div className="text-xs text-green-600 mt-1">目标: 1400</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-1">65g</div>
                    <div className="text-sm text-gray-600">蛋白质</div>
                    <div className="text-xs text-blue-600 mt-1">已达标</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600 mb-1">140g</div>
                    <div className="text-sm text-gray-600">碳水化合物</div>
                    <div className="text-xs text-purple-600 mt-1">适量</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="text-3xl font-bold text-yellow-600 mb-1">45g</div>
                    <div className="text-sm text-gray-600">健康脂肪</div>
                    <div className="text-xs text-yellow-600 mt-1">良好</div>
                  </div>
                </div>
              </div>

              {/* 水分摄入追踪 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">💧 水分摄入追踪</h2>
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">今日饮水量</span>
                      <span className="text-sm text-gray-600">{waterIntake}ml / 2000ml</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-cyan-500 h-4 rounded-full transition-all"
                        style={{ width: `${Math.min((waterIntake / 2000) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0ml</span>
                      <span>1000ml</span>
                      <span>2000ml</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setWaterIntake(prev => prev + 200)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      +200ml
                    </button>
                    <button
                      onClick={() => setWaterIntake(prev => prev + 500)}
                      className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                    >
                      +500ml
                    </button>
                  </div>
                </div>
              </div>

              {/* 营养重点关注 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">🎯 本周营养重点</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nutritionFocus.map((item) => (
                    <button
                      key={item.type}
                      onClick={() => toggleFoodType(item.type)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedFoodTypes.includes(item.type)
                          ? 'border-orange-500 bg-orange-50 shadow-md'
                          : `${item.color} border-2 hover:shadow-sm`
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="font-medium text-gray-800">{item.label}</span>
                      </div>
                      <p className="text-xs text-gray-600 text-left">{item.foods}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 今日饮食记录 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">📝 今日饮食记录</h2>
                <div className="space-y-4">
                  {todayMeals.map((meal, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-800">{meal.time}</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {meal.calories} 卡路里
                          </span>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <span className="text-lg">✏️</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {meal.foods.map((food, foodIndex) => (
                          <span key={foodIndex} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {food}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {meal.nutrients.map((nutrient, nutrientIndex) => (
                          <span key={nutrientIndex} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                            {nutrient}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 营养评分与建议 */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl shadow-sm border border-orange-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🤖</span>
                  <h2 className="text-xl font-semibold text-gray-800">AI 营养建议</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                      <span className="text-lg">✅</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">营养均衡</p>
                        <p className="text-xs text-gray-600">今日蛋白质和健康脂肪摄入充足，继续保持</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                      <span className="text-lg">💧</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">水分提醒</p>
                        <p className="text-xs text-gray-600">建议再补充800ml水分达到每日推荐量</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                      <span className="text-lg">🍎</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">微量元素</p>
                        <p className="text-xs text-gray-600">根据月经周期，建议增加铁质丰富的食物</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                      <span className="text-lg">🥦</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">蔬菜摄入</p>
                        <p className="text-xs text-gray-600">今日蔬菜种类丰富，营养密度很好</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 快速添加食物 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">🍽️ 快速添加</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-colors">
                    <span className="text-2xl">🥗</span>
                    <span className="text-sm font-medium text-gray-800">添加蔬菜</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors">
                    <span className="text-2xl">🍎</span>
                    <span className="text-sm font-medium text-gray-800">添加水果</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-xl border border-yellow-200 transition-colors">
                    <span className="text-2xl">🍞</span>
                    <span className="text-sm font-medium text-gray-800">添加主食</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors">
                    <span className="text-2xl">💊</span>
                    <span className="text-sm font-medium text-gray-800">记录补剂</span>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* CopilotKit 侧边栏 */}
        <CopilotSidebar
          instructions="您是一个专业的营养健康助手，专门帮助用户进行营养追踪和饮食管理。您可以回答关于营养需求、食物搭配、补充剂使用等相关问题，并根据用户的饮食记录提供个性化的营养建议。请用专业、友好的语气与用户交流。"
          labels={{
            title: "🥗 营养指导助手",
            initial: "您好！我是您的专属营养指导助手。我可以帮助您制定个性化的饮食计划，追踪营养摄入，并提供科学的营养建议。\n\n我能帮您：\n• 分析日常营养摄入\n• 制定个性化饮食计划\n• 推荐适合的食物搭配\n• 指导营养补充剂使用\n• 解答营养相关疑问\n\n今天想了解什么营养知识呢？",
          }}
          defaultOpen={false}
        />
      </div>
    </CopilotKit>
  );
} 