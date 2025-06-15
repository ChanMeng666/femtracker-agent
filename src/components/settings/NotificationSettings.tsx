import React from 'react';
import { Bell } from 'lucide-react';
import type { UserPreferences } from '../../types/settings';
import { ToggleSwitch } from './ToggleSwitch';

interface NotificationSettingsProps {
  preferences: UserPreferences;
  onUpdatePreference: <T extends keyof UserPreferences>(
    section: T,
    key: keyof UserPreferences[T],
    value: UserPreferences[T][keyof UserPreferences[T]]
  ) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  preferences,
  onUpdatePreference
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Bell className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold">Notifications</h3>
      </div>

      <div className="divide-y divide-gray-100">
        <ToggleSwitch
          enabled={preferences.notifications.cycleReminders}
          onChange={(value) => onUpdatePreference('notifications', 'cycleReminders', value)}
          label="Cycle Reminders"
          description="Receive notifications about your menstrual cycle"
        />
        
        <ToggleSwitch
          enabled={preferences.notifications.healthTips}
          onChange={(value) => onUpdatePreference('notifications', 'healthTips', value)}
          label="Health Tips"
          description="Daily health tips and wellness advice"
        />
        
        <ToggleSwitch
          enabled={preferences.notifications.dataBackup}
          onChange={(value) => onUpdatePreference('notifications', 'dataBackup', value)}
          label="Data Backup"
          description="Notifications about data backup and sync"
        />
        
        <ToggleSwitch
          enabled={preferences.notifications.appUpdates}
          onChange={(value) => onUpdatePreference('notifications', 'appUpdates', value)}
          label="App Updates"
          description="Information about new features and updates"
        />
      </div>
    </div>
  );
}; 