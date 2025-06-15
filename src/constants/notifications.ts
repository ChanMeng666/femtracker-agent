import { Notification, NotificationRule } from '../types/notification';

export const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'cycle',
    title: 'Menstrual Period Prediction',
    message: 'Based on your cycle data, your period is expected to start in 3 days. Remember to prepare your supplies!',
    time: '2025-06-14 09:00',
    isRead: false,
    priority: 'high',
    actionLabel: 'View Cycle',
    actionUrl: '/cycle-tracker'
  },
  {
    id: '2',
    type: 'health',
    title: 'Health Recommendation',
    message: 'Today is day 14 of your cycle. It\'s recommended to consume iron-rich foods like spinach and lean meat.',
    time: '2025-06-14 08:30',
    isRead: false,
    priority: 'medium',
    actionLabel: 'View Nutrition',
    actionUrl: '/nutrition'
  },
  {
    id: '3',
    type: 'reminder',
    title: 'Recording Reminder',
    message: 'You haven\'t recorded your symptoms and mood today yet. Take 1 minute to complete your record!',
    time: '2025-06-14 20:00',
    isRead: true,
    priority: 'low',
    actionLabel: 'Record Now',
    actionUrl: '/symptom-mood'
  },
  {
    id: '4',
    type: 'tip',
    title: 'Health Tip',
    message: 'Regular sleep helps regulate hormone levels. It\'s recommended to maintain 7-8 hours of sleep each night.',
    time: '2025-06-14 07:00',
    isRead: true,
    priority: 'low'
  }
];

export const DEFAULT_NOTIFICATION_RULES: NotificationRule[] = [
  {
    id: 'rule_1',
    name: 'Menstrual Period Reminder',
    type: 'cycle',
    enabled: true,
    schedule: {
      time: '09:00',
      days: [],
      frequency: 'cycle-based'
    },
    message: 'Your menstrual period is expected to start in {days} days',
    conditions: {
      cycleDay: 25 // Remind on cycle day 25
    }
  },
  {
    id: 'rule_2',
    name: 'Ovulation Reminder',
    type: 'cycle',
    enabled: true,
    schedule: {
      time: '08:00',
      days: [],
      frequency: 'cycle-based'
    },
    message: 'Today is your ovulation period. If you\'re trying to conceive, this is the best time!',
    conditions: {
      phase: 'ovulation'
    }
  },
  {
    id: 'rule_3',
    name: 'Evening Recording Reminder',
    type: 'custom',
    enabled: true,
    schedule: {
      time: '20:00',
      days: [1, 2, 3, 4, 5, 6, 0], // Every day
      frequency: 'daily'
    },
    message: 'Remember to record your symptoms and mood for today!'
  },
  {
    id: 'rule_4',
    name: 'Health Tips',
    type: 'health',
    enabled: false,
    schedule: {
      time: '07:00',
      days: [1, 3, 5], // Monday, Wednesday, Friday
      frequency: 'weekly'
    },
    message: 'Daily health tip: {tip}'
  }
]; 