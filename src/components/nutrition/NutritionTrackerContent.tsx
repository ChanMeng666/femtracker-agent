import React from 'react';
import { useNutrition } from '@/hooks/nutrition';
import { PageHeader } from '@/components/shared/PageHeader';
import { NutritionOverview } from './NutritionOverview';
import { WaterIntakeTracker } from './WaterIntakeTracker';
import { NutritionFocusSelection } from './NutritionFocusSelection';
import { MealsOverview } from './MealsOverview';

export const NutritionTrackerContent: React.FC = () => {
  const {
    waterIntake,
    setWaterIntake,
    selectedFoodTypes,
    todayMeals,
    calorieGoal,
    nutritionScore,
    proteinData,
    carbData,
    fatData,
    totalCalories,
    toggleFoodType,
  } = useNutrition();

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Navigation */}
        <PageHeader
          title="Nutrition & Health Assistant"
          subtitle="Track nutrition, water intake, and get personalized health advice"
          icon="🥗"
          statusInfo={{
            text: `Score: ${nutritionScore}/100`,
            variant: 'success'
          }}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            
            <NutritionOverview
              totalCalories={totalCalories}
              calorieGoal={calorieGoal}
              proteinData={proteinData}
              carbData={carbData}
              fatData={fatData}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WaterIntakeTracker
                waterIntake={waterIntake}
                onWaterIntakeChange={setWaterIntake}
              />

              <NutritionFocusSelection
                selectedFoodTypes={selectedFoodTypes}
                onToggleFoodType={toggleFoodType}
              />
            </div>

            <MealsOverview
              todayMeals={todayMeals}
            />

            {/* Nutrition Recommendations */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-green-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🤖</span>
                <h2 className="text-xl font-semibold text-gray-800">AI Nutrition Recommendations</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-white/60 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🥤</span>
                      <span className="font-medium text-gray-800">Hydration Status</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      You&apos;ve consumed {waterIntake}ml today. Great progress! Try to reach your 2000ml daily goal.
                    </p>
                  </div>
                  <div className="p-4 bg-white/60 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🍎</span>
                      <span className="font-medium text-gray-800">Nutrient Balance</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Your protein intake looks good at {proteinData}g. Consider adding more leafy greens for iron.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white/60 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">⚡</span>
                      <span className="font-medium text-gray-800">Energy Levels</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Current calorie intake: {totalCalories}. Perfect balance for sustained energy throughout the day.
                    </p>
                  </div>
                  <div className="p-4 bg-white/60 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🌿</span>
                      <span className="font-medium text-gray-800">Health Tips</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Include omega-3 rich foods like salmon or walnuts to support hormonal health.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}; 