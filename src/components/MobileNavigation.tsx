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
  X
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

const navItems: NavItem[] = [
  { name: '主页', href: '/dashboard', icon: Home, color: 'text-blue-600' },
  { name: '周期', href: '/cycle-tracker', icon: Calendar, color: 'text-pink-600' },
  { name: '症状', href: '/symptom-mood', icon: Heart, color: 'text-red-600' },
  { name: '营养', href: '/nutrition', icon: Apple, color: 'text-green-600' },
  { name: '更多', href: '#', icon: Menu, color: 'text-gray-600' }
];

const moreItems: NavItem[] = [
  { name: '生育健康', href: '/fertility', icon: Heart, color: 'text-purple-600' },
  { name: '运动', href: '/exercise', icon: Dumbbell, color: 'text-orange-600' },
  { name: '生活方式', href: '/lifestyle', icon: Moon, color: 'text-indigo-600' },
  { name: '健康洞察', href: '/insights', icon: TrendingUp, color: 'text-emerald-600' },
  { name: '食谱助手', href: '/recipe', icon: Apple, color: 'text-yellow-600' }
];

export default function MobileNavigation() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // 滚动隐藏导航栏
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

  // 检测设备是否支持触觉反馈
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
      {/* 更多选项模态框 */}
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
              <h3 className="text-lg font-semibold">更多功能</h3>
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

      {/* 底部导航栏 */}
      <nav 
        id="navigation"
        role="navigation"
        aria-label="主要导航"
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
                aria-label={`${item.name}${isActive ? ' (当前页面)' : ''}`}
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

      {/* 底部安全区域占位 */}
      <div className="h-20 md:hidden" />
    </>
  );
}

// 移动端检测Hook
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

// 触觉反馈Hook
export function useHapticFeedback() {
  const hapticFeedback = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 25,
        medium: 50,
        heavy: 100
      };
      navigator.vibrate(patterns[intensity]);
    }
  };

  return hapticFeedback;
} 