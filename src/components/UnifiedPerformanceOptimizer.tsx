'use client';

// Re-export all performance optimization components and hooks
export {
  usePerformanceMonitor,
  useMemoryOptimization,
  useResourcePreloader,
  LazyImage,
  ComponentSkeleton,
  LazyComponent,
  OptimizedAnimation,
  VirtualList,
  PerformancePanel,
  createLazyComponent
} from './performance';

export type {
  PerformanceMetrics,
  LazyImageProps,
  ComponentSkeletonProps,
  LazyComponentProps,
  OptimizedAnimationProps,
  VirtualListProps
} from './performance'; 