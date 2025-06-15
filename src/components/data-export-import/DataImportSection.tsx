import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { RefObject } from 'react';
import { Status } from './types';

interface DataImportSectionProps {
  isImporting: boolean;
  importStatus: Status;
  importMessage: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DataImportSection({
  isImporting,
  importStatus,
  importMessage,
  fileInputRef,
  onImport
}: DataImportSectionProps) {
  return (
    <div className="mobile-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-100 rounded-lg">
          <Upload className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Data Import</h3>
          <p className="text-sm text-muted-foreground">Restore your backed up data</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">
            Supported formats: JSON (.json), CSV (.csv)
          </p>
          <p className="text-xs text-muted-foreground">
            Imported data will be merged with existing data, won&apos;t overwrite existing records
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv"
          onChange={onImport}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="w-full touch-button bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isImporting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload size={18} />
              Select File to Import
            </>
          )}
        </button>

        {importStatus === 'success' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
            <CheckCircle size={18} />
            <span className="text-sm">{importMessage}</span>
          </div>
        )}

        {importStatus === 'error' && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
            <AlertCircle size={18} />
            <span className="text-sm">{importMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
} 