import React from 'react';
import { SpecialPreferences } from '@/types/recipe';
import { dietaryOptions } from '@/constants/recipe';

interface DietaryPreferencesProps {
  selectedPreferences: SpecialPreferences[];
  onDietaryChange: (preference: SpecialPreferences, checked: boolean) => void;
  changedKeys: string[];
}

export const DietaryPreferences: React.FC<DietaryPreferencesProps> = ({
  selectedPreferences,
  onDietaryChange,
  changedKeys,
}) => {
  return (
    <div className="section-container relative">
      {changedKeys.includes("special_preferences") && <Ping />}
      <h2 className="section-title">Dietary Preferences</h2>
      <div className="dietary-options">
        {dietaryOptions.map((option) => (
          <label key={option} className="dietary-option">
            <input
              type="checkbox"
              checked={selectedPreferences.includes(option)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onDietaryChange(option, e.target.checked)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

function Ping() {
  return (
    <span className="ping-animation">
      <span className="ping-circle"></span>
      <span className="ping-dot"></span>
    </span>
  );
} 