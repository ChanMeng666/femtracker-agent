import React from 'react';
import { useRecipeWithDB } from '@/hooks/useRecipeWithDB';
import { RecipeHeader } from './RecipeHeader';
import { DietaryPreferences } from './DietaryPreferences';
import { IngredientsSection } from './IngredientsSection';
import { InstructionsSection } from './InstructionsSection';

export const RecipeForm: React.FC = () => {
  const {
    recipe,
    isLoading,
    editingInstructionIndex,
    setEditingInstructionIndex,
    changedKeysRef,
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
    saveRecipe,
  } = useRecipeWithDB();

  const handleSaveRecipe = async () => {
    await saveRecipe();
  };

  return (
    <form className="recipe-card">
      <RecipeHeader
        title={recipe.title}
        skillLevel={recipe.skill_level}
        cookingTime={recipe.cooking_time}
        onTitleChange={handleTitleChange}
        onSkillLevelChange={handleSkillLevelChange}
        onCookingTimeChange={handleCookingTimeChange}
      />

      <DietaryPreferences
        selectedPreferences={recipe.special_preferences}
        onDietaryChange={handleDietaryChange}
        changedKeys={changedKeysRef.current}
      />

      <IngredientsSection
        ingredients={recipe.ingredients}
        changedKeys={changedKeysRef.current}
        onAddIngredient={addIngredient}
        onUpdateIngredient={updateIngredient}
        onRemoveIngredient={removeIngredient}
      />

      <InstructionsSection
        instructions={recipe.instructions}
        changedKeys={changedKeysRef.current}
        editingIndex={editingInstructionIndex}
        onAddInstruction={addInstruction}
        onUpdateInstruction={updateInstruction}
        onRemoveInstruction={removeInstruction}
        onSetEditingIndex={setEditingInstructionIndex}
      />

      <div className="action-container">
        <button
          className={isLoading ? "improve-button loading" : "improve-button"}
          type="button"
          onClick={handleImproveRecipe}
          disabled={isLoading}
        >
          {isLoading ? "Please Wait..." : "Improve with AI"}
        </button>
        
        <button
          className="save-button"
          type="button"
          onClick={handleSaveRecipe}
          disabled={isLoading || !recipe.title.trim()}
        >
          💾 Save Recipe
        </button>
      </div>
    </form>
  );
}; 