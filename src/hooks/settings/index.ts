import { useSettingsState } from "./useSettingsState";
import { useSettingsActions } from "./useSettingsActions";

export const useSettings = () => {
  const state = useSettingsState();
  
  // Set up CopilotKit actions
  useSettingsActions({
    activeTab: state.activeTab,
    setActiveTab: state.setActiveTab,
    userProfile: state.userProfile,
    setUserProfile: state.setUserProfile,
    notificationSettings: state.notificationSettings,
    setNotificationSettings: state.setNotificationSettings,
    privacySettings: state.privacySettings
  });

  return state;
}; 