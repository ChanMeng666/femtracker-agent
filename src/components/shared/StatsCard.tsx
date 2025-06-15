import React from 'react';

interface StatsCardProps {
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: 'pink' | 'green' | 'blue' | 'purple' | 'yellow' | 'teal';
  onClick?: () => void;
}

const colorClasses = {
  pink: {
    bg: 'bg-pink-100',
    icon: 'text-pink-600',
    value: 'text-pink-600'
  },
  green: {
    bg: 'bg-green-100',
    icon: 'text-green-600',
    value: 'text-green-600'
  },
  blue: {
    bg: 'bg-blue-100',
    icon: 'text-blue-600',
    value: 'text-blue-600'
  },
  purple: {
    bg: 'bg-purple-100',
    icon: 'text-purple-600',
    value: 'text-purple-600'
  },
  yellow: {
    bg: 'bg-yellow-100',
    icon: 'text-yellow-600',
    value: 'text-yellow-600'
  },
  teal: {
    bg: 'bg-teal-100',
    icon: 'text-teal-600',
    value: 'text-teal-600'
  }
};

const trendIcons = {
  up: '📈',
  down: '📉',
  stable: '➡️'
};

export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  title,
  value,
  subtitle,
  trend,
  color = 'blue',
  onClick
}) => {
  const colorScheme = colorClasses[color];
  
  return (
    <div 
      className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${
        onClick ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-12 h-12 ${colorScheme.bg} rounded-lg flex items-center justify-center`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-bold ${colorScheme.value}`}>
              {value}
            </p>
            {trend && (
              <span className="text-sm">
                {trendIcons[trend]}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}; 