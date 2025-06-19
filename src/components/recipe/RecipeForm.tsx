import React from 'react';
import { useRecipeWithDB } from '@/hooks/useRecipeWithDB';
import { RecipeHeader } from './RecipeHeader';
import { DietaryPreferences } from './DietaryPreferences';
import { IngredientsSection } from './IngredientsSection';
import { InstructionsSection } from './InstructionsSection';

export const RecipeForm: React.FC = () => {
  const {
    loading,
    error,
    recipeForm,
    setRecipeForm,
    saveRecipe,
  } = useRecipeWithDB();

  const handleSaveRecipe = async () => {
    if (recipeForm.name.trim()) {
      await saveRecipe(recipeForm);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setRecipeForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addIngredient = (ingredient: string) => {
    setRecipeForm(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, ingredient]
    }));
  };

  const removeIngredient = (index: number) => {
    setRecipeForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const addInstruction = (instruction: string) => {
    setRecipeForm(prev => ({
      ...prev,
      instructions: [...prev.instructions, instruction]
    }));
  };

  const removeInstruction = (index: number) => {
    setRecipeForm(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  return (
    <form className="recipe-card">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Recipe Name
        </label>
        <input
          type="text"
          value={recipeForm.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter recipe name"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={recipeForm.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Describe your recipe"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Servings
          </label>
          <input
            type="number"
            value={recipeForm.servings}
            onChange={(e) => handleInputChange('servings', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max="20"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cooking Time (minutes)
          </label>
          <input
            type="number"
            value={recipeForm.cookingTime}
            onChange={(e) => handleInputChange('cookingTime', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="5"
            max="480"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty
          </label>
          <select
            value={recipeForm.difficulty}
            onChange={(e) => handleInputChange('difficulty', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ingredients
        </label>
        {recipeForm.ingredients.map((ingredient, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <span className="flex-1 px-3 py-2 bg-gray-50 rounded">{ingredient}</span>
            <button
              type="button"
              onClick={() => removeIngredient(index)}
              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            const ingredient = prompt("Enter ingredient:");
            if (ingredient) addIngredient(ingredient);
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add Ingredient
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instructions
        </label>
        {recipeForm.instructions.map((instruction, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <span className="flex-1 px-3 py-2 bg-gray-50 rounded">
              {index + 1}. {instruction}
            </span>
            <button
              type="button"
              onClick={() => removeInstruction(index)}
              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            const instruction = prompt("Enter instruction:");
            if (instruction) addInstruction(instruction);
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add Instruction
        </button>
      </div>

      <div className="action-container">
        <button
          className="save-button"
          type="button"
          onClick={handleSaveRecipe}
          disabled={loading || !recipeForm.name.trim()}
        >
          💾 Save Recipe
        </button>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
    </form>
  );
}; 