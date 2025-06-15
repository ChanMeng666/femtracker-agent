import { HealthData, ExportFormat } from '@/components/data-export-import/types';
import { exportOptions } from '@/constants/exportOptions';

export function useFileExport() {
  const exportAsJSON = (data: HealthData) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `femtracker-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = (data: HealthData, selectedOptions: string[]) => {
    let csvContent = '';
    
    selectedOptions.forEach(option => {
      const optionData = exportOptions.find(opt => opt.id === option);
      if (!optionData) return;
      
      const dataArray = data[optionData.dataType] as Record<string, unknown>[];
      if (dataArray.length === 0) return;
      
      csvContent += `\n# ${optionData.name}\n`;
      
      // Add headers
      const headers = Object.keys(dataArray[0]);
      csvContent += headers.join(',') + '\n';
      
      // Add data rows
      dataArray.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          if (Array.isArray(value)) {
            return `"${value.join(';')}"`;
          }
          return `"${value}"`;
        });
        csvContent += values.join(',') + '\n';
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `femtracker-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportData = (data: HealthData, format: ExportFormat, selectedOptions: string[]) => {
    if (format === 'json') {
      exportAsJSON(data);
    } else {
      exportAsCSV(data, selectedOptions);
    }
  };

  return {
    exportAsJSON,
    exportAsCSV,
    exportData
  };
} 