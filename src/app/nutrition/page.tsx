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
    { type: "iron", label: "Iron Supplement", icon: "🍖", color: "bg-red-50 border-red-200", foods: "Red meat, Spinach, Beans" },
    { type: "calcium", label: "Calcium Supplement", icon: "🥛", color: "bg-blue-50 border-blue-200", foods: "Dairy products, Leafy greens" },
    { type: "magnesium", label: "Magnesium", icon: "🥜", color: "bg-yellow-50 border-yellow-200", foods: "Nuts, Whole grains" },
    { type: "omega3", label: "Omega-3", icon: "🐟", color: "bg-cyan-50 border-cyan-200", foods: "Fish, Flax seeds" },
    { type: "vitaminD", label: "Vitamin D", icon: "☀️", color: "bg-orange-50 border-orange-200", foods: "Egg yolks, Dairy" },
    { type: "antiInflammatory", label: "Anti-inflammatory Foods", icon: "🫐", color: "bg-purple-50 border-purple-200", foods: "Berries, Green tea" }
  ];

  const todayMeals = [
    { time: "Breakfast", foods: ["Oatmeal", "Blueberries", "Almonds"], calories: 320, nutrients: ["Fiber", "Antioxidants"] },
    { time: "Lunch", foods: ["Salmon", "Green Salad", "Brown Rice"], calories: 480, nutrients: ["Omega-3", "Protein"] },
    { time: "Dinner", foods: ["Chicken Breast", "Broccoli", "Sweet Potato"], calories: 410, nutrients: ["Protein", "Vitamin C"] }
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
                    🥗 Nutrition Guidance Assistant
                  </h1>
                  <p className="text-sm text-gray-600">Personalized Nutrition Advice & Diet Tracking</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  Nutrition Score: 75 pts
                </span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Today&apos;s Nutrition Overview */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Today&apos;s Nutrition Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-1">1210</div>
                    <div className="text-sm text-gray-600">Calories</div>
                    <div className="text-xs text-green-600 mt-1">Goal: 1400</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-1">65g</div>
                    <div className="text-sm text-gray-600">Protein</div>
                    <div className="text-xs text-blue-600 mt-1">Goal Met</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600 mb-1">140g</div>
                    <div className="text-sm text-gray-600">Carbohydrates</div>
                    <div className="text-xs text-purple-600 mt-1">Moderate</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="text-3xl font-bold text-yellow-600 mb-1">45g</div>
                    <div className="text-sm text-gray-600">Healthy Fats</div>
                    <div className="text-xs text-yellow-600 mt-1">Good</div>
                  </div>
                </div>
              </div>

              {/* Water Intake Tracking */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">💧 Water Intake Tracking</h2>
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Today&apos;s Water Intake</span>
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

              {/* Weekly Nutrition Focus */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">🎯 Weekly Nutrition Focus</h2>
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

              {/* Today&apos;s Meal Record */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">📝 Today&apos;s Meal Record</h2>
                <div className="space-y-4">
                  {todayMeals.map((meal, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-800">{meal.time}</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {meal.calories} calories
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

              {/* Nutrition Score & Recommendations */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl shadow-sm border border-orange-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🤖</span>
                  <h2 className="text-xl font-semibold text-gray-800">AI Nutrition Recommendations</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-white/60 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">📊</span>
                        <span className="font-medium text-gray-800">Today&apos;s Analysis</span>
                      </div>
                      <p className="text-sm text-gray-600">Your protein intake is excellent! Consider adding more fruits for vitamin C and fiber.</p>
                    </div>
                    <div className="p-4 bg-white/60 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🍎</span>
                        <span className="font-medium text-gray-800">Nutrient Focus</span>
                      </div>
                      <p className="text-sm text-gray-600">Your iron levels may be low during menstruation. Include more leafy greens and lean meats.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/60 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">💡</span>
                        <span className="font-medium text-gray-800">Smart Suggestions</span>
                      </div>
                      <p className="text-sm text-gray-600">Try adding chia seeds to your morning oatmeal for extra omega-3 and calcium.</p>
                    </div>
                    <div className="p-4 bg-white/60 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">⚖️</span>
                        <span className="font-medium text-gray-800">Balance Tip</span>
                      </div>
                      <p className="text-sm text-gray-600">Your meal timing is great! Keep maintaining 3 balanced meals with healthy snacks.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </main>
        </div>

        {/* AI Sidebar */}
        <CopilotSidebar
          instructions="You are a nutrition guidance assistant helping users maintain healthy eating habits and track their nutritional intake. Provide personalized dietary advice based on their meal records, nutritional needs, and health goals."
          defaultOpen={false}
        />
      </div>
    </CopilotKit>
  );
} 