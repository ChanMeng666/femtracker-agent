import { NutritionFocus } from '@/types/nutrition';

export const nutritionFocus: NutritionFocus[] = [
  { type: "iron", label: "Iron Supplement", icon: "🍖", color: "bg-red-50 border-red-200", foods: "Red meat, Spinach, Beans" },
  { type: "calcium", label: "Calcium Supplement", icon: "🥛", color: "bg-blue-50 border-blue-200", foods: "Dairy products, Leafy greens" },
  { type: "magnesium", label: "Magnesium", icon: "🥜", color: "bg-yellow-50 border-yellow-200", foods: "Nuts, Whole grains" },
  { type: "omega3", label: "Omega-3", icon: "🐟", color: "bg-cyan-50 border-cyan-200", foods: "Fish, Flax seeds" },
  { type: "vitaminD", label: "Vitamin D", icon: "☀️", color: "bg-orange-50 border-orange-200", foods: "Egg yolks, Dairy" },
  { type: "antiInflammatory", label: "Anti-inflammatory Foods", icon: "🫐", color: "bg-purple-50 border-purple-200", foods: "Berries, Green tea" }
]; 