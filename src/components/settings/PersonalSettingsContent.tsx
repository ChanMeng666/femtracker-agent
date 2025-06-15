import { useSettingsState } from '@/hooks/useSettingsState';
import { SettingsHeader } from './SettingsHeader';
import { PersonalInformation } from './PersonalInformation';
import { ThemeSettings } from './ThemeSettings';
import { NotificationSettings } from './NotificationSettings';
import { AppBehavior } from './AppBehavior';
import { PrivacySettings } from './PrivacySettings';
import { SaveBanner } from './SaveBanner';

export function PersonalSettingsContent() {
  const {
    preferences,
    hasChanges,
    isSaving,
    updatePreference,
    updateBasicSetting,
    savePreferences,
    resetPreferences
  } = useSettingsState();

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