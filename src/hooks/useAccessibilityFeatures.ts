import { useState, useEffect } from 'react';
import { AccessibilityFeatures } from '@/components/accessibility/types';

export function useAccessibilityFeatures() {
  const [features, setFeatures] = useState<AccessibilityFeatures>({
    announcements: false,
    keyboardNavigation: false,
    screenReaderOptimized: false,
    highContrast: false,
    reducedMotion: false
  });

  useEffect(() => {
    // Detect system preference settings
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setFeatures(prev => ({
      ...prev,
      reducedMotion: mediaQuery.matches
    }));

    const handleChange = (e: MediaQueryListEvent) => {
      setFeatures(prev => ({
        ...prev,
        reducedMotion: e.matches
      }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Apply accessibility styles
    const root = document.documentElement;
    
    if (features.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (features.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }, [features.highContrast, features.reducedMotion]);

  return { features, setFeatures };
} 