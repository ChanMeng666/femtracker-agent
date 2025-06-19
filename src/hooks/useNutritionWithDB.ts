import { useState, useEffect } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { useAuth } from "./auth/useAuth";
import { supabase } from "@/lib/supabase/client";
import { Meal } from "@/types/nutrition";
import { nutritionFocus } from "@/constants/nutrition";

// Frontend type adaptation for water intake
interface FrontendWaterIntake {
  id: string;
  date: string;
  amountMl: number;
  recordedAt: string;
}

export const useNutritionWithDB = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<string[]>([]);
  const [calorieGoal, setCalorieGoal] = useState<number>(1400);
  const [nutritionScore, setNutritionScore] = useState<number>(75);
  const [proteinData, setProteinData] = useState<number>(65);
  const [carbData, setCarbData] = useState<number>(140);
  const [fatData, setFatData] = useState<number>(45);

  // Database State
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [waterIntakeHistory, setWaterIntakeHistory] = useState<FrontendWaterIntake[]>([]);
  const [todayWaterIntake, setTodayWaterIntake] = useState<number>(0);

  const totalCalories = todayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const dailyWaterGoal = 2000; // ml
  const waterPercentage = Math.min((todayWaterIntake / dailyWaterGoal) * 100, 100);

  // Load data on mount
  useEffect(() => {
    if (!user) return;
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadTodayMeals(),
        loadWaterIntake()
      ]);
    } catch (err) {
      console.error('Error loading nutrition data:', err);
      setError('Failed to load nutrition data');
    } finally {
      setLoading(false);
    }
  };

  const loadTodayMeals = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading meals:', error);
      return;
    }

    if (data) {
      setTodayMeals(data.map(meal => ({
        time: meal.meal_time,
        foods: meal.foods,
        calories: meal.calories || 0,
        nutrients: meal.nutrients || []
      })));
    }
  };

  const loadWaterIntake = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('water_intake')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('recorded_at', { ascending: true });

    if (error) {
      console.error('Error loading water intake:', error);
      return;
    }

    if (data) {
      const intakeHistory = data.map(intake => ({
        id: intake.id,
        date: intake.date,
        amountMl: intake.amount_ml,
        recordedAt: intake.recorded_at
      }));
      
      setWaterIntakeHistory(intakeHistory);
      setTodayWaterIntake(data.reduce((sum, intake) => sum + intake.amount_ml, 0));
    }
  };

  // Add water intake to database
  const addWaterIntake = async (amount: number) => {
    if (!user || amount <= 0) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('water_intake')
        .insert([{
          user_id: user.id,
          date: today,
          amount_ml: amount
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding water intake:', error);
        return;
      }

      const newIntake: FrontendWaterIntake = {
        id: data.id,
        date: data.date,
        amountMl: data.amount_ml,
        recordedAt: data.recorded_at
      };

      setWaterIntakeHistory(prev => [...prev, newIntake]);
      setTodayWaterIntake(prev => prev + amount);
      
    } catch (err) {
      console.error('Error adding water intake:', err);
    }
  };

  // Add meal to database
  const addMeal = async (mealTime: string, foods: string[], calories?: number, nutrients?: string[], notes?: string) => {
    if (!user || foods.length === 0) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('meals')
        .insert([{
          user_id: user.id,
          date: today,
          meal_time: mealTime,
          foods,
          calories,
          nutrients,
          notes
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding meal:', error);
        return;
      }

      const newMeal: Meal = {
        time: data.meal_time,
        foods: data.foods,
        calories: data.calories || 0,
        nutrients: data.nutrients || []
      };

      setTodayMeals(prev => [...prev, newMeal]);
      
    } catch (err) {
      console.error('Error adding meal:', err);
    }
  };

  // Make nutrition data readable by AI
  useCopilotReadable({
    description: "Current nutrition tracking data and status",
    value: {
      todayWaterIntake,
      dailyWaterGoal,
      waterPercentage,
      selectedFoodTypes,
      nutritionScore,
      totalCalories,
      calorieGoal,
      proteinData,
      carbData,
      fatData,
      todayMeals,
      waterIntakeHistory: waterIntakeHistory.slice(-10), // Last 10 entries
      nutritionFocus: nutritionFocus.map(nf => ({
        type: nf.type,
        label: nf.label,
        selected: selectedFoodTypes.includes(nf.type),
        foods: nf.foods
      }))
    }
  });

  // AI Action: Add water intake
  useCopilotAction({
    name: "addWaterIntake",
    description: "Add water intake amount (in ml)",
    parameters: [{
      name: "amount",
      type: "number",
      description: "Amount of water to add in milliliters (e.g., 200, 500)",
      required: true,
    }],
    handler: async ({ amount }) => {
      if (amount > 0 && amount <= 1000) {
        await addWaterIntake(amount);
      }
    },
  });

  // AI Action: Record meal
  useCopilotAction({
    name: "recordMeal",
    description: "Record a meal with foods and nutrition information",
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
        description: "Array of food items consumed",
        required: true,
      },
      {
        name: "calories",
        type: "number",
        description: "Total calories for the meal (optional)",
        required: false,
      },
      {
        name: "nutrients",
        type: "string[]",
        description: "Key nutrients in the meal (optional)",
        required: false,
      },
      {
        name: "notes",
        type: "string",
        description: "Additional notes about the meal (optional)",
        required: false,
      }
    ],
    handler: async ({ mealTime, foods, calories, nutrients, notes }) => {
      await addMeal(mealTime, foods, calories, nutrients, notes);
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

  // AI Action: Update nutrition score
  useCopilotAction({
    name: "updateNutritionScore",
    description: "Update nutrition health score",
    parameters: [{
      name: "score",
      type: "number",
      description: "Nutrition score (0-100)",
      required: true,
    }],
    handler: ({ score }) => {
      if (score >= 0 && score <= 100) {
        setNutritionScore(score);
      }
    },
  });

  // AI Action: Set calorie goal
  useCopilotAction({
    name: "setCalorieGoal",
    description: "Set daily calorie goal",
    parameters: [{
      name: "goal",
      type: "number",
      description: "Daily calorie goal (800-3000)",
      required: true,
    }],
    handler: ({ goal }) => {
      if (goal >= 800 && goal <= 3000) {
        setCalorieGoal(goal);
      }
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
    // UI State
    selectedFoodTypes,
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
    
    // Database State
    todayWaterIntake,
    waterIntakeHistory,
    todayMeals,
    setTodayMeals,
    totalCalories,
    waterPercentage,
    loading,
    error,
    
    // Actions
    addWaterIntake,
    addMeal,
    toggleFoodType,
    loadAllData
  };
}; 