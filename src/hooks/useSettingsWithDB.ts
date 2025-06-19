import { useState, useEffect } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { SettingTab, UserProfile, NotificationSettings, PrivacySettings } from "@/types/settings";
import { settingTabs } from "@/constants/settings";
import { useAuth } from "./auth/useAuth";
import { supabaseRest, Profile } from "@/lib/supabase/rest-client";

// Database types
interface DatabaseUserPreferences {
  id: string;
  user_id: string;
  language: string;
  timezone: string;
  units: string;
  notifications_enabled: boolean;
  data_sharing: boolean;
  created_at: string;
  updated_at: string;
}

// Frontend types
interface PersonalInfo {
  displayName: string;
  email: string;
  dateOfBirth: string;
  heightCm: number;
  cycleLength: number;
  periodLength: number;
}

interface NotificationSettings {
  periodReminders: boolean;
  ovulationAlerts: boolean;
  medicationReminders: boolean;
  appointmentAlerts: boolean;
  healthInsights: boolean;
  dataExportReady: boolean;
}

interface PrivacySettings {
  dataSharing: boolean;
  analytics: boolean;
  crashReports: boolean;
  personalizedAds: boolean;
}

interface UserPreferences {
  language: string;
  timezone: string;
  units: string;
}

// 全局缓存设置数据加载状态，避免页面切换时重复加载
const settingsDataCache = new Map<string, boolean>();

export const useSettingsWithDB = () => {
  const { user, accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingTab>('personal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State management
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    displayName: "",
    email: "",
    dateOfBirth: "",
    heightCm: 160,
    cycleLength: 28,
    periodLength: 5
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    periodReminders: true,
    ovulationAlerts: true,
    medicationReminders: false,
    appointmentAlerts: true,
    healthInsights: true,
    dataExportReady: true
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    dataSharing: false,
    analytics: true,
    crashReports: true,
    personalizedAds: false
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    language: "en",
    timezone: "UTC",
    units: "metric"
  });

  // Load data on mount
  useEffect(() => {
    if (!user || !accessToken) return;
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, accessToken]);

  const loadAllData = async () => {
    if (!user || !accessToken) return;

    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadProfile(),
        loadPreferences()
      ]);
    } catch (err) {
      console.error('Error loading settings data:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    if (!user || !accessToken) return;

    try {
      const result = await supabaseRest.select(
        'profiles',
        '*',
        { id: user.id },
        { accessToken }
      );

      if (result.error) {
        console.error('Error loading profile:', result.error);
        return;
      }

      if (result.data && result.data.length > 0) {
        const profile = result.data[0] as Profile;
        
        setPersonalInfo({
          displayName: profile.display_name || "",
          email: user.email || "",
          dateOfBirth: profile.date_of_birth || "",
          heightCm: profile.height_cm || 160,
          cycleLength: profile.cycle_length || 28,
          periodLength: profile.period_length || 5
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadPreferences = async () => {
    if (!user || !accessToken) return;

    try {
      const result = await supabaseRest.select(
        'user_preferences',
        '*',
        { user_id: user.id },
        { accessToken }
      );

      if (result.error) {
        console.error('Error loading preferences:', result.error);
        return;
      }

      if (result.data && result.data.length > 0) {
        const prefs = result.data[0] as DatabaseUserPreferences;
        
        setPreferences({
          language: prefs.language,
          timezone: prefs.timezone,
          units: prefs.units
        });
        
        setNotifications(prev => ({
          ...prev,
          periodReminders: prefs.notifications_enabled,
          ovulationAlerts: prefs.notifications_enabled,
          healthInsights: prefs.notifications_enabled
        }));
        
        setPrivacy(prev => ({
          ...prev,
          dataSharing: prefs.data_sharing
        }));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  // Update profile information
  const updatePersonalInfo = async (updates: Partial<PersonalInfo>) => {
    if (!user || !accessToken) return;

    try {
      const profileUpdates: Partial<Profile> = {};
      
      if (updates.displayName !== undefined) profileUpdates.display_name = updates.displayName;
      if (updates.dateOfBirth !== undefined) profileUpdates.date_of_birth = updates.dateOfBirth;
      if (updates.heightCm !== undefined) profileUpdates.height_cm = updates.heightCm;
      if (updates.cycleLength !== undefined) profileUpdates.cycle_length = updates.cycleLength;
      if (updates.periodLength !== undefined) profileUpdates.period_length = updates.periodLength;

      const result = await supabaseRest.update(
        'profiles',
        profileUpdates,
        { id: user.id },
        accessToken
      );

      if (result.error) {
        console.error('Error updating profile:', result.error);
        return;
      }

      setPersonalInfo(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating personal info:', error);
    }
  };

  // Update user preferences
  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user || !accessToken) return;

    try {
      const result = await supabaseRest.update(
        'user_preferences',
        updates,
        { user_id: user.id },
        accessToken
      );

      if (result.error) {
        console.error('Error updating preferences:', result.error);
        return;
      }

      setPreferences(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const currentTab = settingTabs.find(tab => tab.id === activeTab);

  // Make settings data readable by AI
  useCopilotReadable({
    description: "Current app settings and user preferences with database persistence",
    value: {
      activeTab,
      personalInfo,
      notifications,
      privacy,
      preferences,
      availableTabs: settingTabs.map(tab => ({
        id: tab.id,
        name: tab.name,
        description: tab.description,
        active: activeTab === tab.id
      })),
      isAuthenticated: !!user,
      loading
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
        return `Switched to ${tabId} settings`;
      }
      return `Invalid tab: ${tabId}`;
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
    handler: async ({ name, email, age, language, theme }) => {
      const updates: Partial<PersonalInfo> = {};
      
      if (name) updates.displayName = name;
      if (email) updates.email = email;
      if (age && age >= 18 && age <= 100) updates.heightCm = age;
      if (language) updates.language = language;
      if (theme && ['light', 'dark', 'auto'].includes(theme)) updates.theme = theme;

      if (Object.keys(updates).length > 0) {
        await updatePersonalInfo(updates);
        return `Profile updated: ${Object.keys(updates).join(', ')}`;
      }
      return "No valid updates provided";
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
    handler: async ({ cycleReminders, symptomTracking, exerciseGoals, nutritionTips, healthInsights }) => {
      const updates: Partial<NotificationSettings> = {};
      
      if (cycleReminders !== undefined) updates.periodReminders = cycleReminders;
      if (symptomTracking !== undefined) updates.ovulationAlerts = symptomTracking;
      if (exerciseGoals !== undefined) updates.medicationReminders = exerciseGoals;
      if (nutritionTips !== undefined) updates.appointmentAlerts = nutritionTips;
      if (healthInsights !== undefined) updates.healthInsights = healthInsights;

      if (Object.keys(updates).length > 0) {
        await updatePreferences({
          language: preferences.language,
          timezone: preferences.timezone,
          units: preferences.units
        });
        return `Notification settings updated: ${Object.keys(updates).join(', ')}`;
      }
      return "No notification settings to update";
    },
  });

  return {
    activeTab,
    setActiveTab,
    personalInfo,
    notifications,
    privacy,
    preferences,
    setPersonalInfo,
    setNotifications,
    setPrivacy,
    setPreferences,
    updatePersonalInfo,
    updatePreferences,
    loadAllData,
    currentTab,
    loading,
    error
  };
}; 