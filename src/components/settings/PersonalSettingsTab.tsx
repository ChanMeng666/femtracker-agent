import React, { useState } from 'react';
import { UserProfile } from '@/types/settings';
import { Upload, Image } from 'lucide-react';
import { blobClient, BlobClient } from '@/lib/blob/client';
import { useAuth } from '@/hooks/auth/useAuth';

interface PersonalSettingsTabProps {
  userProfile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export const PersonalSettingsTab: React.FC<PersonalSettingsTabProps> = ({
  userProfile,
  onUpdateProfile,
}) => {
  const { user } = useAuth();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>(userProfile.avatarUrl || '');

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // 验证文件类型
    if (!BlobClient.isValidFileType(file)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    // 验证文件大小 (10MB限制)
    if (file.size > 10 * 1024 * 1024) {
      alert(`File too large. Maximum size is 10MB. Your file is ${BlobClient.formatFileSize(file.size)}`);
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // 上传头像到Vercel Blob
      const result = await blobClient.uploadAvatar(file, user.id);

      if (result.success && result.blob) {
        setAvatarPreview(result.blob.url);
        // 保存头像URL到数据库
        await onUpdateProfile({ avatarUrl: result.blob.url });
        console.log('Avatar uploaded successfully:', result.blob.url);
      } else {
        alert(`Avatar upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      alert('Avatar upload failed. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Personal Information</h2>
      
      <div className="space-y-6">
        {/* Avatar Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>
          <div className="flex items-center gap-4">
            <div className="relative">
                             {avatarPreview ? (
                 // eslint-disable-next-line @next/next/no-img-element
                 <img
                   src={avatarPreview}
                   alt="Profile picture preview"
                   className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                 />
               ) : (
                 <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200" role="img" aria-label="Default avatar placeholder">
                   <Image className="w-8 h-8 text-gray-400" />
                 </div>
               )}
              {isUploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                id="avatar-upload-tab"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={isUploadingAvatar}
              />
              <label
                htmlFor="avatar-upload-tab"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors ${
                  isUploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="w-4 h-4" />
                {isUploadingAvatar ? 'Uploading...' : 'Upload Photo'}
              </label>
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG, GIF up to 10MB
              </p>
            </div>
          </div>
        </div>

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