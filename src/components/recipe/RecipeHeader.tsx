import React from 'react';
import { SkillLevel } from '@/types/recipe';
import { cookingTimeValues } from '@/constants/recipe';

interface RecipeHeaderProps {
  title: string;
  skillLevel: SkillLevel;
  cookingTime: string;
  onTitleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSkillLevelChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onCookingTimeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const RecipeHeader: React.FC<RecipeHeaderProps> = ({
  title,
  skillLevel,
  cookingTime,
  onTitleChange,
  onSkillLevelChange,
  onCookingTimeChange,
}) => {
  return (
    <div className="recipe-header">
      <input
        type="text"
        value={title || ''}
        onChange={onTitleChange}
        className="recipe-title-input"
      />
      
      <div className="recipe-meta">
        <div className="meta-item">
          <span className="meta-icon">🕒</span>
          <select
            className="meta-select"
            value={cookingTimeValues.find(t => t.label === cookingTime)?.value || 3}
            onChange={onCookingTimeChange}
            style={{
              backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23555\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0px center',
              backgroundSize: '12px',
              appearance: 'none',
              WebkitAppearance: 'none'
            }}
          >
            {cookingTimeValues.map((time) => (
              <option key={time.value} value={time.value}>
                {time.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="meta-item">
          <span className="meta-icon">🏆</span>
          <select
            className="meta-select"
            value={skillLevel}
            onChange={onSkillLevelChange}
            style={{
              backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23555\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0px center',
              backgroundSize: '12px',
              appearance: 'none',
              WebkitAppearance: 'none'
            }}
          >
            {Object.values(SkillLevel).map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}; 