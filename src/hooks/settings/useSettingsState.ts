import { useState } from "react";
import { SettingTab, UserProfile, NotificationSettings, PrivacySettings } from "@/types/settings";
import { settingTabs } from "@/constants/settings";

export const useSettingsState = () => {
  const [activeTab, setActiveTab] = useState<SettingTab>('personal');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    age: 28,
    language: "English",
    theme: "light"
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    cycleReminders: true,
    symptomTracking: true,
    exerciseGoals: false,
    nutritionTips: true,
    healthInsights: true
  });
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    dataSharing: false,
    analyticsTracking: true,
    biometricLock: false,
    autoBackup: true
  });

  const currentTab = settingTabs.find(tab => tab.id === activeTab);

  return {
    activeTab,
    setActiveTab,
    userProfile,
    setUserProfile,
    notificationSettings,
    setNotificationSettings,
    privacySettings,
    setPrivacySettings,
    currentTab,
  };
}; 