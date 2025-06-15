'use client';

import React from 'react';
import { Save, RotateCcw, User, Smartphone } from 'lucide-react';

// Import hooks and components
import { useSettingsState } from '../hooks/useSettingsState';
import { ThemeSettings } from './settings/ThemeSettings';
import { NotificationSettings } from './settings/NotificationSettings';
import { PrivacySettings } from './settings/PrivacySettings';
import { ToggleSwitch } from './settings/ToggleSwitch';

export default function PersonalSettings() {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personal Settings</h1>
          <p className="text-gray-600">Customize your app experience</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={resetPreferences}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
          
          {hasChanges && (
            <button
              onClick={savePreferences}
              disabled={isSaving}
              className="px-4 py-2 bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
            >
              <Save size={16} />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold">Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={preferences.name}
              onChange={(e) => updateBasicSetting('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age
            </label>
            <input
              type="number"
              value={preferences.age}
              onChange={(e) => updateBasicSetting('age', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={preferences.location}
              onChange={(e) => updateBasicSetting('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

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
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Smartphone className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold">App Behavior</h3>
        </div>

        <div className="divide-y divide-gray-100">
          <ToggleSwitch
            enabled={preferences.behavior.autoSave}
            onChange={(value) => updatePreference('behavior', 'autoSave', value)}
            label="Auto Save"
            description="Automatically save your data as you enter it"
          />
          
          <ToggleSwitch
            enabled={preferences.behavior.hapticFeedback}
            onChange={(value) => updatePreference('behavior', 'hapticFeedback', value)}
            label="Haptic Feedback"
            description="Vibrate on button presses and interactions"
          />
          
          <ToggleSwitch
            enabled={preferences.behavior.soundEffects}
            onChange={(value) => updatePreference('behavior', 'soundEffects', value)}
            label="Sound Effects"
            description="Play sounds for notifications and interactions"
          />
          
          <ToggleSwitch
            enabled={preferences.behavior.quickActions}
            onChange={(value) => updatePreference('behavior', 'quickActions', value)}
            label="Quick Actions"
            description="Enable swipe gestures and quick shortcuts"
          />
        </div>
      </div>

      {/* Privacy & Accessibility Settings */}
      <PrivacySettings
        preferences={preferences}
        onUpdatePreference={updatePreference}
      />

      {/* Save Banner */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center space-x-4">
          <span className="text-gray-800">You have unsaved changes</span>
          <div className="flex space-x-2">
            <button
              onClick={resetPreferences}
              className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm"
            >
              Discard
            </button>
            <button
              onClick={savePreferences}
              disabled={isSaving}
              className="px-4 py-1.5 bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50 rounded-md text-sm"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 