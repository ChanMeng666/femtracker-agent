import React from 'react';
import Link from "next/link";
import { useSettingsWithDB } from '@/hooks/useSettingsWithDB';
import { SettingsNavigation } from './SettingsNavigation';
import { PersonalSettingsTab } from './PersonalSettingsTab';
import { NotificationSettingsTab } from './NotificationSettingsTab';

export const SettingsContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    userProfile,
    setUserProfile,
    notificationSettings,
    setNotificationSettings,
    currentTab,
    loading,
  } = useSettingsWithDB();

  const handleUpdateProfile = async (updates: Partial<typeof userProfile>) => {
    await setUserProfile(updates);
  };

  const handleUpdateNotifications = async (updates: Partial<typeof notificationSettings>) => {
    await setNotificationSettings(updates);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <PersonalSettingsTab
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      case 'notifications':
        return (
          <NotificationSettingsTab
            notificationSettings={notificationSettings}
            onUpdateSettings={handleUpdateNotifications}
          />
        );
      case 'data':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Data Management</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-800 mb-2">📥 Export Data</h3>
                <p className="text-sm text-gray-600 mb-4">Download all your health data in JSON format</p>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Export Data
                </button>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-800 mb-2">📤 Import Data</h3>
                <p className="text-sm text-gray-600 mb-4">Import previously exported data</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Import Data
                </button>
              </div>
            </div>
          </div>
        );
      case 'accessibility':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Accessibility</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-800 mb-2">👁️ Visual Accessibility</h3>
                <p className="text-sm text-gray-600">High contrast mode, large text, and other visual aids</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-800 mb-2">🔊 Audio Features</h3>
                <p className="text-sm text-gray-600">Voice guidance and audio feedback options</p>
              </div>
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Privacy & Security</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-800 mb-2">🔒 Data Privacy</h3>
                <p className="text-sm text-gray-600">Your health data is encrypted and stored securely</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-800 mb-2">🛡️ Security Features</h3>
                <p className="text-sm text-gray-600">Biometric lock and automatic backup settings</p>
              </div>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">About FemTracker</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-800 mb-2">📱 App Version</h3>
                <p className="text-sm text-gray-600">FemTracker v2.1.0</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-800 mb-2">🆘 Help & Support</h3>
                <p className="text-sm text-gray-600">Get help with using the app and contact support</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-800 mb-2">📄 Legal Information</h3>
                <p className="text-sm text-gray-600">Terms of service, privacy policy, and licenses</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Navigation */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                                  ← Home
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  ⚙️ Settings
                </h1>
                <p className="text-sm text-gray-600">
                  {currentTab ? currentTab.description : 'Manage your app preferences and account'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {userProfile.name}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Navigation Sidebar */}
              <div className="lg:col-span-1">
                <SettingsNavigation
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </div>

              {/* Content Area */}
              <div className="lg:col-span-3">
                {renderTabContent()}
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}; 