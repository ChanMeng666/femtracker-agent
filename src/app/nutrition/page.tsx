"use client";

import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import Link from "next/link";

// Main component that wraps everything in CopilotKit
export default function NutritionTracker() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <NutritionTrackerContent />
    </CopilotKit>
  );
}

// Internal component that uses CopilotKit hooks
function NutritionTrackerContent() {
  const [waterIntake, setWaterIntake] = useState<number>(1200);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<string[]>([]);
  const [todayMeals, setTodayMeals] = useState([
    { time: "Breakfast", foods: ["Oatmeal", "Blueberries", "Almonds"], calories: 320, nutrients: ["Fiber", "Antioxidants"] },
    { time: "Lunch", foods: ["Salmon", "Green Salad", "Brown Rice"], calories: 480, nutrients: ["Omega-3", "Protein"] },
    { time: "Dinner", foods: ["Chicken Breast", "Broccoli", "Sweet Potato"], calories: 410, nutrients: ["Protein", "Vitamin C"] }
  ]);
  const [calorieGoal, setCalorieGoal] = useState<number>(1400);
  const [nutritionScore, setNutritionScore] = useState<number>(75);
  const [proteinData, setProteinData] = useState<number>(65);
  const [carbData, setCarbData] = useState<number>(140);
  const [fatData, setFatData] = useState<number>(45);

  const nutritionFocus = [
    { type: "iron", label: "Iron Supplement", icon: "🍖", color: "bg-red-50 border-red-200", foods: "Red meat, Spinach, Beans" },
    { type: "calcium", label: "Calcium Supplement", icon: "🥛", color: "bg-blue-50 border-blue-200", foods: "Dairy products, Leafy greens" },
    { type: "magnesium", label: "Magnesium", icon: "🥜", color: "bg-yellow-50 border-yellow-200", foods: "Nuts, Whole grains" },
    { type: "omega3", label: "Omega-3", icon: "🐟", color: "bg-cyan-50 border-cyan-200", foods: "Fish, Flax seeds" },
    { type: "vitaminD", label: "Vitamin D", icon: "☀️", color: "bg-orange-50 border-orange-200", foods: "Egg yolks, Dairy" },
    { type: "antiInflammatory", label: "Anti-inflammatory Foods", icon: "🫐", color: "bg-purple-50 border-purple-200", foods: "Berries, Green tea" }
  ];

  const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);

  // Make nutrition data readable by AI
  useCopilotReadable({
    description: "Current nutrition tracking data and status",
    value: {
      waterIntake,
      dailyWaterGoal: 2000,
      waterPercentage: Math.min((waterIntake / 2000) * 100, 100),
      selectedFoodTypes,
      nutritionScore,
      totalCalories,
      calorieGoal,
      proteinData,
      carbData,
      fatData,
      todayMeals,
      nutritionFocus: nutritionFocus.map(nf => ({
        type: nf.type,
        label: nf.label,
        selected: selectedFoodTypes.includes(nf.type),
        foods: nf.foods
      }))
    }
  });

  // AI Action: Update water intake
  useCopilotAction({
    name: "updateWaterIntake",
    description: "Add water intake amount (in ml)",
    parameters: [{
      name: "amount",
      type: "number",
      description: "Amount of water to add in milliliters (e.g., 200, 500)",
      required: true,
    }],
    handler: ({ amount }) => {
      if (amount > 0 && amount <= 1000) {
        setWaterIntake(prev => Math.min(prev + amount, 3000));
      }
    },
  });

  // AI Action: Set water intake
  useCopilotAction({
    name: "setWaterIntake",
    description: "Set total water intake for today (in ml)",
    parameters: [{
      name: "totalAmount",
      type: "number",
      description: "Total water intake in milliliters (0-3000)",
      required: true,
    }],
    handler: ({ totalAmount }) => {
      if (totalAmount >= 0 && totalAmount <= 3000) {
        setWaterIntake(totalAmount);
      }
    },
  });

  // AI Action: Add meal
  useCopilotAction({
    name: "addMeal",
    description: "Add a new meal to today's meal record",
    parameters: [
      {
        name: "mealTime",
        type: "string",
        description: "Meal time (Breakfast, Lunch, Dinner, Snack)",
        required: true,
      },
      {
        name: "foods",
        type: "string[]",
        description: "Array of food items for this meal",
        required: true,
      },
      {
        name: "calories",
        type: "number",
        description: "Total calories for this meal",
        required: true,
      },
      {
        name: "nutrients",
        type: "string[]",
        description: "Array of key nutrients in this meal (e.g., ['Protein', 'Fiber'])",
        required: false,
      }
    ],
    handler: ({ mealTime, foods, calories, nutrients = [] }) => {
      if (calories > 0 && calories <= 2000 && foods.length > 0) {
        const newMeal = {
          time: mealTime,
          foods,
          calories,
          nutrients
        };
        setTodayMeals(prev => [...prev, newMeal]);
      }
    },
  });

  // AI Action: Update meal
  useCopilotAction({
    name: "updateMeal",
    description: "Update an existing meal in today's meal record",
    parameters: [
      {
        name: "mealTime",
        type: "string",
        description: "Meal time to update (Breakfast, Lunch, Dinner, Snack)",
        required: true,
      },
      {
        name: "foods",
        type: "string[]",
        description: "New array of food items for this meal",
        required: false,
      },
      {
        name: "calories",
        type: "number",
        description: "New total calories for this meal",
        required: false,
      },
      {
        name: "nutrients",
        type: "string[]",
        description: "New array of key nutrients in this meal",
        required: false,
      }
    ],
    handler: ({ mealTime, foods, calories, nutrients }) => {
      setTodayMeals(prev => prev.map(meal => {
        if (meal.time.toLowerCase() === mealTime.toLowerCase()) {
          return {
            ...meal,
            ...(foods && { foods }),
            ...(calories && { calories }),
            ...(nutrients && { nutrients })
          };
        }
        return meal;
      }));
    },
  });

  // AI Action: Remove meal
  useCopilotAction({
    name: "removeMeal",
    description: "Remove a meal from today's meal record",
    parameters: [{
      name: "mealTime",
      type: "string",
      description: "Meal time to remove (Breakfast, Lunch, Dinner, Snack)",
      required: true,
    }],
    handler: ({ mealTime }) => {
      setTodayMeals(prev => prev.filter(meal => 
        meal.time.toLowerCase() !== mealTime.toLowerCase()
      ));
    },
  });

  // AI Action: Set calorie goal
  useCopilotAction({
    name: "setCalorieGoal",
    description: "Set daily calorie goal",
    parameters: [{
      name: "goal",
      type: "number",
      description: "Daily calorie goal (800-3000 calories)",
      required: true,
    }],
    handler: ({ goal }) => {
      if (goal >= 800 && goal <= 3000) {
        setCalorieGoal(goal);
      }
    },
  });

  // AI Action: Update nutrition data
  useCopilotAction({
    name: "updateNutritionData",
    description: "Update nutrition data (protein, carbs, fats, score)",
    parameters: [
      {
        name: "protein",
        type: "number",
        description: "Protein amount in grams (0-200)",
        required: false,
      },
      {
        name: "carbs",
        type: "number",
        description: "Carbohydrates amount in grams (0-500)",
        required: false,
      },
      {
        name: "fats",
        type: "number",
        description: "Healthy fats amount in grams (0-150)",
        required: false,
      },
      {
        name: "score",
        type: "number",
        description: "Nutrition score (0-100)",
        required: false,
      }
    ],
    handler: ({ protein, carbs, fats, score }) => {
      if (protein !== undefined && protein >= 0 && protein <= 200) {
        setProteinData(protein);
      }
      if (carbs !== undefined && carbs >= 0 && carbs <= 500) {
        setCarbData(carbs);
      }
      if (fats !== undefined && fats >= 0 && fats <= 150) {
        setFatData(fats);
      }
      if (score !== undefined && score >= 0 && score <= 100) {
        setNutritionScore(score);
      }
    },
  });

  // AI Action: Add nutrition focus
  useCopilotAction({
    name: "addNutritionFocus",
    description: "Add nutrition focus areas",
    parameters: [{
      name: "focusTypes",
      type: "string[]",
      description: "Array of nutrition focus types (iron, calcium, magnesium, omega3, vitaminD, antiInflammatory)",
      required: true,
    }],
    handler: ({ focusTypes }) => {
      const validTypes = focusTypes.filter((type: string) => 
        nutritionFocus.some(nf => nf.type === type)
      );
      setSelectedFoodTypes(prev => {
        const newTypes = [...new Set([...prev, ...validTypes])];
        return newTypes;
      });
    },
  });

  // AI Action: Remove nutrition focus
  useCopilotAction({
    name: "removeNutritionFocus",
    description: "Remove nutrition focus areas",
    parameters: [{
      name: "focusTypes",
      type: "string[]",
      description: "Array of nutrition focus types to remove",
      required: true,
    }],
    handler: ({ focusTypes }) => {
      setSelectedFoodTypes(prev => 
        prev.filter(type => !focusTypes.includes(type))
      );
    },
  });

  // AI Action: Clear all selections
  useCopilotAction({
    name: "clearNutritionData",
    description: "Clear all nutrition focus selections",
    parameters: [],
    handler: () => {
      setSelectedFoodTypes([]);
    },
  });

  const toggleFoodType = (type: string) => {
    setSelectedFoodTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
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
                  Nutrition Score: {nutritionScore} pts
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
                  <div className="text-3xl font-bold text-green-600 mb-1">{totalCalories}</div>
                  <div className="text-sm text-gray-600">Calories</div>
                  <div className="text-xs text-green-600 mt-1">Goal: {calorieGoal}</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{proteinData}g</div>
                  <div className="text-sm text-gray-600">Protein</div>
                  <div className="text-xs text-blue-600 mt-1">Goal Met</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{carbData}g</div>
                  <div className="text-sm text-gray-600">Carbohydrates</div>
                  <div className="text-xs text-purple-600 mt-1">Moderate</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="text-3xl font-bold text-yellow-600 mb-1">{fatData}g</div>
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
        instructions="You are a nutrition assistant helping users with personalized nutrition advice and diet tracking. You have access to the user's current nutrition data and can help them:

1. **Water Intake Management:**
   - Track and update water intake (0-3000ml)
   - Set total daily water intake

2. **Today's Meal Record Management:**
   - Add new meals (Breakfast, Lunch, Dinner, Snack) with foods, calories, and nutrients
   - Update existing meals (modify foods, calories, or nutrients)
   - Remove meals from today's record

3. **Nutrition Goals & Data:**
   - Set daily calorie goals (800-3000 calories)
   - Update nutrition data (protein 0-200g, carbs 0-500g, fats 0-150g)
   - Adjust nutrition score (0-100 points)

4. **Nutrition Focus Areas:**
   - Add or remove nutrition focus areas (iron, calcium, magnesium, omega3, vitaminD, antiInflammatory)

5. **Analysis & Recommendations:**
   - Analyze current nutrition status and meal data
   - Provide personalized dietary recommendations

Available nutrition focus areas:
- Iron: Red meat, Spinach, Beans
- Calcium: Dairy products, Leafy greens  
- Magnesium: Nuts, Whole grains
- Omega-3: Fish, Flax seeds
- Vitamin D: Egg yolks, Dairy
- Anti-inflammatory Foods: Berries, Green tea

You can see their current nutrition data and make real-time updates to help them achieve their nutrition goals."
        defaultOpen={false}
        labels={{
          title: "Nutrition AI Assistant",
          initial: "👋 Hi! I'm your nutrition assistant. I can help you track your nutrition and provide personalized dietary advice.\n\n**🥗 Meal Management:**\n- \"Add a snack with apple and nuts, 150 calories\"\n- \"Update breakfast to include Greek yogurt and granola, 380 calories\"\n- \"Remove dinner from today's meals\"\n\n**📊 Nutrition Data:**\n- \"Set my calorie goal to 1600\"\n- \"Update my protein to 80g and carbs to 120g\"\n- \"Set nutrition score to 85\"\n\n**💧 Water & Focus:**\n- \"Add 500ml water to my intake\"\n- \"Add iron and calcium to my nutrition focus\"\n- \"Set my water intake to 1800ml\"\n\n**📈 Analysis:**\n- \"What's my current nutrition status?\"\n- \"Analyze my meal balance for today\"\n\nI can see all your data and update it in real-time!"
        }}
      />
    </div>
  );
} 