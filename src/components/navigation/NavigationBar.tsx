import { NavigationBarProps } from './types';
import { NavButton } from './NavButton';

export function NavigationBar({ 
  items, 
  currentPath, 
  showMore, 
  isVisible, 
  onNavClick 
}: NavigationBarProps) {
  return (
    <nav 
      id="navigation"
      role="navigation"
      aria-label="Main navigation"
      className={`
        mobile-nav transition-transform duration-300 ease-in-out
        ${isVisible ? 'translate-y-0' : 'translate-y-full'}
        md:hidden
      `}
    >       
      <div className="flex items-center justify-around py-2 px-4" role="menubar">
        {items.map((item) => {
          const isActive = item.href === '#' ? showMore : currentPath === item.href;
          
          return (
            <NavButton
              key={item.name}
              item={item}
              isActive={isActive}
              showMore={showMore}
              onNavClick={onNavClick}
            />
          );
        })}
      </div>
    </nav>
  );
} 