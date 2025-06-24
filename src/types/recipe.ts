export enum SkillLevel {
  BEGINNER = "Beginner",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced",
}

export enum CookingTime {
  FiveMin = "5 min",
  FifteenMin = "15 min",
  ThirtyMin = "30 min",
  FortyFiveMin = "45 min",
  SixtyPlusMin = "60+ min",
}

export enum SpecialPreferences {
  HighProtein = "High Protein",
  LowCarb = "Low Carb",
  Spicy = "Spicy",
  BudgetFriendly = "Budget-Friendly",
  OnePotMeal = "One-Pot Meal",
  Vegetarian = "Vegetarian",
  Vegan = "Vegan",
}

export interface Ingredient {
  icon: string;
  name: string;
  amount: string;
}

// Extended Recipe interface to match database schema
export interface Recipe {
  title: string;
  skill_level: SkillLevel;
  cooking_time: CookingTime;
  special_preferences: SpecialPreferences[];
  ingredients: Ingredient[];
  instructions: string[];
  // Additional fields from database
  calories_per_serving?: number;
  servings?: number;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  notes?: string;
  tags?: string[];
  difficulty_rating?: number; // 1-5
  taste_rating?: number; // 1-5
  is_favorite?: boolean;
}

// Database Recipe with ID and timestamps
export interface DatabaseRecipe extends Recipe {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Recipe Collection types
export interface RecipeCollection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface RecipeCollectionItem {
  id: string;
  recipe_id: string;
  collection_id: string;
  added_at: string;
}

// Recipe filter and search types
export interface RecipeFilter {
  skill_level?: SkillLevel[];
  special_preferences?: SpecialPreferences[];
  tags?: string[];
  is_favorite?: boolean;
  difficulty_rating?: { min?: number; max?: number };
  taste_rating?: { min?: number; max?: number };
  calories_range?: { min?: number; max?: number };
  servings_range?: { min?: number; max?: number };
}

export interface RecipeSearchOptions {
  query?: string;
  filter?: RecipeFilter;
  sort_by?: 'created_at' | 'updated_at' | 'title' | 'difficulty_rating' | 'taste_rating';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface RecipeAgentState {
  recipe: Recipe;
} 