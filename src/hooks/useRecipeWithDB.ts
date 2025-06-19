import { useState, useEffect, useMemo, useRef } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { useCoAgent, useCopilotChat } from "@copilotkit/react-core";
import { useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";
import { useAuth } from "./auth/useAuth";
import { supabaseRest } from "@/lib/supabase/rest-client";
import { Recipe, RecipeAgentState, Ingredient, SkillLevel, SpecialPreferences, CookingTime } from "@/types/recipe";
import { INITIAL_STATE, chatSuggestions, cookingTimeValues } from "@/constants/recipe";

// Database types
interface DatabaseRecipe {
  id: string;
  user_id: string;
  title: string;
  skill_level: string;
  cooking_time: string;
  special_preferences: string[];
  ingredients: Ingredient[];
  instructions: string[];
  calories_per_serving?: number;
  servings?: number;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  notes?: string;
  tags?: string[];
  difficulty_rating?: number;
  taste_rating?: number;
  is_favorite?: boolean;
  created_at: string;
  updated_at: string;
}

export const useRecipeWithDB = () => {
  const { user, accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Recipe State
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  
  // Form State
  const [recipeForm, setRecipeForm] = useState<RecipeFormData>({
    name: "",
    description: "",
    servings: 2,
    cookingTime: 30,
    difficulty: "beginner",
    ingredients: [],
    instructions: [],
    dietaryTags: [],
    nutritionInfo: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    },
    notes: ""
  });

  // UI State
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterByDietary, setFilterByDietary] = useState<string[]>([]);

  // CopilotKit integration
  const { state: agentState, setState: setAgentState } = useCoAgent<RecipeAgentState>({
    name: "shared_state",
    initialState: INITIAL_STATE,
  });

  useCopilotChatSuggestions({
    instructions: chatSuggestions,
  });

  const [recipe, setRecipe] = useState(INITIAL_STATE.recipe);
  const { appendMessage, isLoading } = useCopilotChat();
  const [editingInstructionIndex, setEditingInstructionIndex] = useState<number | null>(null);

  const changedKeysRef = useRef<string[]>([]);

  // Make recipe data readable by AI
  useCopilotReadable({
    description: "Current recipe being edited and saved recipes",
    value: {
      currentRecipe: recipe,
      savedRecipesCount: savedRecipes.length,
      recentRecipes: savedRecipes.slice(0, 5).map(r => ({
        id: r.id,
        title: r.title,
        skillLevel: r.skill_level,
        cookingTime: r.cooking_time,
        isFavorite: r.is_favorite
      })),
      favoriteRecipes: savedRecipes.filter(r => r.is_favorite).length,
      recipeTags: [...new Set(savedRecipes.flatMap(r => r.tags || []))],
      averageDifficulty: savedRecipes.length > 0 
        ? Math.round(savedRecipes.reduce((sum, r) => sum + (r.difficulty_rating || 3), 0) / savedRecipes.length)
        : 3
    }
  });

  // Load data on mount
  useEffect(() => {
    if (!user || !accessToken) return;
    loadSavedRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, accessToken]);

  const loadSavedRecipes = async () => {
    if (!user || !accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const result = await supabaseRest.select(
        'recipes',
        '*',
        { user_id: user.id },
        { limit: 50, accessToken }
      );

      if (result.error) {
        console.error('Error loading recipes:', result.error);
        setError('Failed to load recipes');
        return;
      }

      if (result.data) {
        const recipes = result.data.map((recipe: any) => ({
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          servings: recipe.servings,
          cookingTime: recipe.cooking_time,
          difficulty: recipe.difficulty,
          ingredients: recipe.ingredients || [],
          instructions: recipe.instructions || [],
          dietaryTags: recipe.dietary_tags || [],
          nutritionInfo: recipe.nutrition_info || {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
          },
          notes: recipe.notes || "",
          createdAt: recipe.created_at
        }));
        
        setSavedRecipes(recipes);
      }
    } catch (err) {
      console.error('Error loading recipes:', err);
      setError('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  // Save recipe to database
  const saveRecipe = async (recipeData: RecipeFormData) => {
    if (!user || !accessToken) return;

    try {
      const result = await supabaseRest.insert('recipes', {
        user_id: user.id,
        name: recipeData.name,
        description: recipeData.description,
        servings: recipeData.servings,
        cooking_time: recipeData.cookingTime,
        difficulty: recipeData.difficulty,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        dietary_tags: recipeData.dietaryTags,
        nutrition_info: recipeData.nutritionInfo,
        notes: recipeData.notes
      }, accessToken);

      if (result.error) {
        console.error('Error saving recipe:', result.error);
        return;
      }

      // Reload recipes
      await loadSavedRecipes();
      
      // Reset form
      setRecipeForm({
        name: "",
        description: "",
        servings: 2,
        cookingTime: 30,
        difficulty: "beginner",
        ingredients: [],
        instructions: [],
        dietaryTags: [],
        nutritionInfo: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0
        },
        notes: ""
      });
      
    } catch (err) {
      console.error('Error saving recipe:', err);
    }
  };

  // Load a saved recipe
  const loadRecipe = async (recipeId: string) => {
    const savedRecipe = savedRecipes.find(r => r.id === recipeId);
    if (!savedRecipe) return;

    const loadedRecipe: Recipe = {
      title: savedRecipe.name,
      skill_level: savedRecipe.difficulty as SkillLevel,
      cooking_time: savedRecipe.cookingTime as CookingTime,
      special_preferences: savedRecipe.dietaryTags as SpecialPreferences[],
      ingredients: savedRecipe.ingredients,
      instructions: savedRecipe.instructions
    };

    setRecipe(loadedRecipe);
    setCurrentRecipe(loadedRecipe);
    setAgentState({
      ...agentState,
      recipe: loadedRecipe,
    });
  };

  // Delete a recipe
  const deleteRecipe = async (recipeId: string) => {
    if (!user || !accessToken) return false;

    try {
      const result = await supabaseRest.delete('recipes', {
        id: recipeId,
        user_id: user.id,
        accessToken
      });

      if (result.error) {
        console.error('Error deleting recipe:', result.error);
        setError('Failed to delete recipe');
        return false;
      } else {
        setSavedRecipes(prev => prev.filter(r => r.id !== recipeId));
        if (currentRecipe && currentRecipe.id === recipeId) {
          setCurrentRecipe(null);
          setRecipe(INITIAL_STATE.recipe);
        }
        return true;
      }
    } catch (err) {
      console.error('Error deleting recipe:', err);
      setError('Failed to delete recipe');
      return false;
    }
  };

  // CopilotKit Actions
  useCopilotAction({
    name: "saveCurrentRecipe",
    description: "Save the current recipe to the database",
    parameters: [],
    handler: async () => {
      const savedRecipe = await saveRecipe(recipeForm);
      return savedRecipe 
        ? `Recipe "${recipeForm.name}" saved successfully!`
        : "Failed to save recipe";
    },
  });

  useCopilotAction({
    name: "loadSavedRecipe",
    description: "Load a previously saved recipe",
    parameters: [{
      name: "recipeId",
      type: "string",
      description: "ID of the recipe to load",
      required: true,
    }],
    handler: async ({ recipeId }) => {
      await loadRecipe(recipeId);
      return `Recipe loaded successfully!`;
    },
  });

  useCopilotAction({
    name: "deleteRecipe",
    description: "Delete a saved recipe",
    parameters: [{
      name: "recipeId",
      type: "string", 
      description: "ID of the recipe to delete",
      required: true,
    }],
    handler: async ({ recipeId }) => {
      const success = await deleteRecipe(recipeId);
      return success ? "Recipe deleted successfully!" : "Failed to delete recipe";
    },
  });

  useCopilotAction({
    name: "createNewRecipe",
    description: "Start creating a new recipe",
    parameters: [],
    handler: () => {
      setRecipe(INITIAL_STATE.recipe);
      setCurrentRecipe(null);
      setAgentState({
        ...agentState,
        recipe: INITIAL_STATE.recipe,
      });
      return "Started creating a new recipe!";
    },
  });

  // Update recipe function
  const updateRecipe = (partialRecipe: Partial<Recipe>) => {
    setAgentState({
      ...agentState,
      recipe: {
        ...recipe,
        ...partialRecipe,
      },
    });
    setRecipe({
      ...recipe,
      ...partialRecipe,
    });
  };

  // Sync agent state with local state
  const newRecipeState = useMemo(() => {
    const result = { ...recipe };
    const newChangedKeys = [];

    for (const key in recipe) {
      const recipeKey = key as keyof Recipe;
      if (
        agentState &&
        agentState.recipe &&
        agentState.recipe[recipeKey] !== undefined &&
        agentState.recipe[recipeKey] !== null
      ) {
        let agentValue = agentState.recipe[recipeKey];
        const recipeValue = recipe[recipeKey];

        if (typeof agentValue === "string") {
          agentValue = agentValue.replace(/\\n/g, "\n");
        }

        if (JSON.stringify(agentValue) !== JSON.stringify(recipeValue)) {
          (result as Record<keyof Recipe, unknown>)[recipeKey] = agentValue;
          newChangedKeys.push(key);
        }
      }
    }

    if (newChangedKeys.length > 0) {
      changedKeysRef.current = newChangedKeys;
    } else if (!isLoading) {
      changedKeysRef.current = [];
    }

    return result;
  }, [recipe, agentState, isLoading]);

  useEffect(() => {
    setRecipe(newRecipeState);
  }, [newRecipeState]);

  // Event handlers
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

  const handleImproveRecipe = () => {
    if (!isLoading) {
      appendMessage(
        new TextMessage({
          content: "Improve the recipe",
          role: Role.User,
        })
      );
    }
  };

  return {
    // Recipe state
    recipe,
    isLoading,
    editingInstructionIndex,
    setEditingInstructionIndex,
    changedKeysRef,
    
    // Database state
    loading,
    error,
    savedRecipes,
    currentRecipe,
    setCurrentRecipe,
    recipeForm,
    setRecipeForm,
    selectedDietary,
    setSelectedDietary,
    searchTerm,
    setSearchTerm,
    filterByDietary,
    setFilterByDietary,
    
    // Recipe handlers
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
    handleImproveRecipe,
    
    // Database operations
    saveRecipe,
    loadRecipe,
    deleteRecipe,
    loadSavedRecipes,
  };
}; 