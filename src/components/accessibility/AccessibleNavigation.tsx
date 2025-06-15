import { AccessibleNavigationProps } from './types';

export function AccessibleNavigation({
  items,
  currentPath,
  ariaLabel = 'Main Navigation'
}: AccessibleNavigationProps) {
  return (
    <nav aria-label={ariaLabel} role="navigation">
      <ul className="flex space-x-4" role="menubar">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href;
          
          return (
            <li key={item.href} role="none">
              <a
                href={item.href}
                role="menuitem"
                aria-current={isActive ? 'page' : undefined}
                tabIndex={isActive ? 0 : -1}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
                  ${isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {Icon && <Icon size={18} aria-hidden="true" />}
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
} 