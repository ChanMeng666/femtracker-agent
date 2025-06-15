export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  fps: number;
}

export interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export interface ComponentSkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
}

export interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
}

export interface OptimizedAnimationProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'scaleIn';
  duration?: number;
  delay?: number;
}

export interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
} 