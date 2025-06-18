import { useDataExportImport } from '@/hooks/useDataExportImport';
import { DataExportSection } from './DataExportSection';
import { DataImportSection } from './DataImportSection';

export function DataExportImportContent() {
  const {
    selectedOptions,
    exportFormat,
    setExportFormat,
    isExporting,
    isImporting,
    exportStatus,
    importStatus,
    importMessage,
    exportToCloud,
    setExportToCloud,
    cloudExportUrl,
    fileInputRef,
    toggleOption,
    handleExport,
    handleImport
  } = useDataExportImport();

  return (
    <div className="space-y-6">
      <DataExportSection
        selectedOptions={selectedOptions}
        exportFormat={exportFormat}
        isExporting={isExporting}
        exportStatus={exportStatus}
        exportToCloud={exportToCloud}
        cloudExportUrl={cloudExportUrl}
        onToggleOption={toggleOption}
        onFormatChange={setExportFormat}
        onExport={handleExport}
        onToggleCloudExport={setExportToCloud}
      />
      
      <DataImportSection
        isImporting={isImporting}
        importStatus={importStatus}
        importMessage={importMessage}
        fileInputRef={fileInputRef}
        onImport={handleImport}
      />
    </div>
  );
} 