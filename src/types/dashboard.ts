export interface HealthScore {
  overall: number;
  cycle: number;
  nutrition: number;
  exercise: number;
  fertility: number;
  lifestyle: number;
  symptoms: number;
}

export interface HealthInsight {
  type: 'positive' | 'warning' | 'info';
  category: string;
  message: string;
  action?: string;
  actionLink?: string;
}

export interface HealthScoreItem {
  key: keyof Omit<HealthScore, 'overall'>;
  label: string;
  value: number;
  icon: string;
  color: string;
} 