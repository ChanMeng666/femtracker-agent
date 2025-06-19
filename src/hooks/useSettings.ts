import { useState } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { SettingTab, UserProfile, NotificationSettings, PrivacySettings } from "@/types/settings";
import { settingTabs } from "@/constants/settings";

export const useSettings = () => {
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

  // Make settings data readable by AI
  useCopilotReadable({
    description: "Current app settings and user preferences",
    value: {
      activeTab,
      userProfile,
      notificationSettings,
      privacySettings,
      availableTabs: settingTabs.map(tab => ({
        id: tab.id,
        name: tab.name,
        description: tab.description,
        active: activeTab === tab.id
      }))
    }
  });

  // AI Action: Switch tab
  useCopilotAction({
    name: "switchSettingsTabLocal",
    description: "Switch to a different settings tab",
    parameters: [{
      name: "tabId",
      type: "string",
      description: "Tab to switch to (personal, data, notifications, accessibility, privacy, about)",
      required: true,
    }],
    handler: ({ tabId }) => {
      const validTabs: SettingTab[] = ['personal', 'data', 'notifications', 'accessibility', 'privacy', 'about'];
      if (validTabs.includes(tabId as SettingTab)) {
        setActiveTab(tabId as SettingTab);
      }
    },
  });

  // AI Action: Update user profile
  useCopilotAction({
    name: "updateUserProfileLocal",
    description: "Update user profile information",
    parameters: [
      {
        name: "name",
        type: "string",
        description: "User's name",
        required: false,
      },
      {
        name: "email",
        type: "string",
        description: "User's email address",
        required: false,
      },
      {
        name: "age",
        type: "number",
        description: "User's age (18-100)",
        required: false,
      },
      {
        name: "language",
        type: "string",
        description: "Preferred language (English, Spanish, French, etc.)",
        required: false,
      },
      {
        name: "theme",
        type: "string",
        description: "App theme (light, dark, auto)",
        required: false,
      }
    ],
    handler: ({ name, email, age, language, theme }) => {
      setUserProfile(prev => ({
        ...prev,
        ...(name && { name }),
        ...(email && { email }),
        ...(age && age >= 18 && age <= 100 && { age }),
        ...(language && { language }),
        ...(theme && ['light', 'dark', 'auto'].includes(theme) && { theme })
      }));
    },
  });

  // AI Action: Update notification settings
  useCopilotAction({
    name: "updateNotificationSettingsLocal",
    description: "Update notification preferences",
    parameters: [
      {
        name: "cycleReminders",
        type: "boolean",
        description: "Enable/disable cycle reminders",
        required: false,
      },
      {
        name: "symptomTracking",
        type: "boolean",
        description: "Enable/disable symptom tracking notifications",
        required: false,
      },
      {
        name: "exerciseGoals",
        type: "boolean",
        description: "Enable/disable exercise goal notifications",
        required: false,
      },
      {
        name: "nutritionTips",
        type: "boolean",
        description: "Enable/disable nutrition tips",
        required: false,
      },
      {
        name: "healthInsights",
        type: "boolean",
        description: "Enable/disable health insights notifications",
        required: false,
      }
    ],
    handler: ({ cycleReminders, symptomTracking, exerciseGoals, nutritionTips, healthInsights }) => {
      setNotificationSettings(prev => ({
        ...prev,
        ...(cycleReminders !== undefined && { cycleReminders }),
        ...(symptomTracking !== undefined && { symptomTracking }),
        ...(exerciseGoals !== undefined && { exerciseGoals }),
        ...(nutritionTips !== undefined && { nutritionTips }),
        ...(healthInsights !== undefined && { healthInsights })
      }));
    },
  });

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