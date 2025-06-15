import { AccessibleButtonProps } from './types';
import { announce } from '@/utils/accessibility-announcer';

export function AccessibleButton({
  children,
  onClick,
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  variant = 'primary',
  size = 'medium',
  className,
  type = 'button',
  ...props
}: AccessibleButtonProps) {
  const handleClick = () => {
    if (onClick && !disabled) {
      onClick();
      if (ariaLabel) {
        announce(`${ariaLabel} activated`);
      }
    }
  };

  const baseClasses = `
    touch-button transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-primary',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:outline-secondary',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600'
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
} 