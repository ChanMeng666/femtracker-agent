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
  name: '用户',
  age: 25,
  location: '北京',
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
  { value: 'light', label: '浅色模式', icon: Sun },
  { value: 'dark', label: '深色模式', icon: Moon },
  { value: 'auto', label: '跟随系统', icon: Monitor }
];

const colorOptions = [
  { value: '#ec4899', label: '粉色', color: 'bg-pink-500' },
  { value: '#3b82f6', label: '蓝色', color: 'bg-blue-500' },
  { value: '#10b981', label: '绿色', color: 'bg-emerald-500' },
  { value: '#f59e0b', label: '橙色', color: 'bg-amber-500' },
  { value: '#8b5cf6', label: '紫色', color: 'bg-violet-500' },
  { value: '#ef4444', label: '红色', color: 'bg-red-500' }
];

const fontSizeOptions = [
  { value: 'small', label: '小', size: 'text-sm' },
  { value: 'medium', label: '中', size: 'text-base' },
  { value: 'large', label: '大', size: 'text-lg' }
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
          <h3 className="text-lg font-semibold">个人信息</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">姓名</label>
            <input
              type="text"
              value={preferences.name}
              onChange={(e) => updateBasicSetting('name', e.target.value)}
              className="mobile-input w-full"
              placeholder="请输入您的姓名"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">年龄</label>
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
              <label className="block text-sm font-medium mb-2">所在地</label>
              <input
                type="text"
                value={preferences.location}
                onChange={(e) => updateBasicSetting('location', e.target.value)}
                className="mobile-input w-full"
                placeholder="城市"
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
          <h3 className="text-lg font-semibold">主题和外观</h3>
        </div>

        <div className="space-y-4">
          {/* 主题模式 */}
          <div>
            <p className="text-sm font-medium mb-2">主题模式</p>
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
            <p className="text-sm font-medium mb-2">主色调</p>
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
            <p className="text-sm font-medium mb-2">字体大小</p>
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
          <h3 className="text-lg font-semibold">通知设置</h3>
        </div>

        <div className="divide-y divide-border/50">
          <ToggleSwitch
            enabled={preferences.notifications.cycleReminders}
            onChange={(value) => updatePreference('notifications', 'cycleReminders', value)}
            label="周期提醒"
            description="月经期和排卵期提醒"
          />
          <ToggleSwitch
            enabled={preferences.notifications.healthTips}
            onChange={(value) => updatePreference('notifications', 'healthTips', value)}
            label="健康建议"
            description="个性化健康建议推送"
          />
          <ToggleSwitch
            enabled={preferences.notifications.dataBackup}
            onChange={(value) => updatePreference('notifications', 'dataBackup', value)}
            label="数据备份提醒"
            description="定期备份数据提醒"
          />
          <ToggleSwitch
            enabled={preferences.notifications.appUpdates}
            onChange={(value) => updatePreference('notifications', 'appUpdates', value)}
            label="应用更新"
            description="新版本发布通知"
          />
        </div>
      </div>

      {/* 辅助功能 */}
      <div className="mobile-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Eye className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold">辅助功能</h3>
        </div>

        <div className="divide-y divide-border/50">
          <ToggleSwitch
            enabled={preferences.accessibility.highContrast}
            onChange={(value) => updatePreference('accessibility', 'highContrast', value)}
            label="高对比度"
            description="提高界面对比度，便于视力不佳用户使用"
          />
          <ToggleSwitch
            enabled={preferences.accessibility.reduceMotion}
            onChange={(value) => updatePreference('accessibility', 'reduceMotion', value)}
            label="减少动画"
            description="减少界面动画效果"
          />
          <ToggleSwitch
            enabled={preferences.accessibility.largeButtons}
            onChange={(value) => updatePreference('accessibility', 'largeButtons', value)}
            label="大按钮"
            description="使用更大的触摸按钮"
          />
        </div>
      </div>

      {/* 应用行为 */}
      <div className="mobile-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Smartphone className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold">应用行为</h3>
        </div>

        <div className="divide-y divide-border/50">
          <ToggleSwitch
            enabled={preferences.behavior.autoSave}
            onChange={(value) => updatePreference('behavior', 'autoSave', value)}
            label="自动保存"
            description="自动保存输入的数据"
          />
          <ToggleSwitch
            enabled={preferences.behavior.hapticFeedback}
            onChange={(value) => updatePreference('behavior', 'hapticFeedback', value)}
            label="触觉反馈"
            description="点击时的震动反馈"
          />
          <ToggleSwitch
            enabled={preferences.behavior.soundEffects}
            onChange={(value) => updatePreference('behavior', 'soundEffects', value)}
            label="音效"
            description="操作音效反馈"
          />
          <ToggleSwitch
            enabled={preferences.behavior.quickActions}
            onChange={(value) => updatePreference('behavior', 'quickActions', value)}
            label="快捷操作"
            description="显示快捷操作按钮"
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
              重置
            </button>
            
            <button
              onClick={savePreferences}
              disabled={isSaving}
              className="flex-1 touch-button bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Settings size={18} className="animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save size={18} />
                  保存设置
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 