import React from 'react';
import { Ingredient } from '@/types/recipe';
import { getProperIcon } from '@/utils/recipe';

interface IngredientsSectionProps {
  ingredients: Ingredient[];
  changedKeys: string[];
  onAddIngredient: () => void;
  onUpdateIngredient: (index: number, field: keyof Ingredient, value: string) => void;
  onRemoveIngredient: (index: number) => void;
}

export const IngredientsSection: React.FC<IngredientsSectionProps> = ({
  ingredients,
  changedKeys,
  onAddIngredient,
  onUpdateIngredient,
  onRemoveIngredient,
}) => {
  return (
    <div className="section-container relative">
      {changedKeys.includes("ingredients") && <Ping />}
      <div className="section-header">
        <h2 className="section-title">Ingredients</h2>
        <button 
          type="button" 
          className="add-button"
          onClick={onAddIngredient}
        >
          + Add Ingredient
        </button>
      </div>
      <div className="ingredients-container">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="ingredient-card">
            <div className="ingredient-icon">{getProperIcon(ingredient.icon)}</div>
            <div className="ingredient-content">
              <input
                type="text"
                value={ingredient.name || ''}
                onChange={(e) => onUpdateIngredient(index, "name", e.target.value)}
                placeholder="Ingredient name"
                className="ingredient-name-input"
              />
              <input
                type="text"
                value={ingredient.amount || ''}
                onChange={(e) => onUpdateIngredient(index, "amount", e.target.value)}
                placeholder="Amount"
                className="ingredient-amount-input"
              />
            </div>
            <button 
              type="button" 
              className="remove-button" 
              onClick={() => onRemoveIngredient(index)}
              aria-label="Remove ingredient"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

function Ping() {
  return (
    <span className="ping-animation">
      <span className="ping-circle"></span>
      <span className="ping-dot"></span>
    </span>
  );
} 