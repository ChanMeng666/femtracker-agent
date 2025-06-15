import React from 'react';
import { Meal } from '@/types/nutrition';

interface MealsOverviewProps {
  todayMeals: Meal[];
}

export const MealsOverview: React.FC<MealsOverviewProps> = ({
  todayMeals,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Today&apos;s Meals</h2>
      <div className="space-y-4">
        {todayMeals.map((meal, index) => (
          <div key={index} className="border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-medium text-gray-800">{meal.time}</h3>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {meal.calories} cal
              </span>
            </div>
            
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Foods:</h4>
              <div className="flex flex-wrap gap-2">
                {meal.foods.map((food, foodIndex) => (
                  <span 
                    key={foodIndex}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                  >
                    {food}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Key Nutrients:</h4>
              <div className="flex flex-wrap gap-2">
                {meal.nutrients.map((nutrient, nutrientIndex) => (
                  <span 
                    key={nutrientIndex}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                  >
                    {nutrient}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 