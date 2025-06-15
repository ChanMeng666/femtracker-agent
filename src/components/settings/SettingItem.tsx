import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SettingItemProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
}

export const SettingItem: React.FC<SettingItemProps> = ({
  icon: Icon,
  title,
  subtitle,
  onClick,
  rightElement
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
    >
      <Icon size={20} className="text-gray-600" />
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {rightElement || <ChevronRight size={16} className="text-gray-400" />}
    </button>
  );
}; 