export interface Notification {
  id: string;
  type: 'cycle' | 'health' | 'reminder' | 'tip';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionLabel?: string;
  actionUrl?: string;
}

export interface NotificationRule {
  id: string;
  name: string;
  type: 'cycle' | 'health' | 'custom';
  enabled: boolean;
  schedule: {
    time: string;
    days: number[]; // 0=Sunday, 1=Monday, etc.
    frequency: 'daily' | 'weekly' | 'cycle-based';
  };
  message: string;
  conditions?: {
    cycleDay?: number;
    phase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  };
} 