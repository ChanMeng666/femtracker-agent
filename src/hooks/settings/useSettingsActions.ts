import React from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { SettingTab, UserProfile, NotificationSettings, PrivacySettings } from "@/types/settings";
import { settingTabs } from "@/constants/settings";

interface UseSettingsActionsProps {
  activeTab: SettingTab;
  setActiveTab: (tab: SettingTab) => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  notificationSettings: NotificationSettings;
  setNotificationSettings: React.Dispatch<React.SetStateAction<NotificationSettings>>;
  privacySettings: PrivacySettings;
}

export const useSettingsActions = ({
  activeTab,
  setActiveTab,
  userProfile,
  setUserProfile,
  notificationSettings,
  setNotificationSettings,
  privacySettings
}: UseSettingsActionsProps) => {
  
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
    name: "switchSettingsTab",
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
    name: "updateUserProfile",
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
    name: "updateNotificationSettings",
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

  return null; // This hook only sets up actions, no return value needed
}; 