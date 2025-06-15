import { useState, useRef } from 'react';
import { VirtualListProps } from './types';

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = ''
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
    setIsScrolling(true);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      aria-label="Virtual list"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={visibleStart + index} style={{ height: itemHeight }}>
              {renderItem(item, visibleStart + index)}
            </div>
          ))}
        </div>
        {isScrolling && (
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            Scrolling...
          </div>
        )}
      </div>
    </div>
  );
} 