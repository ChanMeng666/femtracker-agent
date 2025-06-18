import { User, Upload, Image } from 'lucide-react';
import { useState } from 'react';
import type { UserPreferences } from '@/types/settings';
import { blobClient, BlobClient } from '@/lib/blob/client';
import { useAuth } from '@/hooks/auth/useAuth';

interface PersonalInformationProps {
  preferences: {
    name: string;
    age: number;
    location: string;
    avatarUrl?: string;
  };
  onUpdateBasicSetting: <T extends keyof UserPreferences>(key: T, value: UserPreferences[T]) => void;
}

export function PersonalInformation({ preferences, onUpdateBasicSetting }: PersonalInformationProps) {
  const { user } = useAuth();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>(preferences.avatarUrl || '');

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
        onUpdateBasicSetting('avatarUrl', result.blob.url);
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
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold">Personal Information</h3>
      </div>

      {/* Avatar Upload Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Picture
        </label>
        <div className="flex items-center gap-4">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
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
              id="avatar-upload"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              disabled={isUploadingAvatar}
            />
            <label
              htmlFor="avatar-upload"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            value={preferences.name}
            onChange={(e) => onUpdateBasicSetting('name', e.target.value)}
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
            onChange={(e) => onUpdateBasicSetting('age', parseInt(e.target.value) || 0)}
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
            onChange={(e) => onUpdateBasicSetting('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
} 