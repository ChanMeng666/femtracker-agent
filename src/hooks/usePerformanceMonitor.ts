import { useState, useEffect, useCallback } from 'react';
import { PerformanceMetrics } from '@/components/performance/types';

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    fps: 0
  });

  const updateFPS = useCallback((fps: number) => {
    setMetrics(prev => ({ ...prev, fps }));
  }, []);

  const updateLoadMetrics = useCallback((loadTime: number, renderTime: number) => {
    setMetrics(prev => ({ ...prev, loadTime, renderTime }));
  }, []);

  const updateMemoryUsage = useCallback((memoryUsage: number) => {
    setMetrics(prev => ({ ...prev, memoryUsage }));
  }, []);

  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let isActive = true;

    // Get basic performance metrics
    const updateMetrics = () => {
      if (!isActive) return;
      
      const now = performance.now();
      frameCount++;

      if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        frameCount = 0;
        lastTime = now;

        updateFPS(fps);
      }

      animationId = requestAnimationFrame(updateMetrics);
    };

    // Get Web Vitals metrics
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        if (!isActive) return;
        
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            const loadTime = navEntry.loadEventEnd - navEntry.loadEventStart;
            const renderTime = navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart;
            updateLoadMetrics(loadTime, renderTime);
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['navigation'] });
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
      }
    }

    // Memory usage monitoring - only run once
    if ('memory' in performance) {
      try {
        const memoryInfo = (performance as unknown as { memory: { usedJSHeapSize: number } }).memory;
        updateMemoryUsage(Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024));
      } catch (error) {
        console.warn('Memory monitoring not supported:', error);
      }
    }

    updateMetrics();

    return () => {
      isActive = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [updateFPS, updateLoadMetrics, updateMemoryUsage]);

  return metrics;
} 