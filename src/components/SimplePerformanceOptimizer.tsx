'use client';

import React, { useState, useEffect, useRef } from 'react';

// 简化的懒加载图片组件
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

  return { preloadImage, preloadRoute };
}

// 性能监控面板 (简化版)
export function PerformancePanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [loadTime, setLoadTime] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const startTime = performance.now();
    const handleLoad = () => {
      setLoadTime(performance.now() - startTime);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

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
              <span>页面加载时间:</span>
              <span className={loadTime > 3000 ? 'text-red-500' : 'text-green-500'}>
                {Math.round(loadTime)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>内存使用:</span>
              <span className="text-blue-500">
                {Math.round((performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0)}MB
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 