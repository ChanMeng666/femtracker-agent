import { useState } from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

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
              <span>Memory:</span>
              <span className={metrics.memoryUsage > 100 ? 'text-red-500' : 'text-green-500'}>
                {Math.round(metrics.memoryUsage)}MB
              </span>
            </div>
            <div className="flex justify-between">
              <span>FPS:</span>
              <span className={metrics.fps < 60 ? 'text-red-500' : 'text-green-500'}>
                {Math.round(metrics.fps)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 