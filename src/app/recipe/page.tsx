"use client";
import { CopilotKit, useCoAgent, useCopilotChat } from "@copilotkit/react-core";
import { CopilotSidebar, useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { useState, useEffect, useRef } from "react";
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";
import "./style.css";

enum SkillLevel {
  BEGINNER = "Beginner",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced",
}

enum CookingTime {
  FiveMin = "5 min",
  FifteenMin = "15 min",
  ThirtyMin = "30 min",
  FortyFiveMin = "45 min",
  SixtyPlusMin = "60+ min",
}

const cookingTimeValues = [
  { label: CookingTime.FiveMin, value: 0 },
  { label: CookingTime.FifteenMin, value: 1 },
  { label: CookingTime.ThirtyMin, value: 2 },
  { label: CookingTime.FortyFiveMin, value: 3 },
  { label: CookingTime.SixtyPlusMin, value: 4 },
];

const initialPrompt = "Welcome to the AI Recipe Assistant! I'll help you create, edit, and improve recipes. You can edit any part of the recipe directly, and I'll assist with suggestions and improvements.";

const chatSuggestions = "Here are some things you can ask me: 'Add 3 more ingredients for a pasta dish', 'Make this recipe vegetarian', 'Suggest cooking techniques for chicken', 'Add dessert instructions', 'Make this recipe healthier'";

export default function RecipePage() {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      showDevConsole={false}
      agent="shared_state"
    >
      <div
        className="app-container"
        style={{
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          position: "relative",
        }}
      >
        <div 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(5px)",
            zIndex: 0,
          }}
        />
        <Recipe />
        <CopilotSidebar
          defaultOpen={true}
          labels={{
            title: "AI Recipe Assistant",
            initial: initialPrompt,
          }}
          clickOutsideToClose={false}
        />
      </div>
    </CopilotKit>
  );
}

interface Ingredient {
  icon: string;
  name: string;
  amount: string;
}

enum SpecialPreferences {
  HighProtein = "High Protein",
  LowCarb = "Low Carb",
  Spicy = "Spicy",
  BudgetFriendly = "Budget-Friendly",
  OnePotMeal = "One-Pot Meal",
  Vegetarian = "Vegetarian",
  Vegan = "Vegan",
}

const dietaryOptions = Object.values(SpecialPreferences);

interface Recipe {
  title: string;
  skill_level: SkillLevel;
  cooking_time: CookingTime;
  special_preferences: SpecialPreferences[];
  ingredients: Ingredient[];
  instructions: string[];
}

interface RecipeAgentState {
  recipe: Recipe;
}

const INITIAL_STATE: RecipeAgentState = {
  recipe: {
    title: "Make Your Recipe",
    skill_level: SkillLevel.INTERMEDIATE,
    cooking_time: CookingTime.FortyFiveMin,
    special_preferences: [],
    ingredients: [
      { icon: "🥕", name: "Carrots", amount: "3 large, grated" },
      { icon: "🌾", name: "All-Purpose Flour", amount: "2 cups" },
    ],
    instructions: [
      "Preheat oven to 350°F (175°C)",
    ],
  },
};

