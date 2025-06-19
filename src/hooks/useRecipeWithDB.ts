import { useState, useEffect, useMemo, useRef } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { useCoAgent, useCopilotChat } from "@copilotkit/react-core";
import { useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";
import { useAuth } from "./auth/useAuth";
import { supabase } from "@/lib/supabase/client";
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<DatabaseRecipe[]>([]);
  const [currentRecipeId, setCurrentRecipeId] = useState<string | null>(null);

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

  // Load user's recipes on mount
  useEffect(() => {
    if (!user) return;
    loadRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadRecipes = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading recipes:', error);
        setError('Failed to load recipes');
      } else {
        setSavedRecipes(data || []);
      }
    } catch (err) {
      console.error('Error loading recipes:', err);
      setError('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  // Save current recipe to database
  const saveRecipe = async () => {
    if (!user || !recipe.title.trim()) {
      setError('Recipe title is required');
      return null;
    }

    setError(null);

    try {
      const recipeData = {
        user_id: user.id,
        title: recipe.title,
        skill_level: recipe.skill_level,
        cooking_time: recipe.cooking_time,
        special_preferences: recipe.special_preferences,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        servings: 1, // Default servings
        notes: `Recipe created with AI assistance`,
        tags: ['ai-generated']
      };

      let result;

      if (currentRecipeId) {
        // Update existing recipe
        result = await supabase
          .from('recipes')
          .update(recipeData)
          .eq('id', currentRecipeId)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // Create new recipe
        result = await supabase
          .from('recipes')
          .insert([recipeData])
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error saving recipe:', result.error);
        setError('Failed to save recipe');
        return null;
      } else {
        // Update local state
        if (currentRecipeId) {
          setSavedRecipes(prev => prev.map(r => 
            r.id === currentRecipeId ? result.data : r
          ));
        } else {
          setSavedRecipes(prev => [result.data, ...prev]);
          setCurrentRecipeId(result.data.id);
        }
        return result.data;
      }
    } catch (err) {
      console.error('Error saving recipe:', err);
      setError('Failed to save recipe');
      return null;
    }
  };

  // Load a saved recipe
  const loadRecipe = async (recipeId: string) => {
    const savedRecipe = savedRecipes.find(r => r.id === recipeId);
    if (!savedRecipe) return;

    const loadedRecipe: Recipe = {
      title: savedRecipe.title,
      skill_level: savedRecipe.skill_level as SkillLevel,
      cooking_time: savedRecipe.cooking_time as CookingTime,
      special_preferences: savedRecipe.special_preferences as SpecialPreferences[],
      ingredients: savedRecipe.ingredients,
      instructions: savedRecipe.instructions
    };

    setRecipe(loadedRecipe);
    setCurrentRecipeId(recipeId);
    setAgentState({
      ...agentState,
      recipe: loadedRecipe,
    });
  };

  // Delete a recipe
  const deleteRecipe = async (recipeId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting recipe:', error);
        setError('Failed to delete recipe');
        return false;
      } else {
        setSavedRecipes(prev => prev.filter(r => r.id !== recipeId));
        if (currentRecipeId === recipeId) {
          setCurrentRecipeId(null);
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
      const savedRecipe = await saveRecipe();
      return savedRecipe 
        ? `Recipe "${savedRecipe.title}" saved successfully!`
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
      setCurrentRecipeId(null);
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
    currentRecipeId,
    
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
    loadRecipes,
  };
}; 