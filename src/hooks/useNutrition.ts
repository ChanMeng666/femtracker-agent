import { useState } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { Meal } from "@/types/nutrition";
import { nutritionFocus } from "@/constants/nutrition";

export const useNutrition = () => {
  const [waterIntake, setWaterIntake] = useState<number>(1200);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<string[]>([]);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([
    { time: "Breakfast", foods: ["Oatmeal", "Blueberries", "Almonds"], calories: 320, nutrients: ["Fiber", "Antioxidants"] },
    { time: "Lunch", foods: ["Salmon", "Green Salad", "Brown Rice"], calories: 480, nutrients: ["Omega-3", "Protein"] },
    { time: "Dinner", foods: ["Chicken Breast", "Broccoli", "Sweet Potato"], calories: 410, nutrients: ["Protein", "Vitamin C"] }
  ]);
  const [calorieGoal, setCalorieGoal] = useState<number>(1400);
  const [nutritionScore, setNutritionScore] = useState<number>(75);
  const [proteinData, setProteinData] = useState<number>(65);
  const [carbData, setCarbData] = useState<number>(140);
  const [fatData, setFatData] = useState<number>(45);

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

  const toggleFoodType = (type: string) => {
    setSelectedFoodTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return {
    waterIntake,
    setWaterIntake,
    selectedFoodTypes,
    todayMeals,
    setTodayMeals,
    calorieGoal,
    setCalorieGoal,
    nutritionScore,
    setNutritionScore,
    proteinData,
    setProteinData,
    carbData,
    setCarbData,
    fatData,
    setFatData,
    totalCalories,
    toggleFoodType,
  };
}; 