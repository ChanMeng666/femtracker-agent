import { useState, useEffect, useRef } from "react";
import { useCoAgent } from "@copilotkit/react-core";
import { Recipe, RecipeAgentState } from "@/types/recipe";
import { INITIAL_STATE } from "@/constants/recipe";

export const useRecipeState = () => {
  const { state: agentState, setState: setAgentState } = useCoAgent<RecipeAgentState>({
    name: "shared_state",
    initialState: INITIAL_STATE,
  });

  const [recipe, setRecipe] = useState(INITIAL_STATE.recipe);
  const [editingInstructionIndex, setEditingInstructionIndex] = useState<number | null>(null);
  
  const changedKeysRef = useRef<string[]>([]);

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
  const newRecipeState = { ...recipe };
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
        (newRecipeState as Record<keyof Recipe, unknown>)[recipeKey] = agentValue;
        newChangedKeys.push(key);
      }
    }
  }

  if (newChangedKeys.length > 0) {
    changedKeysRef.current = newChangedKeys;
  }

  useEffect(() => {
    setRecipe(newRecipeState);
  }, [JSON.stringify(newRecipeState)]);

  return {
    recipe,
    setRecipe,
    updateRecipe,
    editingInstructionIndex,
    setEditingInstructionIndex,
    changedKeysRef,
  };
}; 