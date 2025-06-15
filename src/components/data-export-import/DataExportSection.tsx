import { Download } from 'lucide-react';
import { DataTypeSelector } from './DataTypeSelector';
import { ExportFormatSelector } from './ExportFormatSelector';
import { ExportButton } from './ExportButton';
import { ExportFormat, Status } from './types';

interface DataExportSectionProps {
  selectedOptions: string[];
  exportFormat: ExportFormat;
  isExporting: boolean;
  exportStatus: Status;
  onToggleOption: (optionId: string) => void;
  onFormatChange: (format: ExportFormat) => void;
  onExport: () => void;
}

export function DataExportSection({
  selectedOptions,
  exportFormat,
  isExporting,
  exportStatus,
  onToggleOption,
  onFormatChange,
  onExport
}: DataExportSectionProps) {
  return (
    <div className="mobile-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Download className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Data Export</h3>
          <p className="text-sm text-muted-foreground">Backup your health data</p>
        </div>
      </div>

      <div className="space-y-4">
        <DataTypeSelector 
          selectedOptions={selectedOptions}
          onToggleOption={onToggleOption}
        />

        <ExportFormatSelector 
          exportFormat={exportFormat}
          onFormatChange={onFormatChange}
        />

        <ExportButton
          isExporting={isExporting}
          exportStatus={exportStatus}
          selectedOptionsCount={selectedOptions.length}
          onExport={onExport}
        />
      </div>
    </div>
  );
} 