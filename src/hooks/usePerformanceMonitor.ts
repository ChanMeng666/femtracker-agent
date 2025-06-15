import { useState, useEffect } from 'react';
import { PerformanceMetrics } from '@/components/performance/types';

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
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