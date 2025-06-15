import { X } from 'lucide-react';
import { NavButtonProps } from './types';

export function NavButton({ item, isActive, showMore = false, onNavClick }: NavButtonProps) {
  const Icon = item.icon;

  return (
    <button
      role="menuitem"
      aria-label={`${item.name}${isActive ? ' (current page)' : ''}`}
      aria-current={isActive && item.href !== '#' ? 'page' : undefined}
      aria-expanded={item.href === '#' ? showMore : undefined}
      onClick={() => onNavClick(item.href)}
      className={`
        flex flex-col items-center justify-center p-3 rounded-2xl
        min-w-16 touch-button haptic-feedback focus-enhanced
        ${isActive ? 'bg-primary/10' : 'hover:bg-muted/50'}
        transition-all duration-200
      `}
    >
      {item.href === '#' && showMore ? (
        <X 
          size={20} 
          aria-hidden="true"
          className={isActive ? 'text-primary' : item.color}
        />
      ) : (
        <Icon 
          size={20} 
          aria-hidden="true"
          className={isActive ? 'text-primary' : item.color}
        />
      )}
      <span 
        className={`
          text-xs mt-1 font-medium
          ${isActive ? 'text-primary' : 'text-muted-foreground'}
        `}
      >
        {item.name}
      </span>
    </button>
  );
} 