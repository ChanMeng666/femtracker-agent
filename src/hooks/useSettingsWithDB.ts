import { useState, useEffect } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { SettingTab, UserProfile, NotificationSettings, PrivacySettings } from "@/types/settings";
import { settingTabs } from "@/constants/settings";
import { useAuth } from "./auth/useAuth";
import { supabase, Profile } from "@/lib/supabase/client";

export const useSettingsWithDB = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingTab>('personal');
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    email: "",
    age: 0,
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

  // Load user profile and preferences from database
  useEffect(() => {
    if (!user) return;
    
    const loadUserData = async () => {
      setLoading(true);
      try {
        // Load profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setUserProfile({
            name: profileData.full_name || user.user_metadata?.full_name || '',
            email: profileData.email || user.email || '',
            age: profileData.age || 0,
            language: "English", // Default for now
            theme: "light" // Default for now
          });
        }

        // Load user preferences
        const { data: preferencesData } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (preferencesData) {
          // Update theme and other app preferences
          setUserProfile(prev => ({
            ...prev,
            theme: preferencesData.theme || 'light'
          }));

          // Update notification settings
          if (preferencesData.notifications) {
            setNotificationSettings({
              cycleReminders: preferencesData.notifications.cycleReminders ?? true,
              symptomTracking: preferencesData.notifications.symptomTracking ?? true,
              exerciseGoals: preferencesData.notifications.exerciseGoals ?? false,
              nutritionTips: preferencesData.notifications.nutritionTips ?? true,
              healthInsights: preferencesData.notifications.healthInsights ?? true
            });
          }

          // Update privacy settings
          if (preferencesData.privacy) {
            setPrivacySettings({
              dataSharing: preferencesData.privacy.dataSharing ?? false,
              analyticsTracking: preferencesData.privacy.analyticsTracking ?? true,
              biometricLock: preferencesData.privacy.biometricLock ?? false,
              autoBackup: preferencesData.privacy.autoBackup ?? true
            });
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  // Save profile updates to database
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      // Update profile table
      const profileUpdates: Partial<Profile> = {};
      if (updates.name !== undefined) profileUpdates.full_name = updates.name;
      if (updates.email !== undefined) profileUpdates.email = updates.email;
      if (updates.age !== undefined) profileUpdates.age = updates.age;

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
          return;
        }
      }

      // Update user preferences for theme
      if (updates.theme !== undefined) {
        const { error: prefsError } = await supabase
          .from('user_preferences')
          .update({ theme: updates.theme })
          .eq('user_id', user.id);

        if (prefsError) {
          console.error('Error updating theme:', prefsError);
          return;
        }
      }

      // Update local state
      setUserProfile(prev => ({ ...prev, ...updates }));
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Save notification settings to database
  const updateNotificationSettings = async (updates: Partial<NotificationSettings>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({ 
          notifications: {
            ...notificationSettings,
            ...updates
          }
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating notification settings:', error);
        return;
      }

      // Update local state
      setNotificationSettings(prev => ({ ...prev, ...updates }));
      console.log('Notification settings updated successfully');
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  // Save privacy settings to database
  const updatePrivacySettings = async (updates: Partial<PrivacySettings>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({ 
          privacy: {
            ...privacySettings,
            ...updates
          }
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating privacy settings:', error);
        return;
      }

      // Update local state
      setPrivacySettings(prev => ({ ...prev, ...updates }));
      console.log('Privacy settings updated successfully');
    } catch (error) {
      console.error('Error updating privacy settings:', error);
    }
  };

  // Make settings data readable by AI
  useCopilotReadable({
    description: "Current app settings and user preferences with database persistence",
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
      const updates: Partial<UserProfile> = {};
      
      if (name) updates.name = name;
      if (email) updates.email = email;
      if (age && age >= 18 && age <= 100) updates.age = age;
      if (language) updates.language = language;
      if (theme && ['light', 'dark', 'auto'].includes(theme)) updates.theme = theme;

      if (Object.keys(updates).length > 0) {
        await updateUserProfile(updates);
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
      
      if (cycleReminders !== undefined) updates.cycleReminders = cycleReminders;
      if (symptomTracking !== undefined) updates.symptomTracking = symptomTracking;
      if (exerciseGoals !== undefined) updates.exerciseGoals = exerciseGoals;
      if (nutritionTips !== undefined) updates.nutritionTips = nutritionTips;
      if (healthInsights !== undefined) updates.healthInsights = healthInsights;

      if (Object.keys(updates).length > 0) {
        await updateNotificationSettings(updates);
        return `Notification settings updated: ${Object.keys(updates).join(', ')}`;
      }
      return "No notification settings to update";
    },
  });

  return {
    activeTab,
    setActiveTab,
    userProfile,
    setUserProfile: updateUserProfile,
    notificationSettings,
    setNotificationSettings: updateNotificationSettings,
    privacySettings,
    setPrivacySettings: updatePrivacySettings,
    currentTab,
    loading,
  };
}; 