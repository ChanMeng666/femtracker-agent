import React from 'react';
import { exerciseTypes, intensityLevels } from '@/constants/exercise';

interface ExerciseTypeSelectionProps {
  selectedExercise: string;
  exerciseIntensity: string;
  exerciseDuration: number;
  onSelectExercise: (type: string) => void;
  onSelectIntensity: (intensity: string) => void;
  onDurationChange: (duration: number) => void;
}

export const ExerciseTypeSelection: React.FC<ExerciseTypeSelectionProps> = ({
  selectedExercise,
  exerciseIntensity,
  exerciseDuration,
  onSelectExercise,
  onSelectIntensity,
  onDurationChange,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Today&apos;s Exercise Record</h2>
      
      {/* Exercise Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {exerciseTypes.map((exercise) => (
          <button
            key={exercise.type}
            onClick={() => onSelectExercise(exercise.type)}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedExercise === exercise.type
                ? 'border-teal-500 bg-teal-50 shadow-md'
                : `${exercise.color} border-2 hover:shadow-sm`
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{exercise.icon}</span>
              <span className="font-medium text-gray-800">{exercise.label}</span>
            </div>
            <p className="text-xs text-gray-600 text-left">{exercise.examples}</p>
          </button>
        ))}
      </div>

      {/* Exercise Intensity Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Exercise Intensity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {intensityLevels.map((intensity) => (
            <button
              key={intensity.level}
              onClick={() => onSelectIntensity(intensity.level)}
              className={`p-3 rounded-lg border-2 transition-all ${
                exerciseIntensity === intensity.level
                  ? 'border-teal-500 bg-teal-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`inline-flex px-2 py-1 rounded-full text-sm font-medium mb-2 ${intensity.color}`}>
                {intensity.label}
              </div>
              <p className="text-xs text-gray-600">{intensity.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Duration */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Exercise Duration</h3>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="5"
            max="120"
            step="5"
            value={exerciseDuration}
            onChange={(e) => onDurationChange(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-lg font-semibold text-gray-800 min-w-[60px]">{exerciseDuration} min</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>5 min</span>
          <span>60 min</span>
          <span>120 min</span>
        </div>
      </div>

      {/* Record Button */}
      <div className="text-center">
        <button className="px-8 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium">
          Record Today&apos;s Exercise
        </button>
      </div>
    </div>
  );
}; 