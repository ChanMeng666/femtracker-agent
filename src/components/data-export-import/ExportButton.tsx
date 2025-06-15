import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Status } from './types';

interface ExportButtonProps {
  isExporting: boolean;
  exportStatus: Status;
  selectedOptionsCount: number;
  onExport: () => void;
}

export function ExportButton({ 
  isExporting, 
  exportStatus, 
  selectedOptionsCount, 
  onExport 
}: ExportButtonProps) {
  return (
    <div className="space-y-3">
      <button
        onClick={onExport}
        disabled={isExporting || selectedOptionsCount === 0}
        className="w-full touch-button bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isExporting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download size={18} />
            Export Data
          </>
        )}
      </button>

      {exportStatus === 'success' && (
        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
          <CheckCircle size={18} />
          <span className="text-sm">Data exported successfully!</span>
        </div>
      )}

      {exportStatus === 'error' && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle size={18} />
          <span className="text-sm">Please select at least one data type</span>
        </div>
      )}
    </div>
  );
} 