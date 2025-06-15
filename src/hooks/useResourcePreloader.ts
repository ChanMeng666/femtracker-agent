import { useRef } from 'react';

export function useResourcePreloader() {
  const preloadedResources = useRef(new Set<string>());

  const preloadImage = (src: string) => {
    if (preloadedResources.current.has(src)) return;
    
    const img = new Image();
    img.src = src;
    preloadedResources.current.add(src);
  };

  const preloadRoute = (href: string) => {
    if (preloadedResources.current.has(href)) return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
    preloadedResources.current.add(href);
  };

  const preloadComponent = async (importFunc: () => Promise<unknown>) => {
    try {
      await importFunc();
    } catch (error) {
      console.warn('Failed to preload component:', error);
    }
  };

  return { preloadImage, preloadRoute, preloadComponent };
} 