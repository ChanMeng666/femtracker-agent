import { useState, useEffect } from 'react';
import type { Notification, NotificationRule } from '../../types/notification';
import { DEFAULT_NOTIFICATIONS, DEFAULT_NOTIFICATION_RULES } from '../../constants/notifications';

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

  return {
    notifications,
    setNotifications,
    rules,
    setRules,
    showUnreadOnly,
    setShowUnreadOnly,
    activeTab,
    setActiveTab,
    editingRule,
    setEditingRule,
    permissionStatus,
    setPermissionStatus,
  };
}; 