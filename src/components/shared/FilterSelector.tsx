import React from 'react';

interface FilterOption {
  value: string;
  label: string;
  icon?: string;
}

interface FilterSelectorProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  variant?: 'default' | 'compact' | 'pills';
  className?: string;
}

export const FilterSelector: React.FC<FilterSelectorProps> = ({
  label,
  value,
  options,
  onChange,
  variant = 'default',
  className = ''
}) => {
  
  if (variant === 'pills') {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                value === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.icon && <span className="mr-1">{option.icon}</span>}
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {label}:
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.icon && `${option.icon} `}
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}; 