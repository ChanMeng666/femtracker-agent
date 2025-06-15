import React from 'react';

interface WaterIntakeTrackerProps {
  waterIntake: number;
  onWaterIntakeChange: (amount: number) => void;
}

export const WaterIntakeTracker: React.FC<WaterIntakeTrackerProps> = ({
  waterIntake,
  onWaterIntakeChange,
}) => {
  const dailyGoal = 2000;
  const waterPercentage = Math.min((waterIntake / dailyGoal) * 100, 100);

  const addWater = (amount: number) => {
    onWaterIntakeChange(Math.min(waterIntake + amount, 3000));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Daily Water Intake</h2>
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">{waterIntake} ml</div>
          <div className="text-sm text-gray-600">of {dailyGoal} ml daily goal</div>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
            <div 
              className="bg-gradient-to-r from-blue-400 to-cyan-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${waterPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-blue-600 mt-2">{Math.round(waterPercentage)}% completed</div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => addWater(200)}
            className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            <div className="text-center">
              <div className="text-lg mb-1">🥤</div>
              <div className="text-sm font-medium text-gray-800">Glass</div>
              <div className="text-xs text-gray-600">200ml</div>
            </div>
          </button>
          <button
            onClick={() => addWater(500)}
            className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            <div className="text-center">
              <div className="text-lg mb-1">🍼</div>
              <div className="text-sm font-medium text-gray-800">Bottle</div>
              <div className="text-xs text-gray-600">500ml</div>
            </div>
          </button>
          <button
            onClick={() => addWater(350)}
            className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            <div className="text-center">
              <div className="text-lg mb-1">☕</div>
              <div className="text-sm font-medium text-gray-800">Mug</div>
              <div className="text-xs text-gray-600">350ml</div>
            </div>
          </button>
          <button
            onClick={() => addWater(250)}
            className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            <div className="text-center">
              <div className="text-lg mb-1">🥛</div>
              <div className="text-sm font-medium text-gray-800">Cup</div>
              <div className="text-xs text-gray-600">250ml</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}; 