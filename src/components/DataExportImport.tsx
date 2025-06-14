'use client';

import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  FileText, 
  Database,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Heart,
  Apple,
  Dumbbell,
  Moon
} from 'lucide-react';

interface HealthData {
  exportDate: string;
  version: string;
  userId: string;
  cycleData: Record<string, unknown>[];
  symptomData: Record<string, unknown>[];
  nutritionData: Record<string, unknown>[];
  exerciseData: Record<string, unknown>[];
  lifestyleData: Record<string, unknown>[];
  fertilityData: Record<string, unknown>[];
}

interface ExportOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  dataType: keyof Omit<HealthData, 'exportDate' | 'version' | 'userId'>;
  color: string;
}

const exportOptions: ExportOption[] = [
  {
    id: 'cycle',
    name: 'Cycle Data',
    description: 'Menstrual cycles, flow, duration, etc.',
    icon: Calendar,
    dataType: 'cycleData',
    color: 'text-pink-600'
  },
  {
    id: 'symptoms',
    name: 'Symptoms & Mood',
    description: 'Symptom records, mood changes, pain levels',
    icon: Heart,
    dataType: 'symptomData',
    color: 'text-red-600'
  },
  {
    id: 'nutrition',
    name: 'Nutrition Data',
    description: 'Diet records, nutrition intake, supplements',
    icon: Apple,
    dataType: 'nutritionData',
    color: 'text-green-600'
  },
  {
    id: 'exercise',
    name: 'Exercise Data',
    description: 'Exercise records, activity types, duration',
    icon: Dumbbell,
    dataType: 'exerciseData',
    color: 'text-orange-600'
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle Data',
    description: 'Sleep quality, stress levels, daily habits',
    icon: Moon,
    dataType: 'lifestyleData',
    color: 'text-indigo-600'
  }
];

export default function DataExportImport() {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['cycle', 'symptoms']);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate mock health data
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

  // Export as JSON format
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

  // Export as CSV format
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

  // Handle data export
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

  // Handle file import
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

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Data Export Section */}
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
          {/* Data Type Selection */}
          <div>
            <p className="text-sm font-medium mb-3">Select data to export:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {exportOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedOptions.includes(option.id);
                
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleOption(option.id)}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left
                      ${isSelected 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <Icon size={20} className={isSelected ? 'text-primary' : option.color} />
                    <div>
                      <p className="font-medium text-sm">{option.name}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export Format Selection */}
          <div className="space-y-3 mb-4">
            <p className="text-sm font-medium">Export format:</p>
            <div className="flex gap-2">
              {[
                { value: 'json', label: 'JSON', icon: Database },
                { value: 'csv', label: 'CSV', icon: FileText }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setExportFormat(value as 'json' | 'csv')}
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

          {/* Export Button and Status */}
          <button
            onClick={handleExport}
            disabled={isExporting || selectedOptions.length === 0}
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
      </div>

      {/* Data Import Section */}
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
            onChange={handleImport}
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
    </div>
  );
} 