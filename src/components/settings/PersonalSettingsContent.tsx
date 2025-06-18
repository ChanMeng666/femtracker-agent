import { useSettingsWithDB } from '@/hooks/useSettingsWithDB';
import { SettingsHeader } from './SettingsHeader';
import { PersonalInformation } from './PersonalInformation';
import { ThemeSettings } from './ThemeSettings';
import { NotificationSettings } from './NotificationSettings';
import { AppBehavior } from './AppBehavior';
import { PrivacySettings } from './PrivacySettings';
import { SaveBanner } from './SaveBanner';

export function PersonalSettingsContent() {
  const settingsData = useSettingsWithDB();
  const { userProfile, notificationSettings, privacySettings, loading } = settingsData;

  // 简化的preferences对象，只包含必要的字段
  const preferences = {
    name: userProfile.name,
    age: userProfile.age,
    location: '', // 默认空值
    avatarUrl: userProfile.avatarUrl,
    theme: userProfile.theme as 'light' | 'dark' | 'auto',
    primaryColor: '#ff6b6b',
    fontSize: 'medium' as const,
    notifications: {
      cycleReminders: notificationSettings.cycleReminders,
      healthTips: notificationSettings.healthInsights,
      dataBackup: true,
      appUpdates: true,
    },
    language: 'en-US' as const,
    timezone: 'UTC',
    dateFormat: 'yyyy-MM-dd' as const,
    privacy: {
      dataCollection: privacySettings.dataSharing,
      analytics: privacySettings.analyticsTracking,
      crashReports: true,
    },
    accessibility: {
      highContrast: false,
      reduceMotion: false,
      screenReader: false,
      largeButtons: false,
    },
    behavior: {
      autoSave: privacySettings.autoBackup,
      hapticFeedback: false,
      soundEffects: false,
      quickActions: false,
    },
  };

  const updateBasicSetting = async (key: string, value: unknown) => {
    if (['name', 'age', 'theme', 'avatarUrl'].includes(key)) {
      await settingsData.setUserProfile({ [key]: value });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatePreference: any = (section: any, key: any, value: any) => {
    if (section === 'notifications') {
      if (key === 'cycleReminders') {
        settingsData.setNotificationSettings({ cycleReminders: value as boolean });
      } else if (key === 'healthTips') {
        settingsData.setNotificationSettings({ healthInsights: value as boolean });
      }
    } else if (section === 'privacy') {
      if (key === 'dataCollection') {
        settingsData.setPrivacySettings({ dataSharing: value as boolean });
      } else if (key === 'analytics') {
        settingsData.setPrivacySettings({ analyticsTracking: value as boolean });
      }
    }
  };

  // 添加模拟的状态管理变量
  const hasChanges = false; // 这可以基于实际的状态变化来实现
  const isSaving = false; // 这可以基于实际的保存状态来实现
  
  const savePreferences = async () => {
    // 由于我们使用的是实时保存，这里可以是空函数或者显示成功消息
    console.log('Settings are auto-saved');
  };
  
  const resetPreferences = async () => {
    // 重置逻辑可以根据需要实现
    console.log('Reset preferences');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <SettingsHeader
        hasChanges={hasChanges}
        isSaving={isSaving}
        onSave={savePreferences}
        onReset={resetPreferences}
      />

      {/* Personal Information */}
      <PersonalInformation
        preferences={preferences}
        onUpdateBasicSetting={updateBasicSetting}
      />

      {/* Theme Settings */}
      <ThemeSettings
        preferences={preferences}
        onUpdateBasicSetting={updateBasicSetting}
      />

      {/* Notification Settings */}
      <NotificationSettings
        preferences={preferences}
        onUpdatePreference={updatePreference}
      />

      {/* App Behavior */}
      <AppBehavior
        preferences={preferences}
        onUpdatePreference={updatePreference}
      />

      {/* Privacy & Accessibility Settings */}
      <PrivacySettings
        preferences={preferences}
        onUpdatePreference={updatePreference}
      />

      {/* Save Banner */}
      <SaveBanner
        hasChanges={hasChanges}
        isSaving={isSaving}
        onSave={savePreferences}
        onReset={resetPreferences}
      />
    </div>
  );
} 