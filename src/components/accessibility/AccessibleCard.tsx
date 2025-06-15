import { AccessibleCardProps } from './types';

export function AccessibleCard({
  children,
  title,
  description,
  onClick,
  selected = false,
  className,
  role,
  ...props
}: AccessibleCardProps) {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      role={onClick ? 'button' : role}
      aria-pressed={onClick && selected ? 'true' : undefined}
      aria-label={title}
      aria-describedby={description ? `${title}-desc` : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`
        mobile-card transition-all duration-200
        ${onClick ? 'hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer' : ''}
        ${selected ? 'ring-2 ring-primary bg-primary/5' : ''}
        ${className || ''}
      `}
      {...props}
    >
      {title && (
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
      )}
      
      {description && (
        <p id={`${title}-desc`} className="text-muted-foreground text-sm mb-4">
          {description}
        </p>
      )}
      
      {children}
    </Component>
  );
} 