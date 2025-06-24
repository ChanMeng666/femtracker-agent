import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { useCoAgent, useCopilotChat } from "@copilotkit/react-core";
import { useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";
import { useAuth } from "./auth/useAuth";
import { supabaseRest } from "@/lib/supabase/restClient";
import { Recipe, RecipeAgentState, Ingredient, SkillLevel, SpecialPreferences, CookingTime, DatabaseRecipe, RecipeSearchOptions } from "@/types/recipe";
import { INITIAL_STATE, chatSuggestions, cookingTimeValues } from "@/constants/recipe";

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
    description: "Current recipe being edited and saved recipes with all metadata",
    value: {
      currentRecipe: recipe,
      savedRecipesCount: savedRecipes.length,
      recentRecipes: savedRecipes.slice(0, 5).map(r => ({
        id: r.id,
        title: r.title,
        skillLevel: r.skill_level,
        cookingTime: r.cooking_time,
        isFavorite: r.is_favorite,
        servings: r.servings,
        caloriesPerServing: r.calories_per_serving,
        tags: r.tags,
        difficultyRating: r.difficulty_rating,
        tasteRating: r.taste_rating,
      })),
      favoriteRecipes: savedRecipes.filter(r => r.is_favorite).length,
      recipeTags: [...new Set(savedRecipes.flatMap(r => r.tags || []))],
      averageDifficulty: savedRecipes.length > 0 
        ? Math.round(savedRecipes.reduce((sum, r) => sum + (r.difficulty_rating || 3), 0) / savedRecipes.length)
        : 3,
      totalCalories: savedRecipes.reduce((sum, r) => sum + (r.calories_per_serving || 0), 0),
    }
  });

  // Load user's recipes on mount
  useEffect(() => {
    if (!user) return;
    loadRecipes();
  }, [user]);

  const loadRecipes = useCallback(async (searchOptions?: RecipeSearchOptions) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Use basic query and filter in JavaScript for now
      const { data, error } = await supabaseRest
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading recipes:', error);
        setError('Failed to load recipes');
        setSavedRecipes([]);
      } else {
        let filteredData = data as DatabaseRecipe[] || [];
        
        // Apply client-side filtering if search options provided
        if (searchOptions) {
          if (searchOptions.query) {
            const query = searchOptions.query.toLowerCase();
            filteredData = filteredData.filter(recipe => 
              recipe.title.toLowerCase().includes(query)
            );
          }
          
          if (searchOptions.filter?.is_favorite !== undefined) {
            filteredData = filteredData.filter(recipe => 
              recipe.is_favorite === searchOptions.filter!.is_favorite
            );
          }
        }
        
        setSavedRecipes(filteredData);
      }
    } catch (err) {
      console.error('Error loading recipes:', err);
      setError('Failed to load recipes');
      setSavedRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Save current recipe to database - Updated to include all fields
  const saveRecipe = useCallback(async (recipeData?: Recipe) => {
    if (!user) {
      return { error: 'User not authenticated' };
    }

    const dataToSave = recipeData || recipe;
    
    // Validate required fields
    if (!dataToSave.title?.trim()) {
      return { error: 'Recipe title is required' };
    }

    try {
      // Map frontend data to database schema
      const dbData = {
        user_id: user.id,
        title: dataToSave.title,
        skill_level: dataToSave.skill_level.toLowerCase(),
        cooking_time: dataToSave.cooking_time,
        special_preferences: dataToSave.special_preferences,
        ingredients: dataToSave.ingredients,
        instructions: dataToSave.instructions,
        // Extended fields
        calories_per_serving: dataToSave.calories_per_serving || null,
        servings: dataToSave.servings || 4,
        prep_time_minutes: dataToSave.prep_time_minutes || null,
        cook_time_minutes: dataToSave.cook_time_minutes || null,
        notes: dataToSave.notes || null,
        tags: dataToSave.tags || [],
        difficulty_rating: dataToSave.difficulty_rating || null,
        taste_rating: dataToSave.taste_rating || null,
        is_favorite: dataToSave.is_favorite || false
      };

      if (currentRecipeId) {
        // Update existing recipe
        const updateResult = await supabaseRest
          .from('recipes')
          .update(dbData)
          .eq('id', currentRecipeId)
          .eq('user_id', user.id);

        if (updateResult.error) {
          console.error('Error updating recipe:', updateResult.error);
          return { error: 'Failed to update recipe' };
        }

        // Update local state optimistically
        const updatedRecipe = { ...dbData, id: currentRecipeId, created_at: '', updated_at: '' } as DatabaseRecipe;
        setSavedRecipes(prev => prev.map(r => r.id === currentRecipeId ? updatedRecipe : r));
        return { data: updatedRecipe };
      } else {
        // Insert new recipe
        const insertResult = await supabaseRest
          .from('recipes')
          .insert([dbData]);

        if (insertResult.error) {
          console.error('Error saving recipe:', insertResult.error);
          return { error: 'Failed to save recipe' };
        }

        // Get the inserted record
        const { data, error } = await supabaseRest
          .from('recipes')
          .select('*')
          .eq('user_id', user.id)
          .eq('title', dbData.title)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error saving recipe:', error);
          return { error: 'Failed to save recipe' };
        }

        if (data && Array.isArray(data) && data.length > 0) {
          const savedRecipe = data[0] as DatabaseRecipe;
          setSavedRecipes(prev => [savedRecipe, ...prev]);
          setCurrentRecipeId(savedRecipe.id);
          return { data: savedRecipe };
        }
      }

      return { error: 'No data returned from save operation' };
    } catch (err) {
      console.error('Error saving recipe:', err);
      return { error: 'Failed to save recipe' };
    }
  }, [user, recipe, currentRecipeId]);

  // Load a saved recipe
  const loadRecipe = useCallback(async (recipeId: string) => {
    const savedRecipe = savedRecipes.find(r => r.id === recipeId);
    if (!savedRecipe) return;

    const loadedRecipe: Recipe = {
      title: savedRecipe.title,
      skill_level: savedRecipe.skill_level.charAt(0).toUpperCase() + savedRecipe.skill_level.slice(1) as SkillLevel,
      cooking_time: savedRecipe.cooking_time as CookingTime,
      special_preferences: savedRecipe.special_preferences as SpecialPreferences[],
      ingredients: savedRecipe.ingredients,
      instructions: savedRecipe.instructions,
      // Extended fields
      calories_per_serving: savedRecipe.calories_per_serving,
      servings: savedRecipe.servings,
      prep_time_minutes: savedRecipe.prep_time_minutes,
      cook_time_minutes: savedRecipe.cook_time_minutes,
      notes: savedRecipe.notes,
      tags: savedRecipe.tags,
      difficulty_rating: savedRecipe.difficulty_rating,
      taste_rating: savedRecipe.taste_rating,
      is_favorite: savedRecipe.is_favorite,
    };

    setRecipe(loadedRecipe);
    setAgentState({
      ...agentState,
      recipe: loadedRecipe,
    });
    setCurrentRecipeId(recipeId);
  }, [savedRecipes, agentState, setAgentState]);

  // Delete recipe
  const deleteRecipe = useCallback(async (recipeId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabaseRest
        .from('recipes')
        .delete()
        .eq('id', recipeId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting recipe:', error);
        return false;
      }

      setSavedRecipes(prev => prev.filter(r => r.id !== recipeId));
      if (currentRecipeId === recipeId) {
        setCurrentRecipeId(null);
        setRecipe(INITIAL_STATE.recipe);
      }
      return true;
    } catch (err) {
      console.error('Error deleting recipe:', err);
      return false;
    }
  }, [user, currentRecipeId]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (recipeId: string, isFavorite: boolean) => {
    if (!user) return false;

    try {
      const { error } = await supabaseRest
        .from('recipes')
        .update({ is_favorite: isFavorite })
        .eq('id', recipeId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error toggling favorite:', error);
        return false;
      }

      // Update local state optimistically
      setSavedRecipes(prev => prev.map(r => 
        r.id === recipeId ? { ...r, is_favorite: isFavorite } : r
      ));
      
      // Update current recipe if it's the one being toggled
      if (currentRecipeId === recipeId) {
        setRecipe(prev => ({ ...prev, is_favorite: isFavorite }));
      }
      
      return true;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      return false;
    }
  }, [user, currentRecipeId]);

  // Create new recipe
  const createNewRecipe = useCallback(() => {
    setRecipe(INITIAL_STATE.recipe);
    setCurrentRecipeId(null);
    setAgentState({
      ...agentState,
      recipe: INITIAL_STATE.recipe,
    });
  }, [agentState, setAgentState]);

  // CopilotKit actions
  useCopilotAction({
    name: "saveRecipeToDatabase",
    description: "Save the current recipe to the database",
    parameters: [],
    handler: async () => {
      try {
        const result = await saveRecipe();
        return result.error ? `Failed to save: ${result.error}` : "Recipe saved successfully!";
      } catch (error) {
        console.error('Error saving recipe:', error);
        return "Failed to save recipe";
      }
    },
  });

  useCopilotAction({
    name: "loadRecipeFromDatabase",
    description: "Load a saved recipe from the database",
    parameters: [
      {
        name: "recipeId",
        type: "string",
        description: "The ID of the recipe to load",
        required: true,
      },
    ],
    handler: async ({ recipeId }) => {
      try {
        if (!recipeId || typeof recipeId !== 'string') {
          return "Invalid recipe ID provided";
        }
        await loadRecipe(recipeId);
        return `Recipe loaded successfully!`;
      } catch (error) {
        console.error('Error loading recipe:', error);
        return "Failed to load recipe";
      }
    },
  });

  useCopilotAction({
    name: "deleteRecipeFromDatabase",
    description: "Delete a recipe from the database",
    parameters: [
      {
        name: "recipeId",
        type: "string",
        description: "The ID of the recipe to delete",
        required: true,
      },
    ],
    handler: async ({ recipeId }) => {
      try {
        if (!recipeId || typeof recipeId !== 'string') {
          return "Invalid recipe ID provided";
        }
        const success = await deleteRecipe(recipeId);
        return success ? "Recipe deleted successfully!" : "Failed to delete recipe";
      } catch (error) {
        console.error('Error deleting recipe:', error);
        return "Failed to delete recipe";
      }
    },
  });

  useCopilotAction({
    name: "toggleRecipeFavorite",
    description: "Toggle the favorite status of a recipe",
    parameters: [
      {
        name: "recipeId",
        type: "string",
        description: "The ID of the recipe to toggle",
        required: true,
      },
      {
        name: "isFavorite",
        type: "boolean",
        description: "Whether to mark as favorite or not",
        required: true,
      },
    ],
    handler: async ({ recipeId, isFavorite }) => {
      try {
        if (!recipeId || typeof recipeId !== 'string') {
          return "Invalid recipe ID provided";
        }
        if (typeof isFavorite !== 'boolean') {
          return "Invalid favorite status provided";
        }
        const success = await toggleFavorite(recipeId, isFavorite);
        return success 
          ? `Recipe ${isFavorite ? 'added to' : 'removed from'} favorites!`
          : "Failed to update favorite status";
      } catch (error) {
        console.error('Error toggling favorite:', error);
        return "Failed to update favorite status";
      }
    },
  });

  useCopilotAction({
    name: "createNewRecipe",
    description: "Start creating a new recipe",
    parameters: [],
    handler: async () => {
      try {
        createNewRecipe();
        return "Started creating a new recipe!";
      } catch (error) {
        console.error('Error creating new recipe:', error);
        return "Failed to create new recipe";
      }
    },
  });

  useCopilotAction({
    name: "searchRecipes",
    description: "Search through saved recipes",
    parameters: [
      {
        name: "query",
        type: "string",
        description: "Search query for recipe titles",
        required: false,
      },
      {
        name: "onlyFavorites",
        type: "boolean",
        description: "Whether to search only favorite recipes",
        required: false,
      },
    ],
    handler: async ({ query, onlyFavorites }) => {
      try {
        const searchOptions: RecipeSearchOptions = {};
        if (query && typeof query === 'string') {
          searchOptions.query = query;
        }
        if (onlyFavorites !== undefined && typeof onlyFavorites === 'boolean') {
          searchOptions.filter = { is_favorite: onlyFavorites };
        }
        
        await loadRecipes(searchOptions);
        return `Found recipes matching your search criteria`;
      } catch (error) {
        console.error('Error searching recipes:', error);
        return "Failed to search recipes";
      }
    },
  });

  // Update recipe function
  const updateRecipe = useCallback((partialRecipe: Partial<Recipe>) => {
    const newRecipe = {
      ...recipe,
      ...partialRecipe,
    };
    
    setRecipe(newRecipe);
    setAgentState({
      ...agentState,
      recipe: newRecipe,
    });
  }, [recipe, agentState, setAgentState]);

  // Sync agent state with local state - Fixed infinite loop
  const syncWithAgentState = useCallback(() => {
    if (!agentState?.recipe) return;

    const newChangedKeys: string[] = [];
    let hasChanges = false;
    const newRecipe = { ...recipe };

    for (const key in recipe) {
      const recipeKey = key as keyof Recipe;
      const agentValue = agentState.recipe[recipeKey];
      const currentValue = recipe[recipeKey];

      if (agentValue !== undefined && agentValue !== null) {
        let processedValue = agentValue;
        
        // Handle string replacements
        if (typeof agentValue === "string") {
          processedValue = agentValue.replace(/\\n/g, "\n");
        }

        if (JSON.stringify(processedValue) !== JSON.stringify(currentValue)) {
          (newRecipe as any)[recipeKey] = processedValue;
          newChangedKeys.push(key);
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      changedKeysRef.current = newChangedKeys;
      setRecipe(newRecipe);
    } else if (!isLoading) {
      changedKeysRef.current = [];
    }
  }, [agentState, recipe, isLoading]);

  // Use useEffect with proper dependencies to sync state
  useEffect(() => {
    syncWithAgentState();
  }, [agentState?.recipe, isLoading]);

  // Event handlers for all recipe fields
  const handleTitleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    updateRecipe({ title: event.target.value });
  }, [updateRecipe]);

  const handleSkillLevelChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    updateRecipe({ skill_level: event.target.value as SkillLevel });
  }, [updateRecipe]);

  const handleDietaryChange = useCallback((preference: SpecialPreferences, checked: boolean) => {
    if (checked) {
      updateRecipe({ special_preferences: [...recipe.special_preferences, preference] });
    } else {
      updateRecipe({ special_preferences: recipe.special_preferences.filter((p) => p !== preference) });
    }
  }, [updateRecipe, recipe.special_preferences]);

  const handleCookingTimeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    updateRecipe({ cooking_time: cookingTimeValues[Number(event.target.value)].label as CookingTime });
  }, [updateRecipe]);

  // Ingredient handlers
  const addIngredient = useCallback(() => {
    updateRecipe({ ingredients: [...recipe.ingredients, { icon: "🍴", name: "", amount: "" }] });
  }, [updateRecipe, recipe.ingredients]);

  const updateIngredient = useCallback((index: number, field: keyof Ingredient, value: string) => {
    const updatedIngredients = [...recipe.ingredients];
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    updateRecipe({ ingredients: updatedIngredients });
  }, [updateRecipe, recipe.ingredients]);

  const removeIngredient = useCallback((index: number) => {
    const updatedIngredients = [...recipe.ingredients];
    updatedIngredients.splice(index, 1);
    updateRecipe({ ingredients: updatedIngredients });
  }, [updateRecipe, recipe.ingredients]);

  // Instruction handlers
  const addInstruction = useCallback(() => {
    const newIndex = recipe.instructions.length;
    updateRecipe({ instructions: [...recipe.instructions, ""] });
    setEditingInstructionIndex(newIndex);

    setTimeout(() => {
      const textareas = document.querySelectorAll('.instructions-container textarea');
      const newTextarea = textareas[textareas.length - 1] as HTMLTextAreaElement;
      if (newTextarea) {
        newTextarea.focus();
      }
    }, 50);
  }, [updateRecipe, recipe.instructions]);

  const updateInstruction = useCallback((index: number, value: string) => {
    const updatedInstructions = [...recipe.instructions];
    updatedInstructions[index] = value;
    updateRecipe({ instructions: updatedInstructions });
  }, [updateRecipe, recipe.instructions]);

  const removeInstruction = useCallback((index: number) => {
    const updatedInstructions = [...recipe.instructions];
    updatedInstructions.splice(index, 1);
    updateRecipe({ instructions: updatedInstructions });
  }, [updateRecipe, recipe.instructions]);

  // Extended field handlers
  const handleServingsChange = useCallback((servings: number) => {
    updateRecipe({ servings });
  }, [updateRecipe]);

  const handleCaloriesChange = useCallback((calories: number) => {
    updateRecipe({ calories_per_serving: calories || undefined });
  }, [updateRecipe]);

  const handlePrepTimeChange = useCallback((minutes: number) => {
    updateRecipe({ prep_time_minutes: minutes || undefined });
  }, [updateRecipe]);

  const handleCookTimeChange = useCallback((minutes: number) => {
    updateRecipe({ cook_time_minutes: minutes || undefined });
  }, [updateRecipe]);

  const handleDifficultyRatingChange = useCallback((rating: number) => {
    updateRecipe({ difficulty_rating: rating });
  }, [updateRecipe]);

  const handleTasteRatingChange = useCallback((rating: number) => {
    updateRecipe({ taste_rating: rating });
  }, [updateRecipe]);

  const handleNotesChange = useCallback((notes: string) => {
    updateRecipe({ notes });
  }, [updateRecipe]);

  const handleTagsChange = useCallback((tags: string[]) => {
    updateRecipe({ tags });
  }, [updateRecipe]);

  const handleFavoriteToggle = useCallback(() => {
    updateRecipe({ is_favorite: !recipe.is_favorite });
  }, [updateRecipe, recipe.is_favorite]);

  const handleImproveRecipe = useCallback(() => {
    if (!isLoading) {
      appendMessage(
        new TextMessage({
          content: "Improve the recipe",
          role: Role.User,
        })
      );
    }
  }, [isLoading, appendMessage]);

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
    
    // Basic recipe handlers
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
    
    // Extended field handlers
    handleServingsChange,
    handleCaloriesChange,
    handlePrepTimeChange,
    handleCookTimeChange,
    handleDifficultyRatingChange,
    handleTasteRatingChange,
    handleNotesChange,
    handleTagsChange,
    handleFavoriteToggle,
    
    // Database operations
    saveRecipe,
    loadRecipe,
    deleteRecipe,
    loadRecipes,
    toggleFavorite,
    createNewRecipe,
  };
}; 