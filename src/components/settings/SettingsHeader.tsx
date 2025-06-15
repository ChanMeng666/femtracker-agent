import { Save, RotateCcw } from 'lucide-react';

interface SettingsHeaderProps {
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
}

export function SettingsHeader({ hasChanges, isSaving, onSave, onReset }: SettingsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Personal Settings</h1>
        <p className="text-gray-600">Customize your app experience</p>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={onReset}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
        >
          <RotateCcw size={16} />
          <span>Reset</span>
        </button>
        
        {hasChanges && (
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-4 py-2 bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        )}
      </div>
    </div>
  );
} 