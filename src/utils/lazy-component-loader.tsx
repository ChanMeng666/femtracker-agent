import { Suspense, lazy } from 'react';
import { ComponentSkeleton } from '@/components/performance/ComponentSkeleton';

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