function Recipe() {
  const { state: agentState, setState: setAgentState } =
    useCoAgent<RecipeAgentState>({
      name: "shared_state",
      initialState: INITIAL_STATE,
    });

  useCopilotChatSuggestions({
    instructions: chatSuggestions,
  })

  const [recipe, setRecipe] = useState(INITIAL_STATE.recipe);
  const { appendMessage, isLoading } = useCopilotChat();
  const [editingInstructionIndex, setEditingInstructionIndex] = useState<number | null>(null);

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

  const newRecipeState = { ...recipe };
  const newChangedKeys = [];
  const changedKeysRef = useRef<string[]>([]);

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
  } else if (!isLoading) {
    changedKeysRef.current = [];
  }

  useEffect(() => {
    setRecipe(newRecipeState);
  }, [JSON.stringify(newRecipeState)]);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateRecipe({
      title: event.target.value,
    });
  };

  const handleSkillLevelChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
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
        special_preferences: recipe.special_preferences.filter(
          (p) => p !== preference
        ),
      });
    }
  };

  const handleCookingTimeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateRecipe({
      cooking_time: cookingTimeValues[Number(event.target.value)].label,
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

  const getProperIcon = (icon: string | undefined): string => {
    if (!icon) {
      return "🍴";
    }
    
    // Handle emoji codes that might be passed as hex strings
    if (typeof icon === 'string') {
      // If it's a hex code like "35e", "631", etc., convert to emoji
      if (/^[0-9a-fA-F]+$/.test(icon) && icon.length >= 2 && icon.length <= 8) {
        try {
          // Try to convert hex to emoji
          const codePoint = parseInt(icon, 16);
          
          // Common emoji mappings for the codes we're seeing
          const emojiMap: Record<string, string> = {
            '35e': '🥞', // pancake
            '631': '🍱', // bento box
            '36e': '🥮', // moon cake
            'f9c4': '🧄', // garlic
            '9c2': '🧂', // salt
            '9c3': '🧃', // beverage box
            '3c6': '🏆', // trophy
            '1f3e1f7': '🏡', // house
            '1f9c6': '🧆', // falafel
            '1f9f3': '🧳', // luggage
          };
          
          // Check if we have a direct mapping
          if (emojiMap[icon.toLowerCase()]) {
            return emojiMap[icon.toLowerCase()];
          }
          
          // For longer codes, try to parse as Unicode
          if (icon.length > 4) {
            // Handle compound emoji codes
            const parts = icon.match(/.{1,4}/g) || [];
            let result = '';
            for (const part of parts) {
              const partCode = parseInt(part, 16);
              if (partCode > 0 && partCode <= 0x10FFFF) {
                result += String.fromCodePoint(partCode);
              }
            }
            if (result) return result;
          } else {
            // Simple single code point
            if (codePoint > 0 && codePoint <= 0x10FFFF) {
              return String.fromCodePoint(codePoint);
            }
          }
        } catch {
          // If conversion fails, fall back to default
        }
      }
      
      // If it's already an emoji or regular string, return as is
      return icon;
    }
    
    return "🍴";
  };

  return (
    <form className="recipe-card">
      <div className="recipe-header">
        <input
          type="text"
          value={recipe.title || ''}
          onChange={handleTitleChange}
          className="recipe-title-input"
        />
        
        <div className="recipe-meta">
          <div className="meta-item">
            <span className="meta-icon">🕒</span>
            <select
              className="meta-select"
              value={cookingTimeValues.find(t => t.label === recipe.cooking_time)?.value || 3}
              onChange={handleCookingTimeChange}
              style={{
                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23555\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0px center',
                backgroundSize: '12px',
                appearance: 'none',
                WebkitAppearance: 'none'
              }}
            >
              {cookingTimeValues.map((time) => (
                <option key={time.value} value={time.value}>
                  {time.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="meta-item">
            <span className="meta-icon">🏆</span>
            <select
              className="meta-select"
              value={recipe.skill_level}
              onChange={handleSkillLevelChange}
              style={{
                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23555\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0px center',
                backgroundSize: '12px',
                appearance: 'none',
                WebkitAppearance: 'none'
              }}
            >
              {Object.values(SkillLevel).map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="section-container relative">
        {changedKeysRef.current.includes("special_preferences") && <Ping />}
        <h2 className="section-title">Dietary Preferences</h2>
        <div className="dietary-options">
          {dietaryOptions.map((option) => (
            <label key={option} className="dietary-option">
              <input
                type="checkbox"
                checked={recipe.special_preferences.includes(option)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDietaryChange(option, e.target.checked)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="section-container relative">
        {changedKeysRef.current.includes("ingredients") && <Ping />}
        <div className="section-header">
          <h2 className="section-title">Ingredients</h2>
          <button 
            type="button" 
            className="add-button"
            onClick={addIngredient}
          >
            + Add Ingredient
          </button>
        </div>
        <div className="ingredients-container">
          {recipe.ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-card">
              <div className="ingredient-icon">{getProperIcon(ingredient.icon)}</div>
              <div className="ingredient-content">
                <input
                  type="text"
                  value={ingredient.name || ''}
                  onChange={(e) => updateIngredient(index, "name", e.target.value)}
                  placeholder="Ingredient name"
                  className="ingredient-name-input"
                />
                <input
                  type="text"
                  value={ingredient.amount || ''}
                  onChange={(e) => updateIngredient(index, "amount", e.target.value)}
                  placeholder="Amount"
                  className="ingredient-amount-input"
                />
              </div>
              <button 
                type="button" 
                className="remove-button" 
                onClick={() => removeIngredient(index)}
                aria-label="Remove ingredient"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="section-container relative">
        {changedKeysRef.current.includes("instructions") && <Ping />}
        <div className="section-header">
          <h2 className="section-title">Instructions</h2>
          <button 
            type="button" 
            className="add-step-button"
            onClick={addInstruction}
          >
            + Add Step
          </button>
        </div>
        <div className="instructions-container">
          {recipe.instructions.map((instruction, index) => (
            <div key={index} className="instruction-item">
              <div className="instruction-number">
                {index + 1}
              </div>
              
              {index < recipe.instructions.length - 1 && (
                <div className="instruction-line" />
              )}
              
              <div 
                className={`instruction-content ${
                  editingInstructionIndex === index 
                    ? 'instruction-content-editing' 
                    : 'instruction-content-default'
                }`}
                onClick={() => setEditingInstructionIndex(index)}
              >
                <textarea
                  className="instruction-textarea"
                  value={instruction || ''}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  placeholder={!instruction ? "Enter cooking instruction..." : ""}
                  onFocus={() => setEditingInstructionIndex(index)}
                  onBlur={(e) => {
                    if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget as Node)) {
                      setEditingInstructionIndex(null);
                    }
                  }}
                />
                
                <button 
                  type="button"
                  className={`instruction-delete-btn ${
                    editingInstructionIndex === index 
                      ? 'instruction-delete-btn-editing' 
                      : 'instruction-delete-btn-default'
                  } remove-button`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeInstruction(index);
                  }}
                  aria-label="Remove instruction"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="action-container">
        <button
          className={isLoading ? "improve-button loading" : "improve-button"}
          type="button"
          onClick={() => {
            if (!isLoading) {
              appendMessage(
                new TextMessage({
                  content: "Improve the recipe",
                  role: Role.User,
                })
              );
            }
          }}
          disabled={isLoading}
        >
          {isLoading ? "Please Wait..." : "Improve with AI"}
        </button>
      </div>
    </form>
  );
}

function Ping() {
  return (
    <span className="ping-animation">
      <span className="ping-circle"></span>
      <span className="ping-dot"></span>
    </span>
  );
} 