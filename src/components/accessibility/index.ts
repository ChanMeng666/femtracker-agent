// Hooks
export { useAccessibilityFeatures } from '@/hooks/useAccessibilityFeatures';
export { useAccessibilityStatus } from '@/hooks/useAccessibilityStatus';

// Components
export { AccessibilityProvider } from './AccessibilityProvider';
export { LiveRegion } from './LiveRegion';
export { SkipLinks } from './SkipLinks';
export { AccessibilityTooltip } from './AccessibilityTooltip';
export { AccessibleButton } from './AccessibleButton';
export { AccessibleInput } from './AccessibleInput';
export { AccessibleCard } from './AccessibleCard';
export { AccessibleNavigation } from './AccessibleNavigation';
export { AccessibilityStatus } from './AccessibilityStatus';

// Utilities
export { announce } from '@/utils/accessibility-announcer';

// Types
export type {
  AccessibilityFeatures,
  AccessibilityStatus as AccessibilityStatusType,
  AccessibilityTooltipProps,
  AccessibleButtonProps,
  AccessibleInputProps,
  AccessibleCardProps,
  NavigationItem,
  AccessibleNavigationProps
} from './types'; 