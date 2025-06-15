import { useState, useRef } from 'react';
import { ExportFormat, Status, HealthData } from '@/components/data-export-import/types';
import { exportOptions } from '@/constants/exportOptions';

export function useDataExportImport() {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['cycle', 'symptoms']);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<Status>('idle');
  const [importStatus, setImportStatus] = useState<Status>('idle');
  const [importMessage, setImportMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const generateMockData = (): HealthData => {
    const mockData: HealthData = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      userId: 'user_001',
      cycleData: [],
      symptomData: [],
      nutritionData: [],
      exerciseData: [],
      lifestyleData: [],
      fertilityData: []
    };

    // Generate cycle data for the past 6 months
    if (selectedOptions.includes('cycle')) {
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        mockData.cycleData.push({
          id: `cycle_${i}`,
          date: date.toISOString().split('T')[0],
          cycleDay: Math.floor(Math.random() * 28) + 1,
          flow: ['light', 'medium', 'heavy'][Math.floor(Math.random() * 3)],
          duration: Math.floor(Math.random() * 3) + 4,
          notes: `Cycle record for month ${i + 1}`
        });
      }
    }

    // Generate symptom data
    if (selectedOptions.includes('symptoms')) {
      for (let i = 0; i < 15; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.symptomData.push({
          id: `symptom_${i}`,
          date: date.toISOString().split('T')[0],
          symptoms: ['cramping', 'headache', 'bloating'][Math.floor(Math.random() * 3)],
          mood: ['happy', 'calm', 'irritable'][Math.floor(Math.random() * 3)],
          painLevel: Math.floor(Math.random() * 5) + 1,
          notes: `Symptom record for day ${i + 1}`
        });
      }
    }

    // Generate nutrition data
    if (selectedOptions.includes('nutrition')) {
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.nutritionData.push({
          id: `nutrition_${i}`,
          date: date.toISOString().split('T')[0],
          meals: ['breakfast', 'lunch', 'dinner'],
          calories: Math.floor(Math.random() * 500) + 1500,
          water: Math.floor(Math.random() * 4) + 6,
          supplements: ['vitamin_d', 'iron'],
          notes: `Nutrition record for day ${i + 1}`
        });
      }
    }

    // Generate exercise data
    if (selectedOptions.includes('exercise')) {
      for (let i = 0; i < 8; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.exerciseData.push({
          id: `exercise_${i}`,
          date: date.toISOString().split('T')[0],
          type: ['cardio', 'strength', 'yoga'][Math.floor(Math.random() * 3)],
          duration: Math.floor(Math.random() * 60) + 15,
          intensity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          notes: `Exercise record for day ${i + 1}`
        });
      }
    }

    // Generate lifestyle data
    if (selectedOptions.includes('lifestyle')) {
      for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.lifestyleData.push({
          id: `lifestyle_${i}`,
          date: date.toISOString().split('T')[0],
          sleepHours: Math.floor(Math.random() * 4) + 6,
          sleepQuality: ['poor', 'fair', 'good', 'excellent'][Math.floor(Math.random() * 4)],
          stressLevel: Math.floor(Math.random() * 5) + 1,
          notes: `Lifestyle record for day ${i + 1}`
        });
      }
    }

    return mockData;
  };

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

  const exportAsCSV = (data: HealthData) => {
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

  const handleExport = async () => {
    if (selectedOptions.length === 0) {
      setExportStatus('error');
      return;
    }

    setIsExporting(true);
    setExportStatus('idle');

    try {
      // Simulate export processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const data = generateMockData();
      
      if (exportFormat === 'json') {
        exportAsJSON(data);
      } else {
        exportAsCSV(data);
      }
      
      setExportStatus('success');
    } catch {
      setExportStatus('error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus('idle');
    setImportMessage('');

    try {
      const text = await file.text();
      
      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text) as HealthData;
        
        // Validate data format
        if (!data.version || !data.exportDate) {
          throw new Error('Invalid data format');
        }
        
        // Simulate import processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setImportStatus('success');
        setImportMessage(`Successfully imported ${Object.keys(data).length - 3} data types`);
        
      } else if (file.name.endsWith('.csv')) {
        // CSV import processing logic
        await new Promise(resolve => setTimeout(resolve, 1500));
        setImportStatus('success');
        setImportMessage('CSV data imported successfully');
      } else {
        throw new Error('Unsupported file format');
      }
      
    } catch (error) {
      setImportStatus('error');
      setImportMessage(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setIsImporting(false);
      // Clear file selection
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return {
    selectedOptions,
    exportFormat,
    setExportFormat,
    isExporting,
    isImporting,
    exportStatus,
    importStatus,
    importMessage,
    fileInputRef,
    toggleOption,
    handleExport,
    handleImport
  };
} 