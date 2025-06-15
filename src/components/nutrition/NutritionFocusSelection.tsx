import React from 'react';
import { nutritionFocus } from '@/constants/nutrition';

interface NutritionFocusSelectionProps {
  selectedFoodTypes: string[];
  onToggleFoodType: (type: string) => void;
}

export const NutritionFocusSelection: React.FC<NutritionFocusSelectionProps> = ({
  selectedFoodTypes,
  onToggleFoodType,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Nutrition Focus Areas</h2>
      <p className="text-sm text-gray-600 mb-6">
        Select your nutritional focus areas to get personalized food recommendations
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nutritionFocus.map((focus) => (
          <button
            key={focus.type}
            onClick={() => onToggleFoodType(focus.type)}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedFoodTypes.includes(focus.type)
                ? 'border-green-500 bg-green-50 shadow-md'
                : `${focus.color} border-2 hover:shadow-sm`
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{focus.icon}</span>
              <span className="font-medium text-gray-800">{focus.label}</span>
            </div>
            <p className="text-xs text-gray-600 text-left">{focus.foods}</p>
          </button>
        ))}
      </div>
    </div>
  );
}; 