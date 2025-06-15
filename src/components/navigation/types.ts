import React from 'react';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

export interface MobileNavigationProps {
  navItems: NavItem[];
  moreItems: NavItem[];
}

export interface MoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavItem[];
  currentPath: string;
  onNavClick: (href: string) => void;
}

export interface NavigationBarProps {
  items: NavItem[];
  currentPath: string;
  showMore: boolean;
  isVisible: boolean;
  onNavClick: (href: string) => void;
}

export interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
  showMore?: boolean;
  onNavClick: (href: string) => void;
} 