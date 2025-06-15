interface SaveBannerProps {
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
}

export function SaveBanner({ hasChanges, isSaving, onSave, onReset }: SaveBannerProps) {
  if (!hasChanges) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center space-x-4">
      <span className="text-gray-800">You have unsaved changes</span>
      <div className="flex space-x-2">
        <button
          onClick={onReset}
          className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm"
        >
          Discard
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-4 py-1.5 bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50 rounded-md text-sm"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
} 