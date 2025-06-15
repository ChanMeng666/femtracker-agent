import { useState, useEffect } from 'react';
import type { UserPreferences } from '../types/settings';
import { DEFAULT_USER_PREFERENCES } from '../constants/settings';

export const useSettingsState = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from local storage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('femtracker-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences({ ...DEFAULT_USER_PREFERENCES, ...parsed });
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    }
  }, []);

  // Detect setting changes
  useEffect(() => {
    const savedPreferences = localStorage.getItem('femtracker-preferences');
    const currentPreferences = JSON.stringify(preferences);
    const savedString = savedPreferences || JSON.stringify(DEFAULT_USER_PREFERENCES);
    setHasChanges(currentPreferences !== savedString);
  }, [preferences]);

  // Update nested preference
  const updatePreference = <T extends keyof UserPreferences>(
    section: T,
    key: keyof UserPreferences[T],
    value: UserPreferences[T][keyof UserPreferences[T]]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [key]: value
      }
    }));
  };

  // Update basic setting
  const updateBasicSetting = <T extends keyof UserPreferences>(
    key: T,
    value: UserPreferences[T]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Save settings
  const savePreferences = async () => {
    setIsSaving(true);
    try {
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('femtracker-preferences', JSON.stringify(preferences));
      setHasChanges(false);
      
      // Apply theme settings
      applyThemeSettings(preferences.theme);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset preferences
  const resetPreferences = () => {
    setPreferences(DEFAULT_USER_PREFERENCES);
  };

  // Apply theme settings
  const applyThemeSettings = (theme: UserPreferences['theme']) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Follow system
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return {
    preferences,
    hasChanges,
    isSaving,
    updatePreference,
    updateBasicSetting,
    savePreferences,
    resetPreferences
  };
}; 