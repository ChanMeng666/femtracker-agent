import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { nutritionFocus } from "@/constants/nutrition";
import { Meal } from "@/types/nutrition";

interface UseNutritionActionsProps {
  waterIntake: number;
  selectedFoodTypes: string[];
  setSelectedFoodTypes: (types: string[] | ((prev: string[]) => string[])) => void;
  todayMeals: Meal[];
  nutritionScore: number;
  totalCalories: number;
  calorieGoal: number;
  proteinData: number;
  carbData: number;
  fatData: number;
  waterPercentage: number;
  addWaterIntake: (amount: number) => void;
}

export const useNutritionActions = ({
  waterIntake,
  selectedFoodTypes,
  setSelectedFoodTypes,
  todayMeals,
  nutritionScore,
  totalCalories,
  calorieGoal,
  proteinData,
  carbData,
  fatData,
  waterPercentage,
  addWaterIntake
}: UseNutritionActionsProps) => {
  
  // Make nutrition data readable by AI
  useCopilotReadable({
    description: "Current nutrition tracking data and status",
    value: {
      waterIntake,
      dailyWaterGoal: 2000,
      waterPercentage,
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
      addWaterIntake(amount);
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

  return null; // This hook only sets up actions, no return value needed
}; 