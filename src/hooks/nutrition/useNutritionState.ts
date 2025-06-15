import { useState } from "react";
import { Meal } from "@/types/nutrition";

export const useNutritionState = () => {
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

  // Calculated values
  const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const waterPercentage = Math.min((waterIntake / 2000) * 100, 100);

  // Helper functions
  const toggleFoodType = (type: string) => {
    setSelectedFoodTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const addWaterIntake = (amount: number) => {
    if (amount > 0 && amount <= 1000) {
      setWaterIntake(prev => Math.min(prev + amount, 3000));
    }
  };

  return {
    // State values
    waterIntake,
    setWaterIntake,
    selectedFoodTypes,
    setSelectedFoodTypes,
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
    
    // Calculated values
    totalCalories,
    waterPercentage,
    
    // Helper functions
    toggleFoodType,
    addWaterIntake,
  };
}; 