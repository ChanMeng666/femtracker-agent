'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Calendar, 
  Heart, 
  Apple, 
  Clock, 
  X,
  Check,
  Plus,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface Notification {
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

interface NotificationRule {
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

const defaultNotifications: Notification[] = [
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

const defaultRules: NotificationRule[] = [
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

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);
  const [rules, setRules] = useState<NotificationRule[]>(defaultRules);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'rules'>('notifications');
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);

  // Permission request status
  const [permissionStatus, setPermissionStatus] = useState<'default' | 'granted' | 'denied'>('default');

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      return permission === 'granted';
    }
    return false;
  };

  // Send browser notification
  const sendBrowserNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'high'
      });

      browserNotification.onclick = () => {
        if (notification.actionUrl) {
          window.open(notification.actionUrl, '_blank');
        }
        browserNotification.close();
      };

      // Auto-close low priority notifications
      if (notification.priority === 'low') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    }
  };

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
  };

  // Delete notification
  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  // Toggle rule enabled status
  const toggleRule = (ruleId: string) => {
    setRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    );
  };

  // Delete rule
  const deleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  // Test notification
  const testNotification = () => {
    const testNotif: Notification = {
      id: `test_${Date.now()}`,
      type: 'reminder',
      title: 'Test Notification',
      message: 'This is a test notification to verify that the notification function is working properly.',
      time: new Date().toISOString(),
      isRead: false,
      priority: 'medium'
    };

    setNotifications(prev => [testNotif, ...prev]);
    sendBrowserNotification(testNotif);
  };

  const filteredNotifications = showUnreadOnly 
    ? notifications.filter(notif => !notif.isRead)
    : notifications;

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'cycle':
        return Calendar;
      case 'health':
        return Heart;
      case 'reminder':
        return Clock;
      case 'tip':
        return Apple;
      default:
        return Bell;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Permission Request */}
      {permissionStatus !== 'granted' && (
        <div className="mobile-card border-orange-200 bg-orange-50">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-orange-800">Enable Notification Permission</h3>
          </div>
          <p className="text-sm text-orange-700 mb-4">
            To receive timely reminders about important health information, please allow us to send notifications.
          </p>
          <button
            onClick={requestNotificationPermission}
            className="w-full touch-button bg-orange-600 text-white hover:bg-orange-700"
          >
            Enable Notification Permission
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex bg-muted/50 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'notifications'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Notifications {unreadCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'rules'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Reminder Settings
        </button>
      </div>

      {activeTab === 'notifications' ? (
        <>
          {/* Notification Control Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  showUnreadOnly
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {showUnreadOnly ? 'Show All' : 'Unread Only'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {permissionStatus === 'granted' && (
                <button
                  onClick={testNotification}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  Test Notification
                </button>
              )}
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  Mark All Read
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-1">
                  {showUnreadOnly ? 'No Unread Notifications' : 'No Notifications'}
                </p>
                <p className="text-sm">
                  {showUnreadOnly ? 'All notifications have been read' : 'Enable reminder settings to receive timely health advice'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const priorityClass = getPriorityColor(notification.priority);
                
                return (
                  <div
                    key={notification.id}
                    className={`mobile-card ${priorityClass} ${
                      notification.isRead ? 'opacity-70' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white/80">
                        <Icon size={20} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm">{notification.title}</h4>
                          <div className="flex items-center gap-1">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 hover:bg-white/50 rounded transition-colors"
                                title="Mark as Read"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 hover:bg-white/50 rounded transition-colors"
                              title="Delete Notification"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm mt-1 text-gray-700">{notification.message}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {new Date(notification.time).toLocaleString('en-US')}
                          </span>
                          
                          {notification.actionLabel && notification.actionUrl && (
                            <a
                              href={notification.actionUrl}
                              className="text-xs font-medium text-primary hover:underline"
                            >
                              {notification.actionLabel}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        <>
          {/* Reminder Rules Management */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Reminder Rules</h3>
            <button
              onClick={() => setEditingRule({
                id: `rule_${Date.now()}`,
                name: 'New Reminder',
                type: 'custom',
                enabled: true,
                schedule: {
                  time: '09:00',
                  days: [1, 2, 3, 4, 5],
                  frequency: 'weekly'
                },
                message: 'Custom reminder message'
              })}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} />
              New Rule
            </button>
          </div>

          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="mobile-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      rule.type === 'cycle' ? 'bg-pink-100' :
                      rule.type === 'health' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {rule.type === 'cycle' ? (
                        <Calendar size={16} className={
                          rule.type === 'cycle' ? 'text-pink-600' :
                          rule.type === 'health' ? 'text-green-600' : 'text-blue-600'
                        } />
                      ) : rule.type === 'health' ? (
                        <Heart size={16} className="text-green-600" />
                      ) : (
                        <Clock size={16} className="text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{rule.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {rule.schedule.time} • {
                          rule.schedule.frequency === 'daily' ? 'Daily' :
                          rule.schedule.frequency === 'weekly' ? 'Weekly' : 'Cycle-based'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingRule(rule)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit Rule"
                    >
                      <Edit size={16} className="text-gray-600" />
                    </button>
                    
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                    
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        rule.enabled ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          rule.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                <div className="pl-11">
                  <p className="text-sm text-gray-600 mb-2">{rule.message}</p>
                  
                  {rule.conditions && (
                    <div className="text-xs text-muted-foreground">
                      {rule.conditions.cycleDay && (
                        <span>Trigger on cycle day {rule.conditions.cycleDay}</span>
                      )}
                      {rule.conditions.phase && (
                        <span>Trigger during {rule.conditions.phase} phase</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Rule Editing Modal (if needed) */}
      {editingRule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Reminder Rule</h3>
              <button
                onClick={() => setEditingRule(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rule Name</label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={(e) => setEditingRule({...editingRule, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={editingRule.message}
                  onChange={(e) => setEditingRule({...editingRule, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent h-20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  type="time"
                  value={editingRule.schedule.time}
                  onChange={(e) => setEditingRule({
                    ...editingRule, 
                    schedule: {...editingRule.schedule, time: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingRule(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setRules(prev => 
                    prev.map(rule => 
                      rule.id === editingRule.id ? editingRule : rule
                    )
                  );
                  setEditingRule(null);
                }}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 