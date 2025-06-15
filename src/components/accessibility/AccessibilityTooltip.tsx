import { useState } from 'react';
import { AccessibilityTooltipProps } from './types';

export function AccessibilityTooltip({ 
  children, 
  tooltip, 
  id 
}: AccessibilityTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative group">
      {children}
      <div
        id={`tooltip-${id}`}
        role="tooltip"
        aria-hidden={!isVisible}
        className="absolute invisible group-hover:visible group-focus:visible bg-gray-900 text-white text-sm rounded px-2 py-1 -top-8 left-1/2 transform -translate-x-1/2 z-50"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {tooltip}
      </div>
    </div>
  );
} 