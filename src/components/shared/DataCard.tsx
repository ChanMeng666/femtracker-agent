import React from 'react';

interface DataCardProps {
  title: string;
  children: React.ReactNode;
  icon?: string;
  badge?: string;
  badgeColor?: 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  action?: React.ReactNode;
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

const badgeColorClasses = {
  gray: 'bg-gray-100 text-gray-800',
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  purple: 'bg-purple-100 text-purple-800'
};

const variantClasses = {
  default: 'bg-white border border-gray-100',
  bordered: 'bg-white border-2 border-gray-200',
  elevated: 'bg-white shadow-lg border border-gray-100'
};

const paddingClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

export const DataCard: React.FC<DataCardProps> = ({
  title,
  children,
  icon,
  badge,
  badgeColor = 'gray',
  action,
  variant = 'default',
  padding = 'md',
  className = ''
}) => {
  const variantClass = variantClasses[variant];
  const paddingClass = paddingClasses[padding];
  const badgeClass = badgeColorClasses[badgeColor];
  
  const combinedClasses = `${variantClass} ${paddingClass} rounded-2xl ${className}`.trim();

  return (
    <div className={combinedClasses}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-2xl">{icon}</span>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {badge && (
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${badgeClass}`}>
                {badge}
              </span>
            )}
          </div>
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="text-gray-700">
        {children}
      </div>
    </div>
  );
}; 