import React from 'react';
import Link from 'next/link';
import { Check, Trash2 } from 'lucide-react';
import type { Notification } from '../../types/notification';
import { 
  getNotificationIcon, 
  getPriorityColor, 
  getTypeColor, 
  formatNotificationTime,
  filterNotifications,
  sortNotificationsByTime
} from '../../utils/notificationHelpers';

interface NotificationListProps {
  notifications: Notification[];
  showUnreadOnly: boolean;
  onMarkAsRead: (id: string) => void;
  onDeleteNotification: (id: string) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  showUnreadOnly,
  onMarkAsRead,
  onDeleteNotification
}) => {
  const filteredNotifications = sortNotificationsByTime(
    filterNotifications(notifications, showUnreadOnly)
  );

  if (filteredNotifications.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔔</div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          {showUnreadOnly ? 'No unread notifications' : 'No notifications'}
        </h3>
        <p className="text-gray-500">
          {showUnreadOnly 
            ? 'All notifications have been read' 
            : 'New notifications will appear here'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border transition-all ${
            notification.isRead 
              ? 'bg-gray-50 border-gray-200' 
              : getPriorityColor(notification.priority)
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0">
                <span className="text-2xl">
                  {getNotificationIcon(notification.type)}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    getTypeColor(notification.type)
                  }`}>
                    {notification.type.toUpperCase()}
                  </span>
                  
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>
                
                <h4 className="font-semibold text-gray-900 mb-1">
                  {notification.title}
                </h4>
                
                <p className="text-gray-700 text-sm mb-2">
                  {notification.message}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {formatNotificationTime(notification.time)}
                  </span>
                  
                  {notification.actionLabel && notification.actionUrl && (
                    <Link
                      href={notification.actionUrl}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {notification.actionLabel} →
                    </Link>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 ml-2">
              {!notification.isRead && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                  title="Mark as read"
                >
                  <Check size={16} />
                </button>
              )}
              
              <button
                onClick={() => onDeleteNotification(notification.id)}
                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                title="Delete notification"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 