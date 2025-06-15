export interface UserPreferences {
  // Personal Information
  name: string;
  age: number;
  location: string;
  
  // Theme Settings
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  
  // Notification Settings
  notifications: {
    cycleReminders: boolean;
    healthTips: boolean;
    dataBackup: boolean;
    appUpdates: boolean;
  };
  
  // Language and Region
  language: 'zh-CN' | 'en-US';
  timezone: string;
  dateFormat: 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd';
  
  // Privacy Settings
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
    crashReports: boolean;
  };
  
  // Accessibility Features
  accessibility: {
    highContrast: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
    largeButtons: boolean;
  };
  
  // App Behavior
  behavior: {
    autoSave: boolean;
    hapticFeedback: boolean;
    soundEffects: boolean;
    quickActions: boolean;
  };
}

export interface ThemeOption {
  value: 'light' | 'dark' | 'auto';
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export interface ColorOption {
  value: string;
  label: string;
  color: string;
}

export interface FontSizeOption {
  value: 'small' | 'medium' | 'large';
  label: string;
  size: string;
} 