import { Smartphone } from 'lucide-react';
import type { UserPreferences } from '@/types/settings';
import { ToggleSwitch } from './ToggleSwitch';

interface AppBehaviorProps {
  preferences: {
    behavior: {
      autoSave: boolean;
      hapticFeedback: boolean;
      soundEffects: boolean;
      quickActions: boolean;
    };
  };
  onUpdatePreference: <T extends keyof UserPreferences>(
    section: T,
    key: keyof UserPreferences[T],
    value: UserPreferences[T][keyof UserPreferences[T]]
  ) => void;
}

export function AppBehavior({ preferences, onUpdatePreference }: AppBehaviorProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Smartphone className="w-5 h-5 text-indigo-600" />
        </div>
        <h3 className="text-lg font-semibold">App Behavior</h3>
      </div>

      <div className="divide-y divide-gray-100">
        <ToggleSwitch
          enabled={preferences.behavior.autoSave}
          onChange={(value) => onUpdatePreference('behavior', 'autoSave', value)}
          label="Auto Save"
          description="Automatically save your data as you enter it"
        />
        
        <ToggleSwitch
          enabled={preferences.behavior.hapticFeedback}
          onChange={(value) => onUpdatePreference('behavior', 'hapticFeedback', value)}
          label="Haptic Feedback"
          description="Vibrate on button presses and interactions"
        />
        
        <ToggleSwitch
          enabled={preferences.behavior.soundEffects}
          onChange={(value) => onUpdatePreference('behavior', 'soundEffects', value)}
          label="Sound Effects"
          description="Play sounds for notifications and interactions"
        />
        
        <ToggleSwitch
          enabled={preferences.behavior.quickActions}
          onChange={(value) => onUpdatePreference('behavior', 'quickActions', value)}
          label="Quick Actions"
          description="Enable swipe gestures and quick shortcuts"
        />
      </div>
    </div>
  );
} 