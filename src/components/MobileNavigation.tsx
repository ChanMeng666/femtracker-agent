'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Heart, 
  Apple, 
  Dumbbell, 
  Moon, 
  TrendingUp,
  Calendar,
  Menu,
  X,
  Settings
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

const navItems: NavItem[] = [
  { name: 'Home', href: '/dashboard', icon: Home, color: 'text-blue-600' },
  { name: 'Cycle', href: '/cycle-tracker', icon: Calendar, color: 'text-pink-600' },
  { name: 'Symptoms', href: '/symptom-mood', icon: Heart, color: 'text-red-600' },
  { name: 'Nutrition', href: '/nutrition', icon: Apple, color: 'text-green-600' },
  { name: 'More', href: '#', icon: Menu, color: 'text-gray-600' }
];

const moreItems: NavItem[] = [
  { name: 'Fertility Health', href: '/fertility', icon: Heart, color: 'text-purple-600' },
  { name: 'Exercise', href: '/exercise', icon: Dumbbell, color: 'text-orange-600' },
  { name: 'Lifestyle', href: '/lifestyle', icon: Moon, color: 'text-indigo-600' },
  { name: 'Health Insights', href: '/insights', icon: TrendingUp, color: 'text-emerald-600' },
  { name: 'Recipe Helper', href: '/recipe', icon: Apple, color: 'text-yellow-600' },
  { name: 'Settings', href: '/settings', icon: Settings, color: 'text-gray-600' }
];

export default function MobileNavigation() {
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

  // Detect device haptic feedback support
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

  return (
    <>
      {/* More options modal */}
      {showMore && (
        <div 
          className="mobile-modal flex items-end justify-center"
          onClick={() => setShowMore(false)}
        >
          <div 
            className="w-full max-w-sm bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">More Features</h3>
              <button
                onClick={() => setShowMore(false)}
                className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className={`
                      flex flex-col items-center justify-center p-4 rounded-2xl
                      transition-all duration-200 hover:bg-muted/50
                      ${isActive ? 'bg-primary/10 border-2 border-primary/20' : 'bg-muted/20'}
                    `}
                  >
                    <Icon 
                      size={24} 
                      className={`mb-2 ${isActive ? 'text-primary' : item.color}`}
                    />
                    <span className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>  
          </div>
        </div>
      )}

      {/* Bottom navigation bar */}
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
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '#' ? showMore : pathname === item.href;
            
            return (
              <button
                key={item.name}
                role="menuitem"
                aria-label={`${item.name}${isActive ? ' (current page)' : ''}`}
                aria-current={isActive && item.href !== '#' ? 'page' : undefined}
                aria-expanded={item.href === '#' ? showMore : undefined}
                onClick={() => handleNavClick(item.href)}
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
          })}
        </div>
      </nav>

      {/* Bottom safe area spacer */}
      <div className="h-20 md:hidden" />
    </>
  );
}

// Mobile device detection Hook
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// Haptic feedback Hook
export function useHapticFeedback() {
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  return { triggerHaptic };
} 