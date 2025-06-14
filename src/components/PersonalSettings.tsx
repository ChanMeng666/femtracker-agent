'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Palette, 
  Bell, 
  Globe, 
  Eye,
  Moon,
  Sun,
  Smartphone,
  Monitor,
  Volume2,
  VolumeX,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Save,
  RotateCcw
} from 'lucide-react';

interface UserPreferences {
  // 个人信息
  name: string;
  age: number;
  location: string;
  
  // 主题设置
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  
  // 通知设置
  notifications: {
    cycleReminders: boolean;
    healthTips: boolean;
    dataBackup: boolean;
    appUpdates: boolean;
  };
  
  // 语言和地区
  language: 'zh-CN' | 'en-US';
  timezone: string;
  dateFormat: 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd';
  
  // 隐私设置
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
    crashReports: boolean;
  };
  
  // 辅助功能
  accessibility: {
    highContrast: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
    largeButtons: boolean;
  };
  
  // 应用行为
  behavior: {
    autoSave: boolean;
    hapticFeedback: boolean;
    soundEffects: boolean;
    quickActions: boolean;
  };
}

const defaultPreferences: UserPreferences = {
  name: 'User',
  age: 25,
  location: 'New York',
  theme: 'auto',
  primaryColor: '#ec4899',
  fontSize: 'medium',
  notifications: {
    cycleReminders: true,
    healthTips: true,
    dataBackup: false,
    appUpdates: true
  },
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
  dateFormat: 'yyyy-MM-dd',
  privacy: {
    dataCollection: true,
    analytics: false,
    crashReports: true
  },
  accessibility: {
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
    largeButtons: false
  },
  behavior: {
    autoSave: true,
    hapticFeedback: true,
    soundEffects: false,
    quickActions: true
  }
};

const themeOptions = [
  { value: 'light', label: 'Light Mode', icon: Sun },
  { value: 'dark', label: 'Dark Mode', icon: Moon },
  { value: 'auto', label: 'Follow System', icon: Monitor }
];

const colorOptions = [
  { value: '#ec4899', label: 'Pink', color: 'bg-pink-500' },
  { value: '#3b82f6', label: 'Blue', color: 'bg-blue-500' },
  { value: '#10b981', label: 'Green', color: 'bg-emerald-500' },
  { value: '#f59e0b', label: 'Orange', color: 'bg-amber-500' },
  { value: '#8b5cf6', label: 'Purple', color: 'bg-violet-500' },
  { value: '#ef4444', label: 'Red', color: 'bg-red-500' }
];

const fontSizeOptions = [
  { value: 'small', label: 'Small', size: 'text-sm' },
  { value: 'medium', label: 'Medium', size: 'text-base' },
  { value: 'large', label: 'Large', size: 'text-lg' }
];

