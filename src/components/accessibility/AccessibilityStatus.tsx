import { AlertCircle, CheckCircle, Eye, Headphones, Keyboard } from 'lucide-react';
import { useAccessibilityStatus } from '@/hooks/useAccessibilityStatus';

export function AccessibilityStatus() {
  const status = useAccessibilityStatus();

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