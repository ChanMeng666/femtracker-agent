import { useState, useEffect } from 'react';
import { AccessibilityStatus } from '@/components/accessibility/types';

export function useAccessibilityStatus() {
  const [status, setStatus] = useState<AccessibilityStatus>({
    keyboardNavigation: false,
    screenReader: false,
    colorContrast: false,
    textSize: false
  });

  useEffect(() => {
    // Check various accessibility features
    const checkAccessibility = () => {
      setStatus({
        keyboardNavigation: document.activeElement !== document.body,
        screenReader: 'speechSynthesis' in window,
        colorContrast: window.matchMedia('(prefers-contrast: high)').matches,
        textSize: window.matchMedia('(prefers-contrast: high)').matches
      });
    };

    checkAccessibility();
    window.addEventListener('focus', checkAccessibility);
    return () => window.removeEventListener('focus', checkAccessibility);
  }, []);

  return status;
} 