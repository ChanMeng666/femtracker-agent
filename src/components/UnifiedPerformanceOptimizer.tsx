'use client';

import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';

// Performance monitoring Hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    fps: 0
  });

  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();
    let frameCount = 0;

    // Get basic performance metrics
    const updateMetrics = () => {
      const now = performance.now();
      frameCount++;

      if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        frameCount = 0;
        lastTime = now;

        setMetrics(prev => ({ ...prev, fps }));
      }

      animationId = requestAnimationFrame(updateMetrics);
    };

    // Get Web Vitals metrics
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            setMetrics(prev => ({
              ...prev,
              loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
              renderTime: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart
            }));
          }
        }
      });

      observer.observe({ entryTypes: ['navigation'] });
    }

    // Memory usage monitoring
    if ('memory' in performance) {
      const memoryInfo = (performance as unknown as { memory: { usedJSHeapSize: number } }).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)
      }));
    }

    updateMetrics();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return metrics;
}

// Lazy loading image component
export function LazyImage({
  src,
  alt,
  className = '',
  placeholder = '/placeholder.svg',
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    console.warn(`Failed to load image: ${src}`);
  };

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imgRef}>
      {!isLoaded && (
        <img
          src={placeholder}
          alt="Loading..."
          className="absolute inset-0 w-full h-full object-cover blur-sm"
        />
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
    </div>
  );
}

// Skeleton screen component
export function ComponentSkeleton({ 
  className = '',
  lines = 3,
  height = 'h-4'
}: { 
  className?: string;
  lines?: number;
  height?: string;
}) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${height} bg-muted rounded ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
      <span className="sr-only">Content loading...</span>
    </div>
  );
}

// Lazy loading component wrapper
export function LazyComponent({ 
  children, 
  fallback,
  threshold = 0.1 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
  threshold?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '100px' }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={ref}>
      {isVisible ? children : (fallback || <ComponentSkeleton />)}
    </div>
  );
}

// Optimized animation component
export function OptimizedAnimation({
  children,
  animation = 'fadeIn',
  duration = 300,
  delay = 0
}: {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'scaleIn';
  duration?: number;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  const animationClasses = {
    fadeIn: isVisible ? 'opacity-100' : 'opacity-0',
    slideUp: isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
    slideDown: isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0',
    scaleIn: isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
  };

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${animationClasses[animation]}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

// Code-split component loader
export function createLazyComponent<T extends Record<string, unknown>>(
  importFunc: () => Promise<{ default: React.ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComp = lazy(importFunc);
  
  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={fallback || <ComponentSkeleton />}>
        <LazyComp {...props} />
      </Suspense>
    );
  };
}

// Resource preloader Hook
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

// Virtual scrolling component
export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = ''
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
    setIsScrolling(true);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      aria-label="Virtual list"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={visibleStart + index} style={{ height: itemHeight }}>
              {renderItem(item, visibleStart + index)}
            </div>
          ))}
        </div>
        {isScrolling && (
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            Scrolling...
          </div>
        )}
      </div>
    </div>
  );
}

// Memory optimization Hook
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

// Performance monitoring panel
export function PerformancePanel() {
  const metrics = usePerformanceMonitor();
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development environment
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-yellow-500 text-white p-2 rounded-full shadow-lg hover:bg-yellow-600 transition-colors"
        title="Performance monitoring panel"
        aria-label="Performance monitoring panel"
      >
        📊
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border min-w-64">
          <h4 className="font-semibold mb-2">Performance metrics</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>FCP:</span>
              <span className={metrics.loadTime > 1800 ? 'text-red-500' : 'text-green-500'}>
                {Math.round(metrics.loadTime)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>LCP:</span>
              <span className={metrics.renderTime > 2500 ? 'text-red-500' : 'text-green-500'}>
                {Math.round(metrics.renderTime)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>FID:</span>
              <span className={metrics.memoryUsage > 100 ? 'text-red-500' : 'text-green-500'}>
                {Math.round(metrics.memoryUsage)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>FPS:</span>
              <span className={metrics.fps < 60 ? 'text-red-500' : 'text-green-500'}>
                {Math.round(metrics.fps)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Memory usage:</span>
              <span className="text-blue-500">N/A</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 