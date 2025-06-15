import React from 'react';

export interface AccessibilityFeatures {
  announcements: boolean;
  keyboardNavigation: boolean;
  screenReaderOptimized: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

export interface AccessibilityStatus {
  keyboardNavigation: boolean;
  screenReader: boolean;
  colorContrast: boolean;
  textSize: boolean;
}

export interface AccessibilityTooltipProps {
  children: React.ReactNode;
  tooltip: string;
  id: string;
}

export interface AccessibleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface AccessibleInputProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
  disabled?: boolean;
}

export interface AccessibleCardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
  role?: string;
}

export interface NavigationItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

export interface AccessibleNavigationProps {
  items: NavigationItem[];
  currentPath: string;
  ariaLabel?: string;
} 