import Link from 'next/link';
import { X } from 'lucide-react';
import { MoreModalProps } from './types';

export function MoreModal({ 
  isOpen, 
  onClose, 
  items, 
  currentPath, 
  onNavClick 
}: MoreModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="mobile-modal flex items-end justify-center"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">More Features</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onNavClick(item.href)}
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
  );
} 