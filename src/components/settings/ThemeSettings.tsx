import React from 'react';
import { Palette } from 'lucide-react';
import type { UserPreferences } from '../../types/settings';
import { THEME_OPTIONS, COLOR_OPTIONS, FONT_SIZE_OPTIONS } from '../../constants/settings';

interface ThemeSettingsProps {
  preferences: UserPreferences;
  onUpdateBasicSetting: <T extends keyof UserPreferences>(key: T, value: UserPreferences[T]) => void;
}

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({
  preferences,
  onUpdateBasicSetting
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Palette className="w-5 h-5 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold">Theme & Appearance</h3>
      </div>

      <div className="space-y-6">
        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Theme Mode
          </label>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => onUpdateBasicSetting('theme', option.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    preferences.theme === option.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon size={20} className="mx-auto mb-2" />
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Primary Color
          </label>
          <div className="grid grid-cols-6 gap-3">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color.value}
                onClick={() => onUpdateBasicSetting('primaryColor', color.value)}
                className={`w-12 h-12 rounded-lg border-2 transition-all ${
                  preferences.primaryColor === color.value
                    ? 'border-gray-400 scale-110'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                title={color.label}
              >
                <div className={`w-full h-full rounded-md ${color.color}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Font Size
          </label>
          <div className="grid grid-cols-3 gap-3">
            {FONT_SIZE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onUpdateBasicSetting('fontSize', option.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  preferences.fontSize === option.value
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`font-medium ${option.size}`}>{option.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 