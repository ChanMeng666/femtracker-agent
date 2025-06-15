import { Moon, Sun, Monitor, User, Download, Bell, Eye, Shield, Info } from 'lucide-react';
import type { UserPreferences, ThemeOption, ColorOption, FontSizeOption } from '../types/settings';
import { SettingTabItem } from '@/types/settings';

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
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
  language: 'en-US',
  timezone: 'America/New_York',
  dateFormat: 'MM/dd/yyyy',
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

export const THEME_OPTIONS: ThemeOption[] = [
  { value: 'light', label: 'Light Mode', icon: Sun },
  { value: 'dark', label: 'Dark Mode', icon: Moon },
  { value: 'auto', label: 'Follow System', icon: Monitor }
];

export const COLOR_OPTIONS: ColorOption[] = [
  { value: '#ec4899', label: 'Pink', color: 'bg-pink-500' },
  { value: '#3b82f6', label: 'Blue', color: 'bg-blue-500' },
  { value: '#10b981', label: 'Green', color: 'bg-emerald-500' },
  { value: '#f59e0b', label: 'Orange', color: 'bg-amber-500' },
  { value: '#8b5cf6', label: 'Purple', color: 'bg-violet-500' },
  { value: '#ef4444', label: 'Red', color: 'bg-red-500' }
];

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { value: 'small', label: 'Small', size: 'text-sm' },
  { value: 'medium', label: 'Medium', size: 'text-base' },
  { value: 'large', label: 'Large', size: 'text-lg' }
];

export const settingTabs: SettingTabItem[] = [
  {
    id: 'personal',
    name: 'Personal Settings',
    description: 'Personal info, themes, app behavior',
    icon: User,
    color: 'text-blue-600'
  },
  {
    id: 'data',
    name: 'Data Management',
    description: 'Data import/export, backup recovery',
    icon: Download,
    color: 'text-green-600'
  },
  {
    id: 'notifications',
    name: 'Notification Settings',
    description: 'Push notifications, reminder settings',
    icon: Bell,
    color: 'text-yellow-600'
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    description: 'Accessibility features, visual aids',
    icon: Eye,
    color: 'text-purple-600'
  },
  {
    id: 'privacy',
    name: 'Privacy & Security',
    description: 'Data privacy, security settings',
    icon: Shield,
    color: 'text-red-600'
  },
  {
    id: 'about',
    name: 'About App',
    description: 'Version info, help & support',
    icon: Info,
    color: 'text-gray-600'
  }
]; 