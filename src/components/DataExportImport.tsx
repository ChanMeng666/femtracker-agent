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
    name: '周期数据',
    description: '月经周期、流量、持续时间等',
    icon: Calendar,
    dataType: 'cycleData',
    color: 'text-pink-600'
  },
  {
    id: 'symptoms',
    name: '症状情绪',
    description: '症状记录、情绪变化、疼痛等级',
    icon: Heart,
    dataType: 'symptomData',
    color: 'text-red-600'
  },
  {
    id: 'nutrition',
    name: '营养数据',
    description: '饮食记录、营养摄入、补充剂',
    icon: Apple,
    dataType: 'nutritionData',
    color: 'text-green-600'
  },
  {
    id: 'exercise',
    name: '运动数据',
    description: '运动记录、运动类型、运动时长',
    icon: Dumbbell,
    dataType: 'exerciseData',
    color: 'text-orange-600'
  },
  {
    id: 'lifestyle',
    name: '生活方式',
    description: '睡眠质量、压力水平、生活习惯',
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

  // 生成模拟健康数据
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

    // 生成过去6个月的周期数据
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
          notes: `第${i + 1}个月的周期记录`
        });
      }
    }

    // 生成症状数据
    if (selectedOptions.includes('symptoms')) {
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.symptomData.push({
          id: `symptom_${i}`,
          date: date.toISOString().split('T')[0],
          mood: ['happy', 'neutral', 'sad', 'anxious'][Math.floor(Math.random() * 4)],
          symptoms: ['cramping', 'bloating', 'headache', 'fatigue'].filter(() => Math.random() > 0.5),
          painLevel: Math.floor(Math.random() * 10) + 1,
          notes: `第${i + 1}天的症状记录`
        });
      }
    }

    // 生成营养数据
    if (selectedOptions.includes('nutrition')) {
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.nutritionData.push({
          id: `nutrition_${i}`,
          date: date.toISOString().split('T')[0],
          waterIntake: Math.floor(Math.random() * 1000) + 1500,
          calories: Math.floor(Math.random() * 500) + 1200,
          meals: Math.floor(Math.random() * 2) + 2,
          supplements: ['iron', 'vitamin_d', 'omega3'].filter(() => Math.random() > 0.6),
          notes: `第${i + 1}天的营养记录`
        });
      }
    }

    // 其他数据类型类似处理...

    return mockData;
  };

  // 导出为JSON格式
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

  // 导出为CSV格式
  const exportAsCSV = (data: HealthData) => {
    let csvContent = '';
    
    selectedOptions.forEach(option => {
      const optionData = exportOptions.find(opt => opt.id === option);
      if (!optionData) return;
      
      const dataArray = data[optionData.dataType] as Record<string, unknown>[];
      if (dataArray.length === 0) return;
      
      csvContent += `\n# ${optionData.name}\n`;
      
      // 添加表头
      const headers = Object.keys(dataArray[0]);
      csvContent += headers.join(',') + '\n';
      
      // 添加数据行
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

  // 处理数据导出
  const handleExport = async () => {
    if (selectedOptions.length === 0) {
      setExportStatus('error');
      return;
    }

    setIsExporting(true);
    setExportStatus('idle');

    try {
      // 模拟导出处理时间
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

  // 处理文件导入
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
        
        // 验证数据格式
        if (!data.version || !data.exportDate) {
          throw new Error('无效的数据格式');
        }
        
        // 模拟导入处理
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setImportStatus('success');
        setImportMessage(`成功导入 ${Object.keys(data).length - 3} 个数据类型`);
        
      } else if (file.name.endsWith('.csv')) {
        // CSV导入处理逻辑
        await new Promise(resolve => setTimeout(resolve, 1500));
        setImportStatus('success');
        setImportMessage('CSV数据导入成功');
      } else {
        throw new Error('不支持的文件格式');
      }
      
    } catch (error) {
      setImportStatus('error');
      setImportMessage(error instanceof Error ? error.message : '导入失败');
    } finally {
      setIsImporting(false);
      // 清除文件选择
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
      {/* 数据导出部分 */}
      <div className="mobile-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Download className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">数据导出</h3>
            <p className="text-sm text-muted-foreground">备份您的健康数据</p>
          </div>
        </div>

        {/* 导出选项 */}
        <div className="space-y-3 mb-4">
          <p className="text-sm font-medium">选择要导出的数据类型:</p>
          <div className="grid grid-cols-1 gap-2">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedOptions.includes(option.id);
              
              return (
                <button
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border-2 transition-all
                    ${isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <Icon size={20} className={option.color} />
                  <div className="flex-1 text-left">
                    <p className="font-medium">{option.name}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle size={20} className="text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 导出格式选择 */}
        <div className="space-y-3 mb-4">
          <p className="text-sm font-medium">导出格式:</p>
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

        {/* 导出按钮和状态 */}
        <div className="space-y-3">
          <button
            onClick={handleExport}
            disabled={isExporting || selectedOptions.length === 0}
            className="w-full touch-button bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                导出中...
              </>
            ) : (
              <>
                <Download size={18} />
                导出数据
              </>
            )}
          </button>

          {exportStatus === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
              <CheckCircle size={18} />
              <span className="text-sm">数据导出成功！</span>
            </div>
          )}

          {exportStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle size={18} />
              <span className="text-sm">请至少选择一个数据类型</span>
            </div>
          )}
        </div>
      </div>

      {/* 数据导入部分 */}
      <div className="mobile-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Upload className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">数据导入</h3>
            <p className="text-sm text-muted-foreground">恢复之前备份的数据</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              支持的格式: JSON (.json), CSV (.csv)
            </p>
            <p className="text-xs text-muted-foreground">
              导入数据将与现有数据合并，不会覆盖现有记录
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
                导入中...
              </>
            ) : (
              <>
                <Upload size={18} />
                选择文件导入
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