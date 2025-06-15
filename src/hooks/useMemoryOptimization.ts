import { useRef, useEffect } from 'react';

export function useMemoryOptimization() {
  const cleanupFunctions = useRef<(() => void)[]>([]);

  const addCleanup = (fn: () => void) => {
    cleanupFunctions.current.push(fn);
  };

  // Clear image cache
  const clearImageCache = () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.src.startsWith('blob:')) {
        URL.revokeObjectURL(img.src);
      }
    });
  };

  const optimizeMemory = () => {
    // Run garbage collection if available
    if ('gc' in window && typeof (window as unknown as { gc?: () => void }).gc === 'function') {
      (window as unknown as { gc: () => void }).gc();
    }

    // Clear image cache
    clearImageCache();

    // Run cleanup functions
    cleanupFunctions.current.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.warn('Cleanup function failed:', error);
      }
    });
  };

  useEffect(() => {
    return () => {
      optimizeMemory();
    };
  }, []);

  return { addCleanup, optimizeMemory, clearImageCache };
} 