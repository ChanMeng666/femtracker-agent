import { useMobileNavigation } from '@/hooks/useMobileNavigation';
import { navItems, moreItems } from '@/constants/navigationItems';
import { MoreModal } from './MoreModal';
import { NavigationBar } from './NavigationBar';

export function MobileNavigationLayout() {
  const {
    pathname,
    showMore,
    isVisible,
    setShowMore,
    handleNavClick
  } = useMobileNavigation();

  return (
    <>
      {/* More options modal */}
      <MoreModal
        isOpen={showMore}
        onClose={() => setShowMore(false)}
        items={moreItems}
        currentPath={pathname}
        onNavClick={handleNavClick}
      />

      {/* Bottom navigation bar */}
      <NavigationBar
        items={navItems}
        currentPath={pathname}
        showMore={showMore}
        isVisible={isVisible}
        onNavClick={handleNavClick}
      />

      {/* Bottom safe area spacer */}
      <div className="h-20 md:hidden" />
    </>
  );
} 