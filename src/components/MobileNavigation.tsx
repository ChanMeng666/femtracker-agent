'use client';

import { MobileNavigationLayout } from './navigation/MobileNavigationLayout';

// Re-export all navigation components and hooks
export {
  NavButton,
  NavigationBar,
  MoreModal,
  MobileNavigationLayout,
  useMobileNavigation,
  useIsMobile,
  useHapticFeedback,
  navItems,
  moreItems
} from './navigation';

export type {
  NavItem,
  MobileNavigationProps,
  MoreModalProps,
  NavigationBarProps,
  NavButtonProps
} from './navigation';

// Main component for backwards compatibility
export default function MobileNavigation() {
  return <MobileNavigationLayout />;
}