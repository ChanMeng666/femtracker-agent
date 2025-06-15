import { useState, useEffect } from 'react';
import type { Notification, NotificationRule } from '../types/notification';
import { DEFAULT_NOTIFICATIONS, DEFAULT_NOTIFICATION_RULES } from '../constants/notifications';

export const useNotificationState = () => {
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFICATIONS);
  const [rules, setRules] = useState<NotificationRule[]>(DEFAULT_NOTIFICATION_RULES);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'rules'>('notifications');
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);
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

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })));
  };

  const toggleRule = (ruleId: string) => {
    setRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    );
  };

  const deleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const testNotification = () => {
    const testNotif: Notification = {
      id: 'test_' + Date.now(),
      type: 'reminder',
      title: 'Test Notification',
      message: 'This is a test notification to verify that notifications are working properly!',
      time: new Date().toISOString(),
      isRead: false,
      priority: 'medium'
    };

    // Add to notifications list
    setNotifications(prev => [testNotif, ...prev]);

    // Send browser notification if permission granted
    sendBrowserNotification(testNotif);
  };

  return {
    notifications,
    rules,
    showUnreadOnly,
    activeTab,
    editingRule,
    permissionStatus,
    setShowUnreadOnly,
    setActiveTab,
    setEditingRule,
    requestNotificationPermission,
    sendBrowserNotification,
    markAsRead,
    deleteNotification,
    clearAllNotifications,
    markAllAsRead,
    toggleRule,
    deleteRule,
    testNotification
  };
}; 