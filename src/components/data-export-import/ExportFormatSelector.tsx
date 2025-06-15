import { Database, FileText } from 'lucide-react';
import { ExportFormat } from './types';

interface ExportFormatSelectorProps {
  exportFormat: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
}

export function ExportFormatSelector({ exportFormat, onFormatChange }: ExportFormatSelectorProps) {
  const formatOptions = [
    { value: 'json' as ExportFormat, label: 'JSON', icon: Database },
    { value: 'csv' as ExportFormat, label: 'CSV', icon: FileText }
  ];

  return (
    <div className="space-y-3 mb-4">
      <p className="text-sm font-medium">Export format:</p>
      <div className="flex gap-2">
        {formatOptions.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => onFormatChange(value)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all
              ${exportFormat === value 
                ? 'border-primary bg-primary/5 text-primary' 
                : 'border-border hover:border-primary/50'
              }
            `}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
} 