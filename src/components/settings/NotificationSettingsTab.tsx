import React from 'react';
import { NotificationSettings } from '@/types/settings';
import { DataCard } from '@/components/shared/DataCard';

interface NotificationSettingsTabProps {
  notificationSettings: NotificationSettings;
  onUpdateSettings: (updates: Partial<NotificationSettings>) => Promise<void>;
}

export const NotificationSettingsTab: React.FC<NotificationSettingsTabProps> = ({
  notificationSettings,
  onUpdateSettings,
}) => {
  const notificationOptions = [
    {
      key: 'cycleReminders' as keyof NotificationSettings,
      title: 'Cycle Reminders',
      description: 'Get notified about upcoming periods and fertile windows',
      icon: '🌸'
    },
    {
      key: 'symptomTracking' as keyof NotificationSettings,
      title: 'Symptom Tracking',
      description: 'Daily reminders to log symptoms and mood',
      icon: '📝'
    },
    {
      key: 'exerciseGoals' as keyof NotificationSettings,
      title: 'Exercise Goals',
      description: 'Reminders about your fitness goals and workout plans',
      icon: '🏃‍♀️'
    },
    {
      key: 'nutritionTips' as keyof NotificationSettings,
      title: 'Nutrition Tips',
      description: 'Daily nutrition advice and meal recommendations',
      icon: '🥗'
    },
    {
      key: 'healthInsights' as keyof NotificationSettings,
      title: 'Health Insights',
      description: 'Weekly health reports and personalized insights',
      icon: '📊'
    }
  ];

  const handleToggle = async (key: keyof NotificationSettings) => {
    await onUpdateSettings({ [key]: !notificationSettings[key] });
  };

  return (
    <DataCard title="Notification Preferences" icon="🔔">
      
      <div className="space-y-4">
        {notificationOptions.map((option) => (
          <div key={option.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
              <span className="text-2xl">{option.icon}</span>
              <div>
                <h3 className="font-medium text-gray-800">{option.title}</h3>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => handleToggle(option.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings[option.key] ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings[option.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <h3 className="font-medium text-blue-800 mb-2">📱 Notification Schedule</h3>
        <p className="text-sm text-blue-700">
          Notifications are sent at optimal times based on your activity patterns and preferences. 
          You can adjust timing for each notification type in the advanced settings.
        </p>
      </div>
    </DataCard>
  );
}; 