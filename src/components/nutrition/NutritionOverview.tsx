import React from 'react';

interface NutritionOverviewProps {
  totalCalories: number;
  calorieGoal: number;
  proteinData: number;
  carbData: number;
  fatData: number;
}

export const NutritionOverview: React.FC<NutritionOverviewProps> = ({
  totalCalories,
  calorieGoal,
  proteinData,
  carbData,
  fatData,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Today&apos;s Nutrition Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="text-3xl font-bold text-green-600 mb-1">{totalCalories}</div>
          <div className="text-sm text-gray-600">Calories</div>
          <div className="text-xs text-green-600 mt-1">Goal: {calorieGoal}</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="text-3xl font-bold text-blue-600 mb-1">{proteinData}g</div>
          <div className="text-sm text-gray-600">Protein</div>
          <div className="text-xs text-blue-600 mt-1">Goal Met</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
          <div className="text-3xl font-bold text-purple-600 mb-1">{carbData}g</div>
          <div className="text-sm text-gray-600">Carbohydrates</div>
          <div className="text-xs text-purple-600 mt-1">Moderate</div>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <div className="text-3xl font-bold text-yellow-600 mb-1">{fatData}g</div>
          <div className="text-sm text-gray-600">Healthy Fats</div>
          <div className="text-xs text-yellow-600 mt-1">Good</div>
        </div>
      </div>
    </div>
  );
}; 