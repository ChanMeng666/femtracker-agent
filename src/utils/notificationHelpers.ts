import type { Notification } from '../types/notification';

export const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'cycle':
      return '📅';
    case 'health':
      return '💊';
    case 'reminder':
      return '⏰';
    case 'tip':
      return '💡';
    default:
      return '🔔';
  }
};

export const getPriorityColor = (priority: Notification['priority']) => {
  switch (priority) {
    case 'high':
      return 'border-red-200 bg-red-50 text-red-800';
    case 'medium':
      return 'border-yellow-200 bg-yellow-50 text-yellow-800';
    case 'low':
      return 'border-green-200 bg-green-50 text-green-800';
    default:
      return 'border-gray-200 bg-gray-50 text-gray-800';
  }
};

export const getTypeColor = (type: Notification['type']) => {
  switch (type) {
    case 'cycle':
      return 'bg-pink-100 text-pink-800';
    case 'health':
      return 'bg-green-100 text-green-800';
    case 'reminder':
      return 'bg-blue-100 text-blue-800';
    case 'tip':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const formatNotificationTime = (timeString: string) => {
  const date = new Date(timeString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
};

export const sortNotificationsByTime = (notifications: Notification[]) => {
  return [...notifications].sort((a, b) => {
    // Sort by priority first (high > medium > low), then by time (newest first)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });
};

export const filterNotifications = (notifications: Notification[], showUnreadOnly: boolean) => {
  if (showUnreadOnly) {
    return notifications.filter(notification => !notification.isRead);
  }
  return notifications;
}; 