import { CookingTime, SkillLevel, SpecialPreferences, RecipeAgentState } from '@/types/recipe';

export const cookingTimeValues = [
  { label: CookingTime.FiveMin, value: 0 },
  { label: CookingTime.FifteenMin, value: 1 },
  { label: CookingTime.ThirtyMin, value: 2 },
  { label: CookingTime.FortyFiveMin, value: 3 },
  { label: CookingTime.SixtyPlusMin, value: 4 },
];

export const dietaryOptions = Object.values(SpecialPreferences);

export const initialPrompt = "Welcome to the AI Recipe Assistant! I'll help you create, edit, and improve recipes. You can edit any part of the recipe directly, and I'll assist with suggestions and improvements.";

export const chatSuggestions = "Here are some things you can ask me: 'Add 3 more ingredients for a pasta dish', 'Make this recipe vegetarian', 'Suggest cooking techniques for chicken', 'Add dessert instructions', 'Make this recipe healthier', 'Set the servings to 4', 'Add nutritional information', 'Rate this recipe difficulty'";

export const INITIAL_STATE: RecipeAgentState = {
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
    calories_per_serving: undefined,
    servings: 4,
    prep_time_minutes: undefined,
    cook_time_minutes: undefined,
    notes: "",
    tags: [],
    difficulty_rating: undefined,
    taste_rating: undefined,
    is_favorite: false,
  },
}; 