import { ComponentType } from 'react';

export interface HealthData {
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

export interface ExportOption {
  id: string;
  name: string;
  description: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  dataType: keyof Omit<HealthData, 'exportDate' | 'version' | 'userId'>;
  color: string;
}

export type ExportFormat = 'json' | 'csv';
export type Status = 'idle' | 'success' | 'error'; 