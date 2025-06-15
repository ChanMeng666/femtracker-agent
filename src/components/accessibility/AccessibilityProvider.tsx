import React from 'react';
import { useAccessibilityFeatures } from '@/hooks/useAccessibilityFeatures';
import { LiveRegion } from './LiveRegion';
import { SkipLinks } from './SkipLinks';

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  // Initialize accessibility features
  useAccessibilityFeatures();

  return (
    <div className="accessibility-enhanced">
      {children}
      <LiveRegion />
      <SkipLinks />
    </div>
  );
} 