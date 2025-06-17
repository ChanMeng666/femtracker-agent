import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { LazyImageProps } from './types';

export function LazyImage({
  src,
  alt,
  className = '',
  placeholder = '/placeholder.svg',
  width = 400,
  height = 300,
  ...props
}: LazyImageProps & { width?: number; height?: number }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    console.warn(`Failed to load image: ${src}`);
  };

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imgRef}>
      {!isLoaded && (
        <Image
          src={placeholder}
          alt="Loading..."
          width={width}
          height={height}
          className="absolute inset-0 w-full h-full object-cover blur-sm"
          priority={false}
        />
      )}
      {isInView && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          priority={false}
          {...props}
        />
      )}
    </div>
  );
} 