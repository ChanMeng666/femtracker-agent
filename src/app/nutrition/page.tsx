"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { NutritionTrackerContent } from "@/components/nutrition/NutritionTrackerContent";

export default function NutritionTracker() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <div className="flex h-screen">
        <NutritionTrackerContent />
        <CopilotSidebar
          instructions="You are a nutrition and health assistant helping users track their daily nutrition intake and maintain healthy eating habits. You have access to their current nutrition data and can help them:

1. **Water Intake Management:**
   - Track daily water consumption (goal: 2000ml)
   - Add water intake in various amounts (200ml glass, 500ml bottle, etc.)
   - Monitor hydration levels and provide reminders

2. **Meal Tracking & Management:**
   - Add, update, or remove meals (Breakfast, Lunch, Dinner, Snacks)
   - Track food items, calories, and key nutrients for each meal
   - Monitor total daily calorie intake vs. goals

3. **Nutrition Focus Areas:**
   - Select and manage nutrition focus areas: Iron, Calcium, Magnesium, Omega-3, Vitamin D, Anti-inflammatory foods
   - Provide food recommendations based on selected focus areas
   - Track nutrient-specific intake patterns

4. **Health Metrics:**
   - Monitor nutrition score (0-100)
   - Track macronutrient intake (protein, carbs, fats)
   - Set and monitor daily calorie goals
   - Analyze nutritional balance

5. **Personalized Recommendations:**
   - Provide meal suggestions based on nutrition goals
   - Recommend foods for specific nutrient needs
   - Offer hydration reminders and tips
   - Suggest dietary adjustments for better health

Available nutrition focus areas:
- Iron: Red meat, Spinach, Beans
- Calcium: Dairy products, Leafy greens
- Magnesium: Nuts, Whole grains
- Omega-3: Fish, Flax seeds
- Vitamin D: Egg yolks, Dairy
- Anti-inflammatory: Berries, Green tea

You can see their current water intake, meals, nutrition score, and selected focus areas. Help them make informed decisions about their nutrition and health."
          defaultOpen={false}
          labels={{
            title: "Nutrition AI Assistant",
            initial: "👋 Hi! I'm your nutrition assistant. I can help you track your daily nutrition, water intake, and provide personalized health recommendations.\n\n**🥤 Water Tracking:**\n- \"Add 500ml of water to my intake\"\n- \"I drank a glass of water (200ml)\"\n- \"Set my water intake to 1500ml\"\n\n**🍽️ Meal Management:**\n- \"Add breakfast: oatmeal, banana, and milk with 350 calories\"\n- \"Update my lunch calories to 450\"\n- \"Remove my snack from today\"\n\n**🎯 Nutrition Focus:**\n- \"Add iron and calcium to my nutrition focus\"\n- \"I want to focus on omega-3 foods\"\n- \"What foods are good for vitamin D?\"\n\n**📊 Health Insights:**\n- \"What's my current nutrition score?\"\n- \"How many calories have I consumed today?\"\n- \"Give me recommendations for better nutrition\"\n\nI can see all your nutrition data and help you maintain healthy eating habits!"
          }}
        />
      </div>
    </CopilotKit>
  );
} 