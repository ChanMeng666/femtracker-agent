import { useRecipeState } from "./useRecipeState";
import { useRecipeHandlers } from "./useRecipeHandlers";
import { useRecipeActions } from "./useRecipeActions";

export const useRecipe = () => {
  const state = useRecipeState();
  const actions = useRecipeActions();
  
  const handlers = useRecipeHandlers({
    recipe: state.recipe,
    updateRecipe: state.updateRecipe,
    setEditingInstructionIndex: state.setEditingInstructionIndex
  });

  return {
    // State
    recipe: state.recipe,
    editingInstructionIndex: state.editingInstructionIndex,
    setEditingInstructionIndex: state.setEditingInstructionIndex,
    changedKeysRef: state.changedKeysRef,
    
    // Actions
    isLoading: actions.isLoading,
    handleImproveRecipe: actions.handleImproveRecipe,
    
    // Handlers
    ...handlers
  };
}; 