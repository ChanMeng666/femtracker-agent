import React from 'react';
import { Shield, Eye } from 'lucide-react';
import type { UserPreferences } from '../../types/settings';
import { ToggleSwitch } from './ToggleSwitch';

interface PrivacySettingsProps {
  preferences: UserPreferences;
  onUpdatePreference: <T extends keyof UserPreferences>(
    section: T,
    key: keyof UserPreferences[T],
    value: UserPreferences[T][keyof UserPreferences[T]]
  ) => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  preferences,
  onUpdatePreference
}) => {
  return (
    <div className="space-y-6">
      {/* Privacy Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold">Privacy & Data</h3>
        </div>

        <div className="divide-y divide-gray-100">
          <ToggleSwitch
            enabled={preferences.privacy.dataCollection}
            onChange={(value) => onUpdatePreference('privacy', 'dataCollection', value)}
            label="Data Collection"
            description="Allow collection of anonymous usage data to improve the app"
          />
          
          <ToggleSwitch
            enabled={preferences.privacy.analytics}
            onChange={(value) => onUpdatePreference('privacy', 'analytics', value)}
            label="Analytics"
            description="Help improve the app by sharing anonymous analytics"
          />
          
          <ToggleSwitch
            enabled={preferences.privacy.crashReports}
            onChange={(value) => onUpdatePreference('privacy', 'crashReports', value)}
            label="Crash Reports"
            description="Automatically send crash reports to help fix issues"
          />
        </div>
      </div>

      {/* Accessibility Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Eye className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold">Accessibility</h3>
        </div>

        <div className="divide-y divide-gray-100">
          <ToggleSwitch
            enabled={preferences.accessibility.highContrast}
            onChange={(value) => onUpdatePreference('accessibility', 'highContrast', value)}
            label="High Contrast"
            description="Improve interface contrast for users with visual impairments"
          />
          
          <ToggleSwitch
            enabled={preferences.accessibility.reduceMotion}
            onChange={(value) => onUpdatePreference('accessibility', 'reduceMotion', value)}
            label="Reduce Animations"
            description="Reduce interface animation effects"
          />
          
          <ToggleSwitch
            enabled={preferences.accessibility.largeButtons}
            onChange={(value) => onUpdatePreference('accessibility', 'largeButtons', value)}
            label="Large Buttons"
            description="Use larger touch buttons"
          />
        </div>
      </div>
    </div>
  );
}; 