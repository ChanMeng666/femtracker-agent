export interface Meal {
  time: string;
  foods: string[];
  calories: number;
  nutrients: string[];
}

export interface NutritionFocus {
  type: string;
  label: string;
  icon: string;
  color: string;
  foods: string;
} 