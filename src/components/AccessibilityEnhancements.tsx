'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Eye, Headphones, Keyboard } from 'lucide-react';

interface AccessibilityFeatures {
  announcements: boolean;
  keyboardNavigation: boolean;
  screenReaderOptimized: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [features, setFeatures] = useState<AccessibilityFeatures>({
    announcements: false,
    keyboardNavigation: false,
    screenReaderOptimized: false,
    highContrast: false,
    reducedMotion: false
  });

  useEffect(() => {
    // Detect system preference settings
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setFeatures(prev => ({
      ...prev,
      reducedMotion: mediaQuery.matches
    }));

    const handleChange = (e: MediaQueryListEvent) => {
      setFeatures(prev => ({
        ...prev,
        reducedMotion: e.matches
      }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Apply accessibility styles
    const root = document.documentElement;
    
    if (features.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (features.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }, [features.highContrast, features.reducedMotion]);

  return (
    <div className="accessibility-enhanced">
      {children}
      <LiveRegion />
      <SkipLinks />
    </div>
  );
}

// Live notification area for screen readers
export function LiveRegion() {
  return (
    <div
      id="live-region"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      role="status"
    />
  );
}

// Skip links for keyboard navigation
export function SkipLinks() {
  return (
    <div className="skip-links">
      <a
        href="#main-content"
        className="skip-link"
        onFocus={(e) => e.target.classList.add('focused')}
        onBlur={(e) => e.target.classList.remove('focused')}
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="skip-link" 
        onFocus={(e) => e.target.classList.add('focused')}
        onBlur={(e) => e.target.classList.remove('focused')}
      >
        Skip to navigation menu
      </a>
    </div>
  );
}

// Accessible tooltip
export function AccessibilityTooltip({ 
  children, 
  tooltip, 
  id 
}: { 
  children: React.ReactNode; 
  tooltip: string; 
  id: string;
}) {
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

// Accessible button component
export function AccessibleButton({
  children,
  onClick,
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  variant = 'primary',
  size = 'medium',
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  [key: string]: any;
}) {
  const announce = (message: string) => {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  };

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
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Accessible form input component
export function AccessibleInput({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helpText,
  ...props
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  [key: string]: any;
}) {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {required && <span aria-label="Required" className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={`${helpText ? helpId : ''} ${error ? errorId : ''}`.trim()}
        className={`
          mobile-input w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
          ${error ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}
        `}
        {...props}
      />
      
      {helpText && (
        <p id={helpId} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
}

// Accessible card component
export function AccessibleCard({
  children,
  title,
  description,
  onClick,
  selected = false,
  ...props
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  onClick?: () => void;
  selected?: boolean;
  [key: string]: any;
}) {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-pressed={onClick && selected ? 'true' : undefined}
      aria-label={title}
      aria-describedby={description ? `${title}-desc` : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`
        mobile-card transition-all duration-200
        ${onClick ? 'hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer' : ''}
        ${selected ? 'ring-2 ring-primary bg-primary/5' : ''}
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

// Accessible navigation component
export function AccessibleNavigation({
  items,
  currentPath,
  ariaLabel = 'Main Navigation'
}: {
  items: Array<{
    href: string;
    label: string;
    icon?: React.ComponentType<any>;
  }>;
  currentPath: string;
  ariaLabel?: string;
}) {
  return (
    <nav aria-label={ariaLabel} role="navigation">
      <ul className="flex space-x-4" role="menubar">
        {items.map((item, index) => {
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

// Accessibility status checker
export function AccessibilityStatus() {
  const [status, setStatus] = useState({
    keyboardNavigation: false,
    screenReader: false,
    colorContrast: false,
    textSize: false
  });

  useEffect(() => {
    // Check various accessibility features
    const checkAccessibility = () => {
      setStatus({
        keyboardNavigation: document.activeElement !== document.body,
        screenReader: 'speechSynthesis' in window,
        colorContrast: window.matchMedia('(prefers-contrast: high)').matches,
        textSize: window.matchMedia('(prefers-contrast: high)').matches
      });
    };

    checkAccessibility();
    window.addEventListener('focus', checkAccessibility);
    return () => window.removeEventListener('focus', checkAccessibility);
  }, []);

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Accessibility Status</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {[
          { key: 'keyboardNavigation', label: 'Keyboard Navigation', icon: Keyboard },
          { key: 'screenReader', label: 'Screen Reader', icon: Headphones },
          { key: 'colorContrast', label: 'High Contrast', icon: Eye },
          { key: 'textSize', label: 'Text Size', icon: CheckCircle }
        ].map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center gap-2">
            <Icon size={16} />
            <span className={status[key as keyof typeof status] ? 'text-green-600' : 'text-gray-500'}>
              {label}
            </span>
            {status[key as keyof typeof status] ? (
              <CheckCircle size={14} className="text-green-600" />
            ) : (
              <AlertCircle size={14} className="text-gray-400" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 