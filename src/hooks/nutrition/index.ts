import { useNutritionState } from "./useNutritionState";
import { useNutritionActions } from "./useNutritionActions";

export const useNutrition = () => {
  const state = useNutritionState();
  
  // Set up CopilotKit actions
  useNutritionActions({
    waterIntake: state.waterIntake,
    selectedFoodTypes: state.selectedFoodTypes,
    setSelectedFoodTypes: state.setSelectedFoodTypes,
    todayMeals: state.todayMeals,
    nutritionScore: state.nutritionScore,
    totalCalories: state.totalCalories,
    calorieGoal: state.calorieGoal,
    proteinData: state.proteinData,
    carbData: state.carbData,
    fatData: state.fatData,
    waterPercentage: state.waterPercentage,
    addWaterIntake: state.addWaterIntake
  });

  return state;
}; 