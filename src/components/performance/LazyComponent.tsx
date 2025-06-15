import { useState, useEffect, useRef } from 'react';
import { LazyComponentProps } from './types';
import { ComponentSkeleton } from './ComponentSkeleton';

export function LazyComponent({ 
  children, 
  fallback,
  threshold = 0.1 
}: LazyComponentProps) {
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