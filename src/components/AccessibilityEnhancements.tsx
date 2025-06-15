'use client';

// Re-export all accessibility components and hooks
export {
  useAccessibilityFeatures,
  useAccessibilityStatus,
  AccessibilityProvider,
  LiveRegion,
  SkipLinks,
  AccessibilityTooltip,
  AccessibleButton,
  AccessibleInput,
  AccessibleCard,
  AccessibleNavigation,
  AccessibilityStatus,
  announce
} from './accessibility';

export type {
  AccessibilityFeatures,
  AccessibilityStatusType,
  AccessibilityTooltipProps,
  AccessibleButtonProps,
  AccessibleInputProps,
  AccessibleCardProps,
  NavigationItem,
  AccessibleNavigationProps
} from './accessibility'; 