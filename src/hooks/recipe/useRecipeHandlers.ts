import { Recipe, SkillLevel, SpecialPreferences, CookingTime, Ingredient } from "@/types/recipe";
import { cookingTimeValues } from "@/constants/recipe";

interface UseRecipeHandlersProps {
  recipe: Recipe;
  updateRecipe: (partialRecipe: Partial<Recipe>) => void;
  setEditingInstructionIndex: (index: number | null) => void;
}

export const useRecipeHandlers = ({
  recipe,
  updateRecipe,
  setEditingInstructionIndex
}: UseRecipeHandlersProps) => {
  
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateRecipe({
      title: event.target.value,
    });
  };

  const handleSkillLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateRecipe({
      skill_level: event.target.value as SkillLevel,
    });
  };

  const handleDietaryChange = (preference: SpecialPreferences, checked: boolean) => {
    if (checked) {
      updateRecipe({
        special_preferences: [...recipe.special_preferences, preference],
      });
    } else {
      updateRecipe({
        special_preferences: recipe.special_preferences.filter((p) => p !== preference),
      });
    }
  };

  const handleCookingTimeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateRecipe({
      cooking_time: cookingTimeValues[Number(event.target.value)].label as CookingTime,
    });
  };

  const addIngredient = () => {
    updateRecipe({
      ingredients: [...recipe.ingredients, { icon: "🍴", name: "", amount: "" }],
    });
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updatedIngredients = [...recipe.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value,
    };
    updateRecipe({ ingredients: updatedIngredients });
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = [...recipe.ingredients];
    updatedIngredients.splice(index, 1);
    updateRecipe({ ingredients: updatedIngredients });
  };

  const addInstruction = () => {
    const newIndex = recipe.instructions.length;
    updateRecipe({
      instructions: [...recipe.instructions, ""],
    });
    setEditingInstructionIndex(newIndex);

    setTimeout(() => {
      const textareas = document.querySelectorAll('.instructions-container textarea');
      const newTextarea = textareas[textareas.length - 1] as HTMLTextAreaElement;
      if (newTextarea) {
        newTextarea.focus();
      }
    }, 50);
  };

  const updateInstruction = (index: number, value: string) => {
    const updatedInstructions = [...recipe.instructions];
    updatedInstructions[index] = value;
    updateRecipe({ instructions: updatedInstructions });
  };

  const removeInstruction = (index: number) => {
    const updatedInstructions = [...recipe.instructions];
    updatedInstructions.splice(index, 1);
    updateRecipe({ instructions: updatedInstructions });
  };

  return {
    handleTitleChange,
    handleSkillLevelChange,
    handleDietaryChange,
    handleCookingTimeChange,
    addIngredient,
    updateIngredient,
    removeIngredient,
    addInstruction,
    updateInstruction,
    removeInstruction,
  };
}; 