export default function PersonalSettings() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 从本地存储加载设置
  useEffect(() => {
    const savedPreferences = localStorage.getItem('femtracker-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences({ ...defaultPreferences, ...parsed });
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    }
  }, []);

  // 检测设置变化
  useEffect(() => {
    const savedPreferences = localStorage.getItem('femtracker-preferences');
    const currentPreferences = JSON.stringify(preferences);
    const savedString = savedPreferences || JSON.stringify(defaultPreferences);
    setHasChanges(currentPreferences !== savedString);
  }, [preferences]);

  // 更新设置
  const updatePreference = <T extends keyof UserPreferences>(
    section: T,
    key: keyof UserPreferences[T],
    value: UserPreferences[T][keyof UserPreferences[T]]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  // 更新基本设置
  const updateBasicSetting = <T extends keyof UserPreferences>(
    key: T,
    value: UserPreferences[T]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 保存设置
  const savePreferences = async () => {
    setIsSaving(true);
    try {
      // 模拟保存延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('femtracker-preferences', JSON.stringify(preferences));
      setHasChanges(false);
      
      // 应用主题设置
      if (preferences.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (preferences.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // 跟随系统
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 重置设置
  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  // 切换开关组件
  const ToggleSwitch = ({ 
    enabled, 
    onChange, 
    label,
    description 
  }: { 
    enabled: boolean; 
    onChange: (value: boolean) => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className="ml-4 touch-button p-1"
      >
        {enabled ? (
          <ToggleRight className="w-6 h-6 text-primary" />
        ) : (
          <ToggleLeft className="w-6 h-6 text-muted-foreground" />
        )}
      </button>
    </div>
  );

  // 设置项组件
  const SettingItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onClick,
    rightElement 
  }: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    title: string;
    subtitle?: string;
    onClick?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors text-left"
    >
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon size={20} className="text-primary" />
      </div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {rightElement || <ChevronRight size={20} className="text-muted-foreground" />}
    </button>
  );

  return (
    <div className="space-y-6 pb-20">
      {/* 个人信息 */}
      <div className="mobile-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold">Personal Information</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={preferences.name}
              onChange={(e) => updateBasicSetting('name', e.target.value)}
              className="mobile-input w-full"
              placeholder="Enter your name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Age</label>
              <input
                type="number"
                value={preferences.age}
                onChange={(e) => updateBasicSetting('age', parseInt(e.target.value) || 25)}
                className="mobile-input w-full"
                min="13"
                max="100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={preferences.location}
                onChange={(e) => updateBasicSetting('location', e.target.value)}
                className="mobile-input w-full"
                placeholder="City"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 主题和外观 */}
      <div className="mobile-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Palette className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold">Theme and Appearance</h3>
        </div>

        <div className="space-y-4">
          {/* 主题模式 */}
          <div>
            <p className="text-sm font-medium mb-2">Theme Mode</p>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => updateBasicSetting('theme', value as UserPreferences['theme'])}
                  className={`
                    flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
                    ${preferences.theme === value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 主色调 */}
          <div>
            <p className="text-sm font-medium mb-2">Primary Color</p>
            <div className="grid grid-cols-6 gap-2">
              {colorOptions.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => updateBasicSetting('primaryColor', value)}
                  className={`
                    w-12 h-12 rounded-lg ${color} transition-all
                    ${preferences.primaryColor === value 
                      ? 'ring-2 ring-offset-2 ring-primary' 
                      : 'hover:scale-110'
                    }
                  `}
                  title={label}
                />
              ))}
            </div>
          </div>

          {/* 字体大小 */}
          <div>
            <p className="text-sm font-medium mb-2">Font Size</p>
            <div className="grid grid-cols-3 gap-2">
              {fontSizeOptions.map(({ value, label, size }) => (
                <button
                  key={value}
                  onClick={() => updateBasicSetting('fontSize', value as UserPreferences['fontSize'])}
                  className={`
                    p-3 rounded-lg border-2 transition-all ${size}
                    ${preferences.fontSize === value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 通知设置 */}
      <div className="mobile-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Bell className="w-5 h-5 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold">Notification Settings</h3>
        </div>

        <div className="divide-y divide-border/50">
          <ToggleSwitch
            enabled={preferences.notifications.cycleReminders}
            onChange={(value) => updatePreference('notifications', 'cycleReminders', value)}
            label="Cycle Reminders"
            description="Menstrual period and ovulation reminders"
          />
          <ToggleSwitch
            enabled={preferences.notifications.healthTips}
            onChange={(value) => updatePreference('notifications', 'healthTips', value)}
            label="Health Advice"
            description="Personalized health advice notifications"
          />
          <ToggleSwitch
            enabled={preferences.notifications.dataBackup}
            onChange={(value) => updatePreference('notifications', 'dataBackup', value)}
            label="Data Backup Reminders"
            description="Regular data backup notifications"
          />
          <ToggleSwitch
            enabled={preferences.notifications.appUpdates}
            onChange={(value) => updatePreference('notifications', 'appUpdates', value)}
            label="App Updates"
            description="New version release notifications"
          />
        </div>
      </div>

      {/* 辅助功能 */}
      <div className="mobile-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Eye className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold">Accessibility</h3>
        </div>

        <div className="divide-y divide-border/50">
          <ToggleSwitch
            enabled={preferences.accessibility.highContrast}
            onChange={(value) => updatePreference('accessibility', 'highContrast', value)}
            label="High Contrast"
            description="Improve interface contrast for users with visual impairments"
          />
          <ToggleSwitch
            enabled={preferences.accessibility.reduceMotion}
            onChange={(value) => updatePreference('accessibility', 'reduceMotion', value)}
            label="Reduce Animations"
            description="Reduce interface animation effects"
          />
          <ToggleSwitch
            enabled={preferences.accessibility.largeButtons}
            onChange={(value) => updatePreference('accessibility', 'largeButtons', value)}
            label="Large Buttons"
            description="Use larger touch buttons"
          />
        </div>
      </div>

      {/* 应用行为 */}
      <div className="mobile-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Smartphone className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold">App Behavior</h3>
        </div>

        <div className="divide-y divide-border/50">
          <ToggleSwitch
            enabled={preferences.behavior.autoSave}
            onChange={(value) => updatePreference('behavior', 'autoSave', value)}
            label="Auto Save"
            description="Automatically save entered data"
          />
          <ToggleSwitch
            enabled={preferences.behavior.hapticFeedback}
            onChange={(value) => updatePreference('behavior', 'hapticFeedback', value)}
            label="Haptic Feedback"
            description="Vibration feedback for interactions"
          />
          <ToggleSwitch
            enabled={preferences.behavior.soundEffects}
            onChange={(value) => updatePreference('behavior', 'soundEffects', value)}
            label="Sound Effects"
            description="Interface sound effects"
          />
          <ToggleSwitch
            enabled={preferences.behavior.quickActions}
            onChange={(value) => updatePreference('behavior', 'quickActions', value)}
            label="Quick Actions"
            description="Display quick action buttons"
          />
        </div>
      </div>

      {/* 保存按钮 */}
      {hasChanges && (
        <div className="sticky bottom-24 left-0 right-0 px-4">
          <div className="flex gap-3">
            <button
              onClick={resetPreferences}
              className="flex-1 touch-button bg-muted text-muted-foreground hover:bg-muted/80 flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              Reset
            </button>
            
            <button
              onClick={savePreferences}
              disabled={isSaving}
              className="flex-1 touch-button bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Settings size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 