import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useMobileNavigation() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auto-hide navigation on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY;
      
      if (Math.abs(currentScrollY - lastScrollY) > 10) {
        setIsVisible(!direction);
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Haptic feedback function
  const hapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleMoreClick = () => {
    hapticFeedback();
    setShowMore(!showMore);
  };

  const handleNavClick = (href: string) => {
    hapticFeedback();
    if (href === '#') {
      handleMoreClick();
    } else {
      setShowMore(false);
    }
  };

  return {
    pathname,
    showMore,
    isVisible,
    setShowMore,
    handleMoreClick,
    handleNavClick
  };
} 