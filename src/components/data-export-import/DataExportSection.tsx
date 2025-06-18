import { Download, Cloud, Link } from 'lucide-react';
import { DataTypeSelector } from './DataTypeSelector';
import { ExportFormatSelector } from './ExportFormatSelector';
import { ExportButton } from './ExportButton';
import { ExportFormat, Status } from './types';

interface DataExportSectionProps {
  selectedOptions: string[];
  exportFormat: ExportFormat;
  isExporting: boolean;
  exportStatus: Status;
  exportToCloud?: boolean;
  cloudExportUrl?: string;
  onToggleOption: (optionId: string) => void;
  onFormatChange: (format: ExportFormat) => void;
  onExport: () => void;
  onToggleCloudExport?: (enabled: boolean) => void;
}

export function DataExportSection({
  selectedOptions,
  exportFormat,
  isExporting,
  exportStatus,
  exportToCloud = false,
  cloudExportUrl = '',
  onToggleOption,
  onFormatChange,
  onExport,
  onToggleCloudExport
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

        {/* Cloud Export Option */}
        {onToggleCloudExport && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="export-to-cloud"
                checked={exportToCloud}
                onChange={(e) => onToggleCloudExport(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="export-to-cloud" className="flex items-center gap-2 text-sm font-medium">
                <Cloud className="w-4 h-4 text-blue-600" />
                Export to Cloud Storage
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              Save your export file to cloud storage for easy sharing and backup
            </p>
          </div>
        )}

        {/* Cloud Export URL Display */}
        {cloudExportUrl && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Link className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Cloud Export Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={cloudExportUrl}
                readOnly
                className="flex-1 px-2 py-1 text-xs bg-white border border-green-300 rounded"
              />
              <button
                onClick={() => navigator.clipboard.writeText(cloudExportUrl)}
                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
              >
                Copy
              </button>
            </div>
          </div>
        )}

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