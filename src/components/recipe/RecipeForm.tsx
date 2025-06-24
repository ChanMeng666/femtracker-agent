import React from 'react';
import { useRecipeWithDB } from '@/hooks/useRecipeWithDB';
import { RecipeHeader } from './RecipeHeader';
import { DietaryPreferences } from './DietaryPreferences';
import { IngredientsSection } from './IngredientsSection';
import { InstructionsSection } from './InstructionsSection';
import { RecipeMetadata } from './RecipeMetadata';
import { SavedRecipesList } from './SavedRecipesList';

export const RecipeForm: React.FC = () => {
  const {
    recipe,
    isLoading,
    editingInstructionIndex,
    setEditingInstructionIndex,
    changedKeysRef,
    loading,
    savedRecipes,
    currentRecipeId,
    // Basic handlers
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
  } = useRecipeWithDB();

  const handleSaveRecipe = async () => {
    try {
      const result = await saveRecipe();
      if (result.error) {
        console.error('Save failed:', result.error);
        alert(`Save failed: ${result.error}`);
      } else {
        console.log('Recipe saved successfully');
        alert('Recipe saved successfully!');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Error saving recipe');
    }
  };

  const handleNewRecipe = () => {
    createNewRecipe();
  };

  const handleLoadRecipe = (recipeId: string) => {
    loadRecipe(recipeId);
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    const success = await deleteRecipe(recipeId);
    if (success) {
      alert('Recipe deleted successfully');
    } else {
      alert('Failed to delete recipe');
    }
  };

  const handleToggleFavorite = async (recipeId: string, isFavorite: boolean) => {
    const success = await toggleFavorite(recipeId, isFavorite);
    if (!success) {
      alert('Failed to update favorite status');
    }
  };

  const handleSearch = (searchOptions: any) => {
    loadRecipes(searchOptions);
  };

  // Create ping component for visual feedback
  const Ping = () => (
    <span className="ping-animation">
      <span className="ping-circle"></span>
      <span className="ping-dot"></span>
    </span>
  );

  return (
    <div className="recipe-form-container">
      <form className="recipe-card">
        {/* Recipe Header */}
        <div className="recipe-header-container relative">
          {changedKeysRef.current.includes("title") && <Ping />}
          <RecipeHeader 
            title={recipe.title}
            skillLevel={recipe.skill_level}
            cookingTime={recipe.cooking_time}
            onTitleChange={handleTitleChange}
            onSkillLevelChange={handleSkillLevelChange}
            onCookingTimeChange={handleCookingTimeChange}
          />
        </div>

        {/* Dietary Preferences */}
        <DietaryPreferences 
          selectedPreferences={recipe.special_preferences}
          onDietaryChange={handleDietaryChange}
          changedKeys={changedKeysRef.current}
        />

        {/* Recipe Metadata - New Section */}
        <RecipeMetadata
          servings={recipe.servings}
          caloriesPerServing={recipe.calories_per_serving}
          prepTimeMinutes={recipe.prep_time_minutes}
          cookTimeMinutes={recipe.cook_time_minutes}
          difficultyRating={recipe.difficulty_rating}
          tasteRating={recipe.taste_rating}
          notes={recipe.notes}
          tags={recipe.tags}
          isFavorite={recipe.is_favorite}
          changedKeys={changedKeysRef.current}
          onServingsChange={handleServingsChange}
          onCaloriesChange={handleCaloriesChange}
          onPrepTimeChange={handlePrepTimeChange}
          onCookTimeChange={handleCookTimeChange}
          onDifficultyRatingChange={handleDifficultyRatingChange}
          onTasteRatingChange={handleTasteRatingChange}
          onNotesChange={handleNotesChange}
          onTagsChange={handleTagsChange}
          onFavoriteToggle={handleFavoriteToggle}
        />

        {/* Ingredients */}
        <IngredientsSection 
          ingredients={recipe.ingredients}
          changedKeys={changedKeysRef.current}
          onAddIngredient={addIngredient}
          onUpdateIngredient={updateIngredient}
          onRemoveIngredient={removeIngredient}
        />

        {/* Instructions */}
        <InstructionsSection 
          instructions={recipe.instructions}
          changedKeys={changedKeysRef.current}
          editingIndex={editingInstructionIndex}
          onAddInstruction={addInstruction}
          onUpdateInstruction={updateInstruction}
          onRemoveInstruction={removeInstruction}
          onSetEditingIndex={setEditingInstructionIndex}
        />

        {/* Action Buttons */}
        <div className="action-container">
          <div className="flex gap-4">
            <button
              className={isLoading ? "improve-button loading" : "improve-button"}
              type="button"
              onClick={handleImproveRecipe}
              disabled={isLoading}
            >
              {isLoading ? "AI is thinking..." : "✨ Improve with AI"}
            </button>
            
            <button
              className="save-button"
              type="button"
              onClick={handleSaveRecipe}
              disabled={isLoading || !recipe.title.trim()}
            >
              💾 {currentRecipeId ? 'Update Recipe' : 'Save Recipe'}
            </button>

            <button
              className="new-button"
              type="button"
              onClick={handleNewRecipe}
              disabled={isLoading}
            >
              📄 New Recipe
            </button>
          </div>
          
          <p className="action-hint">
            💡 Try saying: "Make this recipe healthier", "Add Italian flavors", "Set servings to 6", or "Rate this recipe difficulty 4 stars"
          </p>
        </div>

        <style jsx>{`
          .recipe-form-container {
            width: 100%;
          }

          .recipe-header-container {
            position: relative;
            margin-bottom: 24px;
          }

          .ping-animation {
            position: absolute;
            display: flex;
            width: 12px;
            height: 12px;
            top: 0;
            right: 0;
            z-index: 10;
          }

          .ping-circle {
            position: absolute;
            display: inline-flex;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #38BDF8;
            opacity: 0.75;
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          }

          .ping-dot {
            position: relative;
            display: inline-flex;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: #0EA5E9;
          }

          @keyframes ping {
            75%, 100% {
              transform: scale(2);
              opacity: 0;
            }
          }

          .action-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            margin-top: 40px;
            padding-bottom: 20px;
          }

          .improve-button, .save-button, .new-button {
            border: none;
            color: white;
            border-radius: 30px;
            font-size: 18px;
            font-weight: 600;
            padding: 14px 32px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            min-width: 180px;
          }

          .improve-button {
            background: linear-gradient(135deg, #ff7043 0%, #ff5722 100%);
            box-shadow: 0 4px 15px rgba(255, 112, 67, 0.4);
          }

          .save-button {
            background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
          }

          .new-button {
            background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
            box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);
          }

          .improve-button:hover:not(:disabled),
          .save-button:hover:not(:disabled),
          .new-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
          }

          .improve-button:disabled,
          .save-button:disabled,
          .new-button:disabled {
            opacity: 0.8;
            cursor: not-allowed;
          }

          .action-hint {
            text-align: center;
            color: #64748b;
            font-size: 14px;
            font-style: italic;
            max-width: 600px;
            line-height: 1.5;
          }
        `}</style>
      </form>

      {/* Saved Recipes List */}
      <SavedRecipesList
        recipes={savedRecipes}
        loading={loading}
        onLoadRecipe={handleLoadRecipe}
        onDeleteRecipe={handleDeleteRecipe}
        onToggleFavorite={handleToggleFavorite}
        onSearch={handleSearch}
      />
    </div>
  );
}; 