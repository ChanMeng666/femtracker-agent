import { ComponentSkeletonProps } from './types';

export function ComponentSkeleton({ 
  className = '',
  lines = 3,
  height = 'h-4'
}: ComponentSkeletonProps) {
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