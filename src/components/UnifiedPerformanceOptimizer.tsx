'use client';

import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';

// 性能监控Hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
    loadTime: 0
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    const startTime = performance.now();

    // 获取基本性能指标
    const handleLoad = () => {
      setMetrics(prev => ({
        ...prev,
        loadTime: performance.now() - startTime
      }));
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    // 获取Web Vitals指标
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint') {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({ ...prev, firstContentfulPaint: entry.startTime }));
          }
        }
        if (entry.entryType === 'largest-contentful-paint') {
          setMetrics(prev => ({ ...prev, largestContentfulPaint: entry.startTime }));
        }
        if (entry.entryType === 'first-input') {
          const firstInputEntry = entry as PerformanceEntry & { processingStart: number };
          setMetrics(prev => ({ 
            ...prev, 
            firstInputDelay: firstInputEntry.processingStart - firstInputEntry.startTime 
          }));
        }
        if (entry.entryType === 'layout-shift') {
          const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!layoutShiftEntry.hadRecentInput) {
            setMetrics(prev => ({ 
              ...prev, 
              cumulativeLayoutShift: prev.cumulativeLayoutShift + layoutShiftEntry.value 
            }));
          }
        }
      }
    });

    try {
      observer.observe({ 
        entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] 
      });
    } catch (error) {
      console.warn('Performance observer not supported:', error);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  return metrics;
}

// 懒加载图片组件
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
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imgRef}>
      {isInView && (
        <>
          <img
            src={placeholder}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-0' : 'opacity-100'
            }`}
            aria-hidden="true"
          />
          <img
            src={src}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsLoaded(true)}
            loading="lazy"
            {...props}
          />
        </>
      )}
    </div>
  );
}

// 骨架屏组件
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
    <div className={`animate-pulse space-y-3 ${className}`} role="status" aria-label="加载中">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${height} bg-muted rounded ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
      <span className="sr-only">内容加载中...</span>
    </div>
  );
}

// 懒加载组件包装器
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

// 优化的动画组件
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
    // 检查用户是否偏好减少动画
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

// 代码分割的组件加载器
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

// 资源预加载Hook
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

// 虚拟滚动组件
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
      role="listbox"
      aria-label="虚拟列表"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={visibleStart + index}
              style={{ height: itemHeight }}
              role="option"
            >
              {renderItem(item, visibleStart + index)}
            </div>
          ))}
        </div>
      </div>
      {isScrolling && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-sm">
          滚动中...
        </div>
      )}
    </div>
  );
}

// 内存优化Hook
export function useMemoryOptimization() {
  const cleanup = useRef<(() => void)[]>([]);

  const addCleanup = (fn: () => void) => {
    cleanup.current.push(fn);
  };

  const clearImageCache = () => {
    // 清理图片缓存
    const images = document.querySelectorAll('img[data-cached]');
    images.forEach(img => {
      if (img instanceof HTMLImageElement) {
        img.src = '';
        img.removeAttribute('data-cached');
      }
    });
  };

  const optimizeMemory = () => {
    // 强制垃圾回收 (仅在支持的浏览器中)
    if ('gc' in window && typeof window.gc === 'function') {
      window.gc();
    }
    
    // 清理不可见的DOM元素
    const hiddenElements = document.querySelectorAll('[style*="display: none"]');
    hiddenElements.forEach(el => {
      if (el.getAttribute('data-keep') !== 'true') {
        el.remove();
      }
    });
  };

  useEffect(() => {
    return () => {
      cleanup.current.forEach(fn => fn());
      cleanup.current = [];
    };
  }, []);

  return { addCleanup, clearImageCache, optimizeMemory };
}

// 性能监控面板
export function PerformancePanel() {
  const metrics = usePerformanceMonitor();
  const [isVisible, setIsVisible] = useState(false);

  // 只在开发环境显示
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-yellow-500 text-white p-2 rounded-full shadow-lg hover:bg-yellow-600 transition-colors"
        title="性能监控面板"
        aria-label="性能监控面板"
      >
        📊
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border min-w-64">
          <h4 className="font-semibold mb-2">性能指标</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>FCP:</span>
              <span className={metrics.firstContentfulPaint > 1800 ? 'text-red-500' : 'text-green-500'}>
                {Math.round(metrics.firstContentfulPaint)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>LCP:</span>
              <span className={metrics.largestContentfulPaint > 2500 ? 'text-red-500' : 'text-green-500'}>
                {Math.round(metrics.largestContentfulPaint)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>FID:</span>
              <span className={metrics.firstInputDelay > 100 ? 'text-red-500' : 'text-green-500'}>
                {Math.round(metrics.firstInputDelay)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>CLS:</span>
              <span className={metrics.cumulativeLayoutShift > 0.1 ? 'text-red-500' : 'text-green-500'}>
                {metrics.cumulativeLayoutShift.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>页面加载:</span>
              <span className={metrics.loadTime > 3000 ? 'text-red-500' : 'text-green-500'}>
                {Math.round(metrics.loadTime)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>内存使用:</span>
              <span className="text-blue-500">N/A</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 