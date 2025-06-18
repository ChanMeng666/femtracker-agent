"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { NutritionTrackerContent } from "@/components/nutrition/NutritionTrackerContent";

// Main component that wraps everything in CopilotKit
export default function NutritionTracker() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <NutritionTrackerPageContent />
    </CopilotKit>
  );
}

// Internal component that uses CopilotKit hooks
function NutritionTrackerPageContent() {
  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col overflow-hidden">
        <NutritionTrackerContent />
      </div>
      <CopilotSidebar
        instructions="You are a nutrition and health assistant helping users track their daily nutrition intake and maintain healthy eating habits. You have access to their current nutrition data and can help them:

1. **Water Intake Management:**
   - Add water intake in various amounts (ml) using addWaterIntake action
   - Track daily water consumption (goal: 2000ml)
   - Monitor hydration levels and provide reminders

2. **Meal Recording & Management:**
   - Record meals with recordMeal action (meal time, foods array, calories, nutrients, notes)
   - Track food items, calories, and key nutrients for each meal
   - Monitor total daily calorie intake vs. goals

3. **Nutrition Focus Areas:**
   - Add nutrition focus areas using addNutritionFocus action
   - Available types: iron, calcium, magnesium, omega3, vitaminD, antiInflammatory
   - Provide food recommendations based on selected focus areas

4. **Health Metrics:**
   - Update nutrition score (0-100) using updateNutritionScore action
   - Set daily calorie goals using setCalorieGoal action
   - Track macronutrient intake (protein, carbs, fats)

5. **Database Operations:**
   - All nutrition and water data is automatically saved to the database
   - Real-time updates to daily intake tracking
   - Persistent storage of all meal and hydration records

Available nutrition focus areas:
- iron: Red meat, Spinach, Beans
- calcium: Dairy products, Leafy greens  
- magnesium: Nuts, Whole grains
- omega3: Fish, Flax seeds
- vitaminD: Egg yolks, Dairy
- antiInflammatory: Berries, Green tea

You can see their current water intake, meals, nutrition score, and selected focus areas. All data is saved to the database automatically."
        defaultOpen={false}
        labels={{
          title: "Nutrition AI Assistant",
          initial: "👋 Hi! I'm your nutrition assistant. I can help you track nutrition and save everything to your database.\n\n**🥤 Water Tracking:**\n- \"Add 500ml of water to my intake\"\n- \"I drank a 250ml glass of water\"\n- \"Record 750ml water intake\"\n\n**🍽️ Meal Recording:**\n- \"Record breakfast: oatmeal, banana, milk with 350 calories\"\n- \"Log lunch: salmon, rice, vegetables with 480 calories and omega3 nutrients\"\n- \"Add dinner: chicken, broccoli, sweet potato\"\n\n**🎯 Nutrition Focus:**\n- \"Add iron and calcium to my nutrition focus\"\n- \"Focus on omega3 and antiInflammatory foods\"\n- \"What foods are good for magnesium?\"\n\n**📊 Health Management:**\n- \"Set my calorie goal to 1600\"\n- \"Update my nutrition score to 85\"\n- \"What's my total calories today?\"\n\nAll your data is automatically saved and synced with the database!"
        }}
      />
    </div>
  );
} 