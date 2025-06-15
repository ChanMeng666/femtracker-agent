import React from 'react';
import { settingTabs } from '@/constants/settings';
import { SettingTab } from '@/types/settings';

interface SettingsNavigationProps {
  activeTab: SettingTab;
  onTabChange: (tab: SettingTab) => void;
}

export const SettingsNavigation: React.FC<SettingsNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Settings</h2>
      <div className="space-y-2">
        {settingTabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full text-left p-4 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <IconComponent size={20} className={tab.color} />
                <span className="font-medium text-gray-800">{tab.name}</span>
              </div>
              <p className="text-sm text-gray-600 ml-8">{tab.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}; 