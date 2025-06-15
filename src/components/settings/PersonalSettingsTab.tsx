import React from 'react';
import { UserProfile } from '@/types/settings';

interface PersonalSettingsTabProps {
  userProfile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

export const PersonalSettingsTab: React.FC<PersonalSettingsTabProps> = ({
  userProfile,
  onUpdateProfile,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Personal Information</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={userProfile.name}
              onChange={(e) => onUpdateProfile({ name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={userProfile.email}
              onChange={(e) => onUpdateProfile({ email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age
            </label>
            <input
              type="number"
              min="18"
              max="100"
              value={userProfile.age}
              onChange={(e) => onUpdateProfile({ age: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={userProfile.language}
              onChange={(e) => onUpdateProfile({ language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="English">English</option>
              <option value="Spanish">Español</option>
              <option value="French">Français</option>
              <option value="German">Deutsch</option>
              <option value="Chinese">中文</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            App Theme
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'light', label: 'Light', description: 'Light theme for daytime use' },
              { value: 'dark', label: 'Dark', description: 'Dark theme for low-light environments' },
              { value: 'auto', label: 'Auto', description: 'Matches your system theme' }
            ].map((theme) => (
              <button
                key={theme.value}
                onClick={() => onUpdateProfile({ theme: theme.value })}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  userProfile.theme === theme.value
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-800 mb-1">{theme.label}</div>
                <div className="text-sm text-gray-600">{theme.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 