import { CheckCircle, AlertCircle } from 'lucide-react';
import { Status } from './types';
import { ActionButton } from '@/components/shared/ActionButton';

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
      <ActionButton
        onClick={onExport}
        disabled={isExporting || selectedOptionsCount === 0}
        loading={isExporting}
        variant="primary"
        size="lg"
        fullWidth
        icon={isExporting ? undefined : "📥"}
      >
        {isExporting ? 'Exporting...' : 'Export Data'}
      </ActionButton>

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