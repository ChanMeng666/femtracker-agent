import { useDataExportImport } from '@/hooks/useDataExportImport';
import { useDataDeletion } from '@/hooks/useDataDeletion';
import { DataExportSection } from './DataExportSection';
import { DataImportSection } from './DataImportSection';
import { DataDeletionSection } from './DataDeletionSection';

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

  const {
    isDeleting,
    deleteStatus,
    deleteMessage,
    handleDeleteData,
    resetStatus
  } = useDataDeletion();

  return (
    <div className="space-y-8">
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

      <DataDeletionSection
        onDeleteData={handleDeleteData}
        isDeleting={isDeleting}
        deleteStatus={deleteStatus}
        deleteMessage={deleteMessage}
      />
    </div>
  );
} 