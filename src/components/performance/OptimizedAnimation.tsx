import { useState, useEffect, useRef } from 'react';
import { OptimizedAnimationProps } from './types';

export function OptimizedAnimation({
  children,
  animation = 'fadeIn',
  duration = 300,
  delay = 0
}: OptimizedAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
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