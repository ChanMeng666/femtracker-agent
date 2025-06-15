'use client';

// Import and re-export all settings components
import { PersonalSettingsContent } from './settings';

export {
  PersonalSettingsContent,
  SettingsHeader,
  PersonalInformation,
  AppBehavior,
  SaveBanner,
  ThemeSettings,
  NotificationSettings,
  PrivacySettings,
  ToggleSwitch
} from './settings';

// Main component for backwards compatibility
export default function PersonalSettings() {
  return <PersonalSettingsContent />;
